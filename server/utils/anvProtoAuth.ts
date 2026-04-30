import { createHmac, timingSafeEqual } from "node:crypto";
import type { H3Event } from "h3";

const AUTH_COOKIE_NAME = "anv_proto_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type SessionPayload = {
	username: string;
	expiresAt: number;
};

type AuthEnv = {
	username: string;
	password: string;
	secret: string;
};

type BasicAuthEnv = {
	username: string;
	password: string;
};

const toBase64Url = (value: string): string => {
	return Buffer.from(value, "utf-8").toString("base64url");
};

const fromBase64Url = (value: string): string => {
	return Buffer.from(value, "base64url").toString("utf-8");
};

const signValue = (value: string, secret: string): string => {
	return createHmac("sha256", secret).update(value).digest("base64url");
};

const buildToken = (payload: SessionPayload, secret: string): string => {
	const serialized = JSON.stringify(payload);
	const payloadPart = toBase64Url(serialized);
	const signaturePart = signValue(payloadPart, secret);
	return `${payloadPart}.${signaturePart}`;
};

const verifyToken = (token: string, secret: string): SessionPayload | null => {
	const split = token.split(".");
	if (split.length !== 2) {
		return null;
	}

	const payloadPart = split[0] ?? "";
	const signaturePart = split[1] ?? "";
	const expected = signValue(payloadPart, secret);

	const actualBuffer = Buffer.from(signaturePart);
	const expectedBuffer = Buffer.from(expected);
	if (actualBuffer.length !== expectedBuffer.length) {
		return null;
	}
	if (!timingSafeEqual(actualBuffer, expectedBuffer)) {
		return null;
	}

	try {
		const payload = JSON.parse(fromBase64Url(payloadPart)) as SessionPayload;
		if (payload.expiresAt <= Date.now()) {
			return null;
		}
		return payload;
	} catch {
		return null;
	}
};

const getAuthEnv = (
	options: { strict: boolean } = { strict: true },
): AuthEnv | null => {
	const username = process.env.ANV_PROTO_USERNAME ?? "";
	const password = process.env.ANV_PROTO_PASSWORD ?? "";
	const secret = process.env.ANV_PROTO_SESSION_SECRET ?? "";

	if (!username || !password || !secret) {
		if (!options.strict) {
			return null;
		}
		throw createError({
			statusCode: 500,
			message:
				"Missing ANV_PROTO_USERNAME, ANV_PROTO_PASSWORD, or ANV_PROTO_SESSION_SECRET.",
		});
	}

	return { username, password, secret };
};

const getBasicAuthEnv = (
	options: { strict: boolean } = { strict: true },
): BasicAuthEnv | null => {
	const username = process.env.ANV_PROTO_USERNAME ?? "";
	const password = process.env.ANV_PROTO_PASSWORD ?? "";

	if (!username || !password) {
		if (!options.strict) {
			return null;
		}
		throw createError({
			statusCode: 500,
			message: "Missing ANV_PROTO_USERNAME or ANV_PROTO_PASSWORD.",
		});
	}

	return { username, password };
};

const parseBasicAuthHeader = (value: string): { username: string; password: string } | null => {
	if (!value.startsWith("Basic ")) {
		return null;
	}
	const encoded = value.slice(6).trim();
	if (!encoded) {
		return null;
	}
	try {
		const decoded = Buffer.from(encoded, "base64").toString("utf-8");
		const separatorIndex = decoded.indexOf(":");
		if (separatorIndex < 0) {
			return null;
		}
		return {
			username: decoded.slice(0, separatorIndex),
			password: decoded.slice(separatorIndex + 1),
		};
	} catch {
		return null;
	}
};

export const validateLogin = (
	username: string,
	password: string,
): { valid: boolean; canonicalUsername: string } => {
	const auth = getAuthEnv({ strict: true });
	if (!auth) {
		throw createError({
			statusCode: 500,
			message: "Auth configuration is missing.",
		});
	}
	const valid = username === auth.username && password === auth.password;
	return { valid, canonicalUsername: auth.username };
};

export const setAuthCookie = (event: H3Event, username: string): void => {
	const auth = getAuthEnv({ strict: true });
	if (!auth) {
		throw createError({
			statusCode: 500,
			message: "Auth configuration is missing.",
		});
	}
	const token = buildToken(
		{
			username,
			expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
		},
		auth.secret,
	);

	setCookie(event, AUTH_COOKIE_NAME, token, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge: SESSION_TTL_SECONDS,
	});
};

export const clearAuthCookie = (event: H3Event): void => {
	deleteCookie(event, AUTH_COOKIE_NAME, {
		path: "/",
	});
};

export const getSession = (event: H3Event): SessionPayload | null => {
	const auth = getAuthEnv({ strict: false });
	if (!auth) {
		return null;
	}
	const token = getCookie(event, AUTH_COOKIE_NAME);
	if (!token) {
		return null;
	}
	return verifyToken(token, auth.secret);
};

export const requireSession = (event: H3Event): SessionPayload => {
	const session = getSession(event);
	if (!session) {
		throw createError({ statusCode: 401, message: "Unauthorized" });
	}
	return session;
};

export const requireBasicAuth = (event: H3Event): { username: string } => {
	const auth = getBasicAuthEnv({ strict: true });
	if (!auth) {
		throw createError({ statusCode: 500, message: "Auth configuration is missing." });
	}

	const header = getHeader(event, "authorization") ?? "";
	const parsed = parseBasicAuthHeader(header);
	if (!parsed) {
		setHeader(event, "WWW-Authenticate", 'Basic realm="ANV Prototype", charset="UTF-8"');
		throw createError({ statusCode: 401, message: "Unauthorized" });
	}

	const valid = parsed.username === auth.username && parsed.password === auth.password;
	if (!valid) {
		setHeader(event, "WWW-Authenticate", 'Basic realm="ANV Prototype", charset="UTF-8"');
		throw createError({ statusCode: 401, message: "Unauthorized" });
	}

	return { username: parsed.username };
};

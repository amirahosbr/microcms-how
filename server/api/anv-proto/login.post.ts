import { setAuthCookie, validateLogin } from "~~/server/utils/anvProtoAuth";

type LoginBody = {
	username?: string;
	password?: string;
};

export default eventHandler(async (event) => {
	const body = await readBody<LoginBody>(event);
	const username = body.username ?? "";
	const password = body.password ?? "";

	if (!username || !password) {
		throw createError({
			statusCode: 400,
			message: "Username and password are required.",
		});
	}

	const result = validateLogin(username, password);
	if (!result.valid) {
		throw createError({
			statusCode: 401,
			message: "Invalid credentials.",
		});
	}

	setAuthCookie(event, result.canonicalUsername);
	return {
		ok: true,
	};
});

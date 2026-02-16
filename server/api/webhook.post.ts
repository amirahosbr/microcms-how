/**
 * microCMS Webhook: invalidate cache when content changes
 *
 * Configure microCMS カスタム通知 to POST to https://your-domain.com/api/webhook
 * Set MICROCMS_WEBHOOK_SECRET in microCMS and in env; we verify x-microcms-signature (HMAC-SHA256).
 * On success we clear Nitro handler cache so list/article/featured-news serve fresh data on next request.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

const config = useRuntimeConfig();
const secret = config.microcms?.webhookSecret ?? process.env.MICROCMS_WEBHOOK_SECRET ?? "";

function verifySignature(body: string, signature: string | undefined): boolean {
	if (!secret || !signature) return false;
	const expected = createHmac("sha256", secret).update(body).digest("hex");
	try {
		return timingSafeEqual(Buffer.from(signature, "utf8"), Buffer.from(expected, "utf8"));
	} catch {
		return false;
	}
}

export default defineEventHandler(async (event) => {
	if (getMethod(event) !== "POST") {
		throw createError({ statusCode: 405, message: "Method Not Allowed" });
	}

	const rawBody = await readRawBody(event);
	const body = rawBody ?? "";
	const signature = getHeader(event, "x-microcms-signature");

	if (!verifySignature(body, signature)) {
		throw createError({ statusCode: 401, message: "Invalid signature" });
	}

	const storage = useStorage("cache");
	const keys = await storage.getKeys("nitro");
	await Promise.all(keys.map((k) => storage.removeItem(k)));

	return { ok: true, cleared: keys.length };
});

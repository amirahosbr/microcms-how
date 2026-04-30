import { requireBasicAuth } from "~~/server/utils/anvProtoAuth";

export default defineEventHandler((event) => {
	const path = getRequestURL(event).pathname;
	const protectedPage = path.startsWith("/anv-proto");
	const protectedApi = path.startsWith("/api/anv-proto");
	const sessionApi = path === "/api/anv-proto/session";
	const loginApi = path === "/api/anv-proto/login";
	const logoutApi = path === "/api/anv-proto/logout";

	if (!protectedPage && !protectedApi) {
		return;
	}
	if (sessionApi || loginApi || logoutApi) {
		return;
	}

	requireBasicAuth(event);
});

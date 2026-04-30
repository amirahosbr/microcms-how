import { clearAuthCookie } from "~~/server/utils/anvProtoAuth";

export default eventHandler(async (event) => {
	clearAuthCookie(event);
	return {
		ok: true,
	};
});

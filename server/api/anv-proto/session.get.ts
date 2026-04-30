import { getSession } from "~~/server/utils/anvProtoAuth";

export default eventHandler(async (event) => {
	const session = getSession(event);
	return {
		authenticated: !!session,
		username: session?.username ?? null,
	};
});

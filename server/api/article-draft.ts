/**
 * Server API: Article Draft (preview detail)
 *
 * @file ./server/api/article-draft.ts
 * @description microCMSの下書きプレビュー詳細データを取得します。
 * @module API
 */

import type { MicroCMSQueries } from "microcms-js-sdk";
import { useMicroCMSClient } from "~~/shared/utils/microcms";

const serializeResponse = (data: unknown): unknown => {
	try {
		return JSON.parse(JSON.stringify(data));
	} catch {
		return data;
	}
};

export default eventHandler(async (event) => {
	const url = getRequestURL(event);
	const p = url.searchParams;

	const endpoint = p.get("endpoint") ?? undefined;
	const contentId = p.get("contentId") ?? p.get("id") ?? undefined;
	const fields = p.get("fields") ?? undefined;
	const draftKey = p.get("draftKey") ?? undefined;
	const depth = p.get("depth") ?? undefined;

	if (!endpoint) {
		throw createError({ statusCode: 400, message: "endpoint is required" });
	}
	if (!contentId) {
		throw createError({ statusCode: 400, message: "contentId is required" });
	}
	if (!draftKey) {
		throw createError({ statusCode: 400, message: "draftKey is required" });
	}

	try {
		const client = useMicroCMSClient();
		const queries: MicroCMSQueries = { draftKey };

		if (fields) queries.fields = fields;
		if (depth) queries.depth = Number(depth) as 1 | 2 | 3;

		const detail = await client.getListDetail<unknown>({
			endpoint,
			contentId,
			queries,
		});

		return serializeResponse(detail);
	} catch (error) {
		console.error("[API] Failed to fetch draft article:", error);
		throw createError({
			statusCode: 500,
			message: "Failed to fetch draft content",
		});
	}
});


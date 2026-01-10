/**
 * Server API: Article (article detail)
 *
 * @file ./server/api/article.get.ts
 * @description microCMSから詳細データを取得します。
 * @module API
 */

import type { MicroCMSQueries } from "microcms-js-sdk";
import type { H3Event } from "h3";
import type { ArticleApiQuery } from "~~/shared/types/microCMS";
import { useMicroCMSClient } from "~~/shared/utils/microcms";

// Parse Query
export const parseDetailQuery = (event: H3Event): ArticleApiQuery => {
	const url = getRequestURL(event);
	const p = url.searchParams;
	return {
		endpoint: p.get("endpoint") ?? undefined,
		contentId: p.get("contentId") ?? p.get("id") ?? undefined,
		fields: p.get("fields") ?? undefined,
		draftKey: p.get("draftKey") ?? undefined,
		depth: p.get("depth") ?? undefined,
	};
};

// Get Article
export default cachedEventHandler(
	eventHandler(async (event) => {
		const { endpoint, contentId, fields, draftKey, depth } =
			parseDetailQuery(event);

		if (!endpoint) {
			throw createError({ statusCode: 400, message: "endpoint is required" });
		}
		if (!contentId) {
			throw createError({ statusCode: 400, message: "contentId is required" });
		}

		try {
			const client = useMicroCMSClient();

			// Set Queries - Include nested fields for category and location
			const queries: MicroCMSQueries = {};

			// Default fields to include nested category and location data + contentBlocks (repeat field)
			if (fields) {
				queries.fields = fields;
			} else {
				// Default: include all fields with nested category and location + i18n fields + contentBlocks
				queries.fields =
					"id,createdAt,updatedAt,publishedAt,revisedAt,title,title_en,category.id,category.title,category.title_en,category.createdAt,category.updatedAt,category.publishedAt,category.revisedAt,location.id,location.title,location.title_en,location.createdAt,location.updatedAt,location.publishedAt,location.revisedAt,image,content,information,external_url,publication,publication_en,contentBlocks.fieldId,contentBlocks.name,contentBlocks.role,contentBlocks.role_en,contentBlocks.bio,contentBlocks.bio_en,contentBlocks.image,contentBlocks.content,contentBlocks.content_en";
			}

			if (draftKey) queries.draftKey = draftKey;
			if (depth) queries.depth = Number(depth) as 1 | 2 | 3;

			// Get Detail
			const detail = await client.getListDetail<unknown>({
				endpoint,
				contentId,
				queries,
			});

			return detail;
		} catch (error) {
			console.error("[API] Failed to fetch article:", error);
			throw createError({
				statusCode: 500,
				message: "Failed to fetch content",
			});
		}
	}),
	{
		maxAge: 60,
	},
);

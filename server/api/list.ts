/**
 * Server API: List (all news list)
 *
 * @file ./server/api/list.ts
 * @description microCMSから一覧データを取得します。
 * @module API
 */

import type { MicroCMSListResponse, MicroCMSQueries } from "microcms-js-sdk";
import type { H3Event } from "h3";
import type { ListApiQuery } from "~~/shared/types/microCMS";
import { useMicroCMSClient } from "~~/shared/utils/microcms";

// Parse Query
export const parseListQuery = (event: H3Event): ListApiQuery => {
	const url = getRequestURL(event);
	const p = url.searchParams;
	return {
		endpoint: p.get("endpoint") ?? undefined,
		fields: p.get("fields") ?? undefined,
		filters: p.get("filters") ?? undefined,
		q: p.get("q") ?? undefined,
		limit: p.get("limit") ?? undefined,
		offset: p.get("offset") ?? undefined,
		orders: p.get("orders") ?? undefined,
		draftKey: p.get("draftKey") ?? undefined,
	};
};

// Default fields to include nested category and location data
const DEFAULT_FIELDS =
	"id,createdAt,updatedAt,publishedAt,revisedAt,title,title_en,category.id,category.title,category.title_en,category.createdAt,category.updatedAt,category.publishedAt,category.revisedAt,location.id,location.title,location.title_en,location.createdAt,location.updatedAt,location.publishedAt,location.revisedAt,image,content,external_url,publication,publication_en";

// Get List
export default cachedEventHandler(
	eventHandler(async (event) => {
		const { endpoint, limit, offset, fields, filters, q, orders, draftKey } =
			parseListQuery(event);

		if (!endpoint) {
			throw createError({ statusCode: 400, message: "endpoint is required" });
		}

		try {
			const client = useMicroCMSClient();

			// Set Queries
			const baseQueries: MicroCMSQueries = {};

			// Use provided fields or default fields that include nested data
			baseQueries.fields = fields ?? DEFAULT_FIELDS;

			if (filters) baseQueries.filters = filters;
			if (q) baseQueries.q = q;
			if (orders) baseQueries.orders = orders;
			if (draftKey) baseQueries.draftKey = draftKey;

			// Get All
			const fetchAll = async (): Promise<MicroCMSListResponse<unknown>> => {
				const contents = await client.getAllContents<unknown>({
					endpoint,
					queries: baseQueries,
				});
				return {
					contents,
					totalCount: contents.length,
					limit: contents.length,
					offset: 0,
				};
			};

			// Get Paged
			const fetchPaged = async (): Promise<MicroCMSListResponse<unknown>> => {
				const numericLimit = limit ? Number(limit) : 10;
				const numericOffset = offset ? Number(offset) : 0;
				return await client.getList<unknown>({
					endpoint,
					queries: {
						...baseQueries,
						limit: numericLimit,
						offset: numericOffset,
					},
				});
			};

			return limit === "all" ? await fetchAll() : await fetchPaged();
		} catch (error) {
			console.error("[API] Failed to fetch list:", error);
			// Return empty data instead of throwing error to prevent 404 on page refresh
			return {
				contents: [],
				totalCount: 0,
				limit: 0,
				offset: 0,
			};
		}
	}),
	{
		maxAge: 60,
	},
);

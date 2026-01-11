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

// Default fields - only request fields that exist in the schema
// If a field doesn't exist, microCMS will return an error, so we request only what we know exists
// Support both body (new) and contentBlocks (legacy) field names
const DEFAULT_FIELDS =
	"id,createdAt,updatedAt,publishedAt,revisedAt,title,title_en,category,location,image,content,external_url,body,contentBlocks";

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

			// Use provided fields or default fields
			// If no fields specified, don't set it - let microCMS return all fields
			if (fields) {
				baseQueries.fields = fields;
			} else {
				// Only set default fields if we want to limit what we get
				// For now, let's try without fields to get everything
				// baseQueries.fields = DEFAULT_FIELDS;
			}

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

			const result = limit === "all" ? await fetchAll() : await fetchPaged();
			console.log("[API] Successfully fetched list:", {
				endpoint,
				totalCount: result.totalCount,
				contentsLength: result.contents.length,
			});
			return result;
		} catch (error) {
			console.error("[API] Failed to fetch list:", error);
			// Log more details for debugging
			if (error instanceof Error) {
				console.error("[API] Error message:", error.message);
				console.error("[API] Error stack:", error.stack);
			}
			// Re-throw the error so we can see it in the frontend
			throw createError({
				statusCode: 500,
				message: error instanceof Error ? error.message : "Failed to fetch list",
				data: error,
			});
		}
	}),
	{
		maxAge: 60,
	},
);

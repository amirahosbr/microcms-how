/**
 * Server API: List (no stale) – for comparison with /api/list
 *
 * Same as /api/list but without stale-while-revalidate.
 * Use this to compare data-transfer / cache behavior (e.g. Network tab, Cache-Control headers).
 */

import type { MicroCMSListResponse, MicroCMSQueries } from "microcms-js-sdk";
import type { H3Event } from "h3";
import { parseListQuery } from "./list";
import { useMicroCMSClient } from "~~/shared/utils/microcms";

export default cachedEventHandler(
	eventHandler(async (event) => {
		const { endpoint, limit, offset, fields, filters, q, orders, draftKey } =
			parseListQuery(event);

		if (!endpoint) {
			throw createError({ statusCode: 400, message: "endpoint is required" });
		}

		try {
			const client = useMicroCMSClient();
			const baseQueries: MicroCMSQueries = {};
			if (fields) baseQueries.fields = fields;
			if (filters) baseQueries.filters = filters;
			if (q) baseQueries.q = q;
			if (orders) baseQueries.orders = orders;
			if (draftKey) baseQueries.draftKey = draftKey;

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
			console.error("[API] Failed to fetch list-no-stale:", error);
			throw createError({
				statusCode: 500,
				message: error instanceof Error ? error.message : "Failed to fetch list",
			});
		}
	}),
	{
		// No stale: only maxAge. After expiry every request hits microCMS.
		maxAge: 60 * 60,
		getKey: (event) => {
			const url = getRequestURL(event);
			return url.pathname + url.search;
		},
	},
);

/**
 * Utility: Microcms
 *
 * @file ./shared/utils/microcms.ts
 * @description microCMS
 * @module Utility
 */

// Import
import type { MicroCMSListResponse } from "microcms-js-sdk";
import { createClient } from "microcms-js-sdk";

// Create Client
export const useMicroCMSClient = () => {
	const config = useRuntimeConfig();
	const serviceDomain = config.microcms.serviceDomain;
	const apiKey = config.microcms.apiKey;
	
	// Debug: Log if credentials are missing (only in dev)
	if (import.meta.dev && (!serviceDomain || !apiKey)) {
		console.warn("[microCMS] Missing credentials:", {
			hasServiceDomain: !!serviceDomain,
			hasApiKey: !!apiKey,
		});
		console.warn("[microCMS] Make sure you have .env file with:");
		console.warn("  MICROCMS_SERVICE_DOMAIN=your-service-domain");
		console.warn("  MICROCMS_API_KEY=your-api-key");
	}
	
	return createClient({
		serviceDomain: serviceDomain || '',
		apiKey: apiKey || '',
	});
};

/**
 * Fetches articles from microCMS
 *
 * @param {string} endpoint - Endpoint name
 * @param {number | "all"} [limit] - Number of articles to fetch (default is 100, "all" fetches all articles)
 * @param {object} [options] - Additional query options (fields, offset, orders, q, filters)
 * @returns {Promise<T[]>}
 */
export async function fetchAllArticles<T>(
	endpoint: string,
	limit: number | "all" = 100,
	options: {
		fields?: string;
		offset?: number;
		orders?: string;
		q?: string;
		filters?: string;
	} = {},
): Promise<{ contents: T[]; totalCount: number }> {
	const client = useMicroCMSClient();
	let totalArticles: T[] = [];
	let totalCount = 0;
	let offset = options.offset ?? 0;
	try {
		if (limit === "all") {
			offset = 0;
			while (true) {
				const res: MicroCMSListResponse<T> = await client.get({
					endpoint,
					queries: {
						limit: 100,
						offset,
						fields: options.fields,
						orders: options.orders,
						q: options.q,
						filters: options.filters,
					},
				});
				totalArticles = [...totalArticles, ...res.contents];
				totalCount = res.totalCount ?? 0;
				if (res.contents.length < 100) break;
				offset += 100;
			}
		} else {
			const query: Record<string, string | number | undefined> = {
				limit,
				fields: options.fields,
				orders: options.orders,
				q: options.q,
				filters: options.filters,
			};
			if (options.offset !== undefined) query.offset = options.offset;
			const res: MicroCMSListResponse<T> = await client.get({
				endpoint,
				queries: query,
			});
			totalArticles = res.contents;
			totalCount = res.totalCount ?? 0;
		}

		return { contents: totalArticles, totalCount };
	} catch (error) {
		console.error("microCMS API error:", error);
		return { contents: [], totalCount: 0 };
	}
}

/**
 * Server API: Featured News (for modal)
 *
 * Returns featured news if any exist (featured=true), otherwise latest published.
 * Requires a boolean `featured` field on the news API schema.
 */

import type { MicroCMSListResponse } from "microcms-js-sdk";
import { useMicroCMSClient } from "~~/shared/utils/microcms";

const FIELDS =
	"id,createdAt,publishedAt,title,title_en,description,description_en,image,thumbnail,category,location";

export default cachedEventHandler(
	eventHandler(async () => {
		try {
			const client = useMicroCMSClient();

			// 1. Try featured first (requires `featured` boolean field on news API)
			try {
				const featuredRes = await client.get<MicroCMSListResponse<unknown>>({
					endpoint: "news",
					queries: {
						filters: "featured[equals]true",
						limit: 1,
						orders: "-publishedAt",
						fields: FIELDS,
					},
				});

				if (featuredRes.contents.length > 0) {
					return { article: featuredRes.contents[0], source: "featured" as const };
				}
			} catch {
				// featured field may not exist yet; fall through to latest
			}

			// 2. Fallback: latest published
			const latestRes = await client.get<MicroCMSListResponse<unknown>>({
				endpoint: "news",
				queries: {
					limit: 1,
					orders: "-publishedAt",
					fields: FIELDS,
				},
			});

			const article = latestRes.contents[0] ?? null;
			return { article, source: article ? ("latest" as const) : null };
		} catch (error) {
			console.error("[API] Failed to fetch featured news:", error);
			return { article: null, source: null };
		}
	}),
	{
		maxAge: 60 * 60,
		staleMaxAge: 60 * 60,
		getKey: () => "/api/featured-news",
	},
);

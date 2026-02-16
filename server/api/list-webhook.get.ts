/**
 * Server API: list.get.ts
 *
 * @file ./server/api/list.get.ts
 * @description microCMSから一覧データを取得します。
 * @module API
 */

import type { MicroCMSListResponse, MicroCMSQueries } from "microcms-js-sdk"
import type { H3Event } from "h3";
import { useMicroCMSClient } from "~~/shared/utils/microcms";

// Parse Query
export const parseListQuery = (event: H3Event): ListApiQuery => {
  const url = getRequestURL(event)
  const p = url.searchParams
  return {
    endpoint: p.get("endpoint") ?? undefined,
    fields: p.get("fields") ?? undefined,
    filters: p.get("filters") ?? undefined,
    q: p.get("q") ?? undefined,
    limit: p.get("limit") ?? undefined,
    offset: p.get("offset") ?? undefined,
    orders: p.get("orders") ?? undefined,
  }
}

// Get List
export default cachedEventHandler(
  eventHandler(async (event) => {
    const { endpoint, limit, offset, fields, filters, q, orders } = parseListQuery(event)
    if (!endpoint) {
      throw createError({ statusCode: 400, message: "endpoint is required" })
    }

    try {
      const client = useMicroCMSClient()

      // Set Queries
      const baseQueries: MicroCMSQueries = {}
      if (fields) baseQueries.fields = fields
      if (filters) baseQueries.filters = filters
      if (q) baseQueries.q = q
      if (orders) baseQueries.orders = orders

      // Get All
      const fetchAll = async (): Promise<MicroCMSListResponse<Record<string, unknown>>> => {
        const contents = await client.getAllContents<Record<string, unknown>>({
          endpoint,
          queries: baseQueries,
        })
        return {
          contents,
          totalCount: contents.length,
          limit: contents.length,
          offset: 0,
        }
      }

      // Get Paged
      const fetchPaged = async (): Promise<MicroCMSListResponse<Record<string, unknown>>> => {
        const numericLimit = limit ? Number(limit) : 10
        const numericOffset = offset ? Number(offset) : 0
        return await client.getList<Record<string, unknown>>({
          endpoint,
          queries: {
            ...baseQueries,
            limit: numericLimit,
            offset: numericOffset,
          },
        })
      }

      return limit === "all" ? await fetchAll() : await fetchPaged()
    } catch (error) {
      console.error("[API] Failed to fetch list:", error)
      throw createError({
        statusCode: 500,
        message: "コンテンツ一覧の取得に失敗しました",
      })
    }
  }),
  {
    maxAge: 60,
  },
)

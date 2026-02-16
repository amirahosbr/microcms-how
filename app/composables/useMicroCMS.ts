import { createClient } from 'microcms-js-sdk'
import type { MicroCMSListResponse, MicroCMSQueries } from 'microcms-js-sdk'

/**
 * Composable: useMicroCMS
 * 
 * @description Client-side composable for microCMS (uses API routes for security)
 * For server-side direct access, use useMicroCMSClient() from shared/utils/microcms.ts
 */
export const useMicroCMS = () => {
  const config = useRuntimeConfig()
  
  // Server-side: Direct client access (API key is safe here)
  if (import.meta.server) {
    const client = createClient({
      serviceDomain: (config.microcms?.serviceDomain as string) || '',
      apiKey: (config.microcms?.apiKey as string) || ''
    })

    return {
      client,
      // Helper method for fetching list
      getList: async <T = unknown>(
        endpoint: string,
        queries?: MicroCMSQueries
      ): Promise<MicroCMSListResponse<T>> => {
        return await client.getList<T>({
          endpoint,
          queries
        })
      },
      // Helper method for fetching single item
      getDetail: async <T = unknown>(
        endpoint: string,
        contentId: string,
        queries?: MicroCMSQueries
      ): Promise<T> => {
        return await client.getListDetail<T>({
          endpoint,
          contentId,
          queries
        })
      }
    }
  }

  // Client-side: Use API routes (recommended for security)
  return {
    // Fetch list via API route
    getList: async <T = unknown>(
      endpoint: string,
      queries?: MicroCMSQueries
    ): Promise<MicroCMSListResponse<T>> => {
      const queryParams = new URLSearchParams()
      queryParams.set('endpoint', endpoint)
      if (queries?.limit) queryParams.set('limit', String(queries.limit))
      if (queries?.offset) queryParams.set('offset', String(queries.offset))
      if (queries?.fields) {
        const fields = Array.isArray(queries.fields) 
          ? queries.fields.join(',') 
          : queries.fields
        queryParams.set('fields', fields)
      }
      if (queries?.orders) {
        const orders = Array.isArray(queries.orders)
          ? queries.orders.join(',')
          : queries.orders
        queryParams.set('orders', orders)
      }
      if (queries?.filters) {
        const filters = Array.isArray(queries.filters)
          ? queries.filters.join(',')
          : queries.filters
        queryParams.set('filters', filters)
      }
      if (queries?.q) queryParams.set('q', queries.q)

      const response = await $fetch<MicroCMSListResponse<T>>(`/api/list?${queryParams.toString()}`)
      return response as MicroCMSListResponse<T>
    },
    // Fetch detail via API route
    getDetail: async <T = unknown>(
      endpoint: string,
      contentId: string,
      queries?: MicroCMSQueries
    ): Promise<T> => {
      const queryParams = new URLSearchParams()
      queryParams.set('endpoint', endpoint)
      queryParams.set('contentId', contentId)
      if (queries?.fields) {
        const fields = Array.isArray(queries.fields)
          ? queries.fields.join(',')
          : queries.fields
        queryParams.set('fields', fields)
      }
      if (queries?.draftKey) queryParams.set('draftKey', queries.draftKey)

      const response = await $fetch<T>(`/api/article?${queryParams.toString()}`)
      return response as T
    }
  }
}

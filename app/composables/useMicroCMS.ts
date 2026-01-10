import { createClient } from 'microcms-js-sdk'

export const useMicroCMS = () => {
  const config = useRuntimeConfig()
  
  const client = createClient({
    serviceDomain: (config.microcms?.serviceDomain as string) || '',
    apiKey: (config.microcms?.apiKey as string) || ''
  })

  return {
    client
  }
}

import type { EventsResponse, EventParams } from '~/types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()
  const baseUrl = config.public.kudagoApiUrl

  try {
    const defaultTextFormat = 'text'
    const queryParams = query as Partial<Record<keyof EventParams, any>>
    
    const processedQuery: Record<string, string | number | boolean> = {
      fields: 'id,title,slug,description,body_text,short_title,age_restriction,price,is_free,images,site_url,publication_date,dates,place,categories,tags',
      text_format: queryParams.text_format || defaultTextFormat,
      ...queryParams
    }

    if (processedQuery.page_size) {
      processedQuery.page_size = parseInt(String(processedQuery.page_size))
    }
    if (processedQuery.page) {
      processedQuery.page = parseInt(String(processedQuery.page))
    }

    const response = await $fetch<EventsResponse>(`${baseUrl}/events/`, {
      query: processedQuery,
      responseType: 'json'
    })
    if (processedQuery.location && Array.isArray(response.results)) {
      const loc = String(processedQuery.location)
      response.results = response.results.map((e: any) => ({ ...e, location: { ...(e.location || {}), slug: loc } }))
    }
    return response
  } catch (error: any) {
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    } satisfies EventsResponse
  }
})



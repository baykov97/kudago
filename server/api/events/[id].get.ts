import type { Event } from '~/types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.kudagoApiUrl
  const id = getRouterParam(event, 'id')

  try {
    const response = await $fetch<Event>(`${baseUrl}/events/${id}/`, {
      query: {
        fields: 'id,title,slug,description,body_text,short_title,age_restriction,price,is_free,images,site_url,publication_date,dates,place,categories,tags',
        text_format: 'html'
      }
    })

    return response
  } catch (error: any) {
    if (error?.status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Event not found'
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch event'
    })
  }
})



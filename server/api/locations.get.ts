import type { City } from '~/types'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.kudagoApiUrl

  try {
    const response = await $fetch<City[]>(`${baseUrl}/locations/`, {
      query: {
        fields: 'id,name,slug,timezone,coords',
        order_by: 'name'
      }
    })

    return response
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch locations'
    })
  }
})



import type { EventsResponse, City } from '~/types'

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.kudagoApiUrl
  
  try {
    const cities = await $fetch<City[]>(`${baseUrl}/locations/`, {
      query: {
        fields: 'id,name,slug,timezone,coords',
        order_by: 'name'
      }
    })

    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const events = await $fetch<EventsResponse>(`${baseUrl}/events/`, {
      query: {
        fields: 'id,title,slug,description,body_text,short_title,age_restriction,price,is_free,images,site_url,publication_date,dates,place,categories,tags',
        actual_since: today.toISOString().split('T')[0],
        actual_until: nextWeek.toISOString().split('T')[0],
        page_size: 1000
      }
    })

    const eventUrls: any[] = []
    for (const city of cities) {
      for (const event of events.results) {
        eventUrls.push({
          loc: `/${city.slug}/events/${event.id}`,
          lastmod: new Date(event.publication_date).toISOString(),
          changefreq: 'daily' as const,
          priority: 0.8 as const
        })
      }
    }

    const cityUrls = cities.map(city => [
      {
        loc: `/${city.slug}/`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily' as const,
        priority: 1 as const
      },
      {
        loc: `/${city.slug}/events/`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily' as const,
        priority: 0.9 as const
      },
      {
        loc: `/${city.slug}/favorites/`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly' as const,
        priority: 0.7 as const
      }
    ]).flat()

    const baseUrls = [
      {
        loc: '/',
        lastmod: new Date().toISOString(),
        changefreq: 'daily' as const,
        priority: 1 as const
      },
      {
        loc: '/favorites',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly' as const,
        priority: 0.7 as const
      }
    ]

    return [...baseUrls, ...cityUrls, ...eventUrls]
  } catch (error) {
    return [
      {
        loc: '/',
        lastmod: new Date().toISOString(),
        changefreq: 'daily' as const,
        priority: 1 as const
      },
      {
        loc: '/events',
        lastmod: new Date().toISOString(),
        changefreq: 'daily' as const,
        priority: 0.9 as const
      },
      {
        loc: '/favorites',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly' as const,
        priority: 0.7 as const
      }
    ]
  }
})

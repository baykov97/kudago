import type { City, Event, EventsResponse, EventParams, CachedData } from '~/types'

export const useKudaGo = () => {
  const cache = new Map<string, CachedData<any>>()
  const CACHE_TTL = 5 * 60 * 1000

  const getCachedData = async <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
    const cached = cache.get(key)
    const now = Date.now()

    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return cached.data
    }

    const data = await fetcher()
    cache.set(key, { data, timestamp: now })
    return data
  }

  const fetchLocations = async (): Promise<City[]> => {
    const cacheKey = 'locations'
    
    return getCachedData(cacheKey, async () => {
      const response = await $fetch<City[]>('/api/locations')
      return response || []
    })
  }

  const fetchEvents = async (params: EventParams = {}): Promise<EventsResponse> => {
    const cacheKey = `events_${JSON.stringify(params)}`
    
    return getCachedData(cacheKey, async () => {
      const queryParams = {
        ...params,
        page_size: params.page_size?.toString(),
        page: params.page?.toString()
      }
      
      const response = await $fetch<EventsResponse>('/api/events', {
        query: queryParams
      })
      return response
    })
  }

  const fetchEvent = async (id: number): Promise<Event> => {
    const cacheKey = `event_${id}`
    
    return getCachedData(cacheKey, async () => {
      const response = await $fetch<Event>(`/api/events/${id}`)
      return response
    })
  }

  const getEventImage = (event: Event): string => {
    if (event.images && event.images.length > 0) {
      const firstImage = event.images[0]
      return firstImage?.image || '/placeholder-event.svg'
    }
    return '/placeholder-event.svg'
  }

  const formatEventDate = (event: Event): string => {
    if (!event.dates || event.dates.length === 0) {
      return 'Дата не указана'
    }

    const firstDate = event.dates[0]
    if (!firstDate) {
      return 'Дата не указана'
    }

    const startDate = new Date(firstDate.start * 1000)
    const endDate = new Date(firstDate.end * 1000)
    
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }

    if (startDate.toDateString() === endDate.toDateString()) {
      return `${startDate.toLocaleDateString('ru-RU', { ...options, hour: '2-digit', minute: '2-digit' })}`
    } else {
      return `${startDate.toLocaleDateString('ru-RU', options)} - ${endDate.toLocaleDateString('ru-RU', options)}`
    }
  }

  const getEventPrice = (event: Event): string => {
    if (event.is_free) {
      return 'Бесплатно'
    }
    return event.price || 'Цена не указана'
  }

  return {
    fetchLocations,
    fetchEvents,
    fetchEvent,
    getEventImage,
    formatEventDate,
    getEventPrice
  }
}

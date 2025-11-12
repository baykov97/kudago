import type { City } from '~/types'

export const useCityStore = defineStore('city', () => {
  const selectedCity = ref<City | null>(null)
  const cities = ref<City[]>([])
  const cityCookie = useCookie<City | null>('selected-city', {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/'
  })

  const initializeFromCookie = (): void => {
    const raw = cityCookie.value as any
    if (!raw) return
    const value: any = typeof raw === 'string' ? (() => { try { return JSON.parse(raw) } catch { return null } })() : raw
    if (value && value.id && value.name) {
      selectedCity.value = value as City
    } else if (typeof raw === 'string') {
      cityCookie.value = null
    }
  }

  const saveToCookie = (): void => {
    if (selectedCity.value) {
      cityCookie.value = selectedCity.value
    }
  }

  const getFallbackCities = (): City[] => [
    { id: 1, name: 'Москва', slug: 'msk', timezone: 'Europe/Moscow', coords: { lat: 55.7558, lon: 37.6176 } },
    { id: 2, name: 'Санкт-Петербург', slug: 'spb', timezone: 'Europe/Moscow', coords: { lat: 59.9311, lon: 30.3609 } },
    { id: 3, name: 'Екатеринбург', slug: 'ekb', timezone: 'Asia/Yekaterinburg', coords: { lat: 56.8431, lon: 60.6454 } },
    { id: 4, name: 'Казань', slug: 'kzn', timezone: 'Europe/Moscow', coords: { lat: 55.8304, lon: 49.0661 } },
    { id: 5, name: 'Нижний Новгород', slug: 'nnv', timezone: 'Europe/Moscow', coords: { lat: 56.2965, lon: 43.9361 } }
  ]

  const loadCities = async (): Promise<void> => {
    if (cities.value.length > 0) {
      return
    }

    try {
      const { fetchLocations } = useKudaGo()
      const fetchedCities = await fetchLocations()
      
      const validCities = fetchedCities
        .filter(city => city && city.name && city.slug)
        .map((city, index) => ({
          ...city,
          id: city.id || index + 1
        }))
      
      cities.value = validCities
    } catch (error) {
      cities.value = getFallbackCities()
    }
  }

  const setCity = (city: City): void => {
    selectedCity.value = city
    saveToCookie()
  }

  const getCityBySlug = (slug: string): City | null => {
    return cities.value.find(city => city.slug === slug) || null
  }

  const getCityById = (id: number): City | null => {
    return cities.value.find(city => city.id === id) || null
  }

  const clearCity = (): void => {
    selectedCity.value = null
    cityCookie.value = null
  }

  const clearInvalidCookie = (): void => {
    if ((cityCookie.value as any) === '[object Object]') {
      cityCookie.value = null
    }
  }

  initializeFromCookie()
  if (typeof window !== 'undefined') clearInvalidCookie()

  return {
    selectedCity: readonly(selectedCity),
    cities: readonly(cities),
    loadCities,
    setCity,
    getCityBySlug,
    getCityById,
    clearCity,
    initializeFromCookie
  }
})

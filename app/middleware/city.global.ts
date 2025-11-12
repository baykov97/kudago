export default defineNuxtRouteMiddleware(async (to) => {
  const path = to.path || ''
  if (path.startsWith('/favorites')) {
    return
  }
  
  const cityStore = useCityStore()
  await cityStore.loadCities()
  const allowed = new Set(cityStore.cities.map((c) => c.slug))

  const cityFromRoute = (to.params?.city as string) || ''

  const cookie = useCookie<any>('selected-city')
  const cookieSlug = typeof cookie.value === 'string'
    ? (() => { try { return (JSON.parse(cookie.value) as any)?.slug } catch { return undefined } })()
    : cookie.value?.slug

  const getSafeFallback = (): string => {
    if (cookieSlug && allowed.has(cookieSlug)) {
      return cookieSlug
    }
    if (allowed.has('msk')) {
      return 'msk'
    }
    if (cityStore.cities.length > 0) {
      return cityStore.cities[0]?.slug || 'msk'
    }
    return 'msk'
  }

  if (!cityFromRoute) {
    const fallback = getSafeFallback()
    return navigateTo({ path: `/${fallback}/`, query: to.query })
  }

  if (!allowed.has(cityFromRoute)) {
    const fallback = getSafeFallback()
    return navigateTo({ path: `/${fallback}/`, query: to.query })
  }

  if (!cookieSlug || cookieSlug !== cityFromRoute) {
    const city = cityStore.getCityBySlug(cityFromRoute)
    if (city) {
      cookie.value = { id: city.id, name: city.name, slug: city.slug }
    } else {
      cookie.value = { id: 0, name: cityFromRoute.toUpperCase(), slug: cityFromRoute }
    }
  }
})



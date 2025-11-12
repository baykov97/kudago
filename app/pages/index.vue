<template>
  <div>
    <h1>Афиша города</h1>
    <h2>Ближайшие события в {{ cityName }}</h2>
      
      <div v-if="pending" class="loading">
        Загрузка событий...
      </div>

      <div v-else-if="error" class="empty-state">
        <h3>Ошибка загрузки</h3>
        <p>{{ error }}</p>
      </div>

      <div v-else-if="!events?.results?.length" class="empty-state">
        <h3>Нет событий</h3>
        <p>В выбранном городе пока нет событий</p>
      </div>

      <div v-else class="events-grid">
        <EventCard 
          v-for="event in events.results" 
          :key="event.id" 
          :event="event" 
        />
      </div>
  </div>
</template>

<script setup lang="ts">
const cityStore = useCityStore()
const { selectedCity } = storeToRefs(cityStore)
const route = useRoute()

const DEFAULT_CITY = 'msk'
const citySlug = computed(() => (route.query.location as string) || selectedCity.value?.slug || DEFAULT_CITY)
const cityNameBySlug: Record<string,string> = {
  msk: 'Москва',
  spb: 'Санкт‑Петербург',
  ekb: 'Екатеринбург',
  kzn: 'Казань',
  nnv: 'Нижний Новгород'
}
const cityName = computed(() => selectedCity.value?.name || cityNameBySlug[citySlug.value] || citySlug.value.toUpperCase())

const { data: events, pending, error } = await useLazyAsyncData('home-events', async () => {
  try {
    const { fetchEvents } = useKudaGo()
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return await fetchEvents({
      location: citySlug.value,
      actual_since: today.toISOString().split('T')[0],
      actual_until: nextWeek.toISOString().split('T')[0],
      page_size: 12
    })
  } catch (err) {
    return null
  }
}, {
  watch: [citySlug]
})

useHead({
  title: `Афиша ${cityName.value} - KudaGo`,
  meta: [
    {
      name: 'description',
      content: `Ближайшие события в ${cityName.value}. Концерты, выставки, спектакли и другие мероприятия.`
    }
  ]
})
</script>
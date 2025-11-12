<template>
  <div>
    <h1>Афиша {{ cityTitle }}</h1>
    <div v-if="pending" class="events-grid">
      <EventCardSkeleton v-for="n in 12" :key="`skeleton-${n}`" />
    </div>
    <div v-else-if="error">Ошибка: {{ error }}</div>
    <div v-else-if="!events?.results?.length">Нет событий</div>
    <div v-else class="events-grid">
      <EventCard v-for="event in events.results" :key="event.id" :event="event" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EventsResponse } from '~/types'

const route = useRoute()
const citySlug = computed(() => route.params.city as string)
const cityNames: Record<string, string> = { msk: 'Москва', spb: 'Санкт‑Петербург', ekb: 'Екатеринбург', kzn: 'Казань', nnv: 'Нижний Новгород' }
const cityTitle = computed(() => cityNames[citySlug.value] || citySlug.value.toUpperCase())

const { fetchEvents } = useKudaGo()
const today = new Date(); const nextWeek = new Date(today.getTime() + 7*24*60*60*1000)
const { data: events, pending, error, refresh } = await useLazyAsyncData<EventsResponse | null>(() => `city-home-${citySlug.value}`, async () => {
  return await fetchEvents({
    location: citySlug.value,
    actual_since: today.toISOString().split('T')[0],
    actual_until: nextWeek.toISOString().split('T')[0],
    page_size: 12
  })
}, { watch: [citySlug] })

watch(citySlug, () => { refresh() })

useHead({ title: `Афиша ${cityTitle.value} - KudaGo` })
</script>



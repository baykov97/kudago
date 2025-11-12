<template>
  <div>
    <h1>Избранное</h1>
    
    <div v-if="favoritesCount === 0" class="empty-state">
      <h3>Нет избранных событий</h3>
      <p>Добавьте события в избранное, нажав на сердечко ❤️</p>
    </div>

    <div v-else>
      <div class="favorites-info">
        <p>Избранных событий: {{ favoritesCount }}</p>
        <button 
          @click="clearAllFavorites" 
          class="clear-btn"
          v-if="favoritesCount > 0"
        >
          Очистить все
        </button>
      </div>

      <div v-if="pending" class="events-grid">
        <EventCardSkeleton v-for="n in favoritesCount || 6" :key="`skeleton-${n}`" />
      </div>

      <div v-else-if="error" class="empty-state">
        <h3>Ошибка загрузки</h3>
        <p>{{ error }}</p>
      </div>

      <div v-else-if="!favoriteEvents?.length" class="empty-state">
        <h3>События не найдены</h3>
        <p>Некоторые избранные события могли быть удалены</p>
      </div>

      <div v-else>
        <template v-for="slug in orderedCitySlugs" :key="slug">
          <h2 class="group-title">{{ cityName(slug) }}</h2>
          <div class="events-grid" v-if="groupedByCity[slug]?.length">
            <EventCard v-for="event in groupedByCity[slug]" :key="event.id" :event="event" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Event } from '~/types'

const favoritesStore = useFavoritesStore()
const { favorites, favoritesCount } = storeToRefs(favoritesStore)

const { data: favoriteEvents, pending, error, refresh } = await useLazyAsyncData<Event[]>(
  () => `favorite-events-${favorites.value.map(e => typeof e === 'number' ? e : e.id).join(',')}`,
  async (): Promise<Event[]> => {
  if (!favorites.value.length) {
    return []
  }

  const { fetchEvent } = useKudaGo()
  const events: Event[] = []

  const promises = favorites.value.map(async (entry): Promise<Event | null> => {
    const eventId = typeof entry === 'number' ? entry : entry.id
    try {
      return await fetchEvent(eventId)
    } catch (err) {
      return null
    }
  })

  const results = await Promise.all(promises)
  return results.filter((event): event is Event => event !== null)
}, {
  watch: [favorites]
})

watch(favorites, () => { refresh() }, { deep: true })

const groupedByCity = computed<Record<string, Event[]>>(() => {
  const map: Record<string, Event[]> = {}
  for (const e of (favoriteEvents.value || [])) {
    const entry = favorites.value.find(x => (typeof x === 'number' ? x === e.id : x.id === e.id))
    const slug = typeof entry === 'object' && entry?.city ? entry.city : ((e as any).location?.slug || 'unknown')
    if (!map[slug]) map[slug] = []
    map[slug].push(e)
  }
  return map
})

const cityName = (slug: string): string => ({
  msk: 'Москва',
  spb: 'Санкт‑Петербург',
  ekb: 'Екатеринбург',
  kzn: 'Казань',
  nnv: 'Нижний Новгород',
  unknown: 'Другие'
}[slug] || slug.toUpperCase())

const orderedCitySlugs = computed(() => {
  const order = ['msk','spb','ekb','kzn','nnv','unknown']
  const present = Object.keys(groupedByCity.value)
  return order.filter(s => present.includes(s)).concat(present.filter(s => !order.includes(s)))
})

const clearAllFavorites = (): void => {
  if (confirm('Вы уверены, что хотите очистить все избранные события?')) {
    favorites.value.forEach((entry) => {
      const eventId = typeof entry === 'number' ? entry : entry.id
      favoritesStore.removeFromFavorites(eventId)
    })
  }
}

useHead({
  title: 'Избранные события - KudaGo',
  meta: [
    {
      name: 'description',
      content: 'Ваши избранные события из KudaGo API'
    }
  ]
})
</script>

<style scoped>
.favorites-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.clear-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.clear-btn:hover {
  background: #c0392b;
}

@media (max-width: 768px) {
  .favorites-info {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>
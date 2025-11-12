<template>
  <div class="event-detail-page">
    <div v-if="pending" class="event-detail-skeleton">
      <div class="skeleton-header">
        <div class="skeleton-back-btn"></div>
        <div class="skeleton-title"></div>
      </div>
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>

    <div v-else-if="event" class="event-detail">
      <button @click="goBack" class="back-btn">
        ← Назад
      </button>

      <header class="event-header">
        <h1 class="event-title">{{ event.title }}</h1>
        <div class="event-actions">
          <button 
            @click="toggleFavorite"
            class="favorite-btn-detail"
            :class="{ favorited: isFavorited }"
          >
            <FavoriteIcon :is-active="isFavorited" :size="24" />
          </button>
        </div>
      </header>

      <div class="event-image-wrapper">
        <img 
          :src="getEventImage(event)" 
          :alt="event.title"
          class="event-main-image"
        />
      </div>

      <div class="event-meta-section">
        <div class="meta-item" v-if="formattedDate">
          <span class="meta-icon">📅</span>
          <div class="meta-content">
            <span class="meta-label">Дата</span>
            <span class="meta-value">{{ formattedDate }}</span>
          </div>
        </div>

        <div class="meta-item" v-if="event.place?.name">
          <span class="meta-icon">📍</span>
          <div class="meta-content">
            <span class="meta-label">Место</span>
            <span class="meta-value">{{ event.place.name }}</span>
            <span v-if="event.place.address" class="meta-address">{{ event.place.address }}</span>
          </div>
        </div>

        <div class="meta-item" v-if="eventPrice">
          <span class="meta-icon">💰</span>
          <div class="meta-content">
            <span class="meta-label">Стоимость</span>
            <span class="meta-value">{{ eventPrice }}</span>
          </div>
        </div>

        <div class="meta-item" v-if="event.age_restriction">
          <span class="meta-icon">🔞</span>
          <div class="meta-content">
            <span class="meta-label">Возраст</span>
            <span class="meta-value">{{ event.age_restriction }}</span>
          </div>
        </div>
      </div>

      <div class="event-tags-section" v-if="event.categories?.length || event.tags?.length">
        <div v-if="event.categories?.length" class="tags-group">
          <span class="tags-label">Категории:</span>
          <div class="tags-list">
            <span v-for="category in event.categories" :key="category" class="tag category-tag">
              {{ category }}
            </span>
          </div>
        </div>
        <div v-if="event.tags?.length" class="tags-group">
          <span class="tags-label">Теги:</span>
          <div class="tags-list">
            <span v-for="tag in event.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <div class="event-description-section">
        <h2 class="section-title">Описание</h2>
        <div class="event-description" v-html="event.description || event.body_text"></div>
      </div>

      <div v-if="event.site_url" class="event-external-link">
        <a :href="event.site_url" target="_blank" rel="noopener noreferrer" class="external-link-btn">
          Подробнее на KudaGo →
        </a>
      </div>
    </div>

    <div v-else-if="error" class="error-state">
      <h2>Ошибка загрузки</h2>
      <p>{{ error }}</p>
      <button @click="goBack" class="back-btn">← Назад</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Event } from '~/types'

const route = useRoute()
const router = useRouter()
const { fetchEvent, getEventImage, formatEventDate, getEventPrice } = useKudaGo()
const favoritesStore = useFavoritesStore()

const id = Number(route.params.id)
const currentCity = computed(() => (route.params?.city as string) || 'msk')

const { data: event, pending, error } = await useAsyncData<Event | null>('event', async () => {
  try { 
    return await fetchEvent(id) 
  } catch (err) { 
    return null 
  }
})

const isFavorited = computed(() => event.value ? favoritesStore.isFavorite(event.value.id) : false)
const formattedDate = computed(() => event.value ? formatEventDate(event.value) : '')
const eventPrice = computed(() => event.value ? getEventPrice(event.value) : '')

const toggleFavorite = (): void => {
  if (event.value) {
    favoritesStore.toggleFavorite(event.value.id, currentCity.value)
  }
}

const goBack = (): void => {
  router.push(`/${currentCity.value}/events`)
}

const eventImage = computed(() => event.value ? getEventImage(event.value) : '')
const eventDescription = computed(() => {
  if (!event.value?.description) return ''
  return event.value.description.replace(/<[^>]*>/g, '').substring(0, 160)
})

let baseUrl = ''
try {
  const requestURL = useRequestURL()
  baseUrl = requestURL.origin
} catch {
  if (typeof window !== 'undefined') {
    baseUrl = window.location.origin
  } else {
    const config = useRuntimeConfig()
    baseUrl = (config.public as any).siteUrl || 'https://kudago.com'
  }
}

const getAbsoluteUrl = (path: string): string => {
  if (path.startsWith('http')) return path
  return `${baseUrl}${path}`
}

const eventUrl = computed(() => getAbsoluteUrl(route.fullPath))
const ogImage = computed(() => {
  if (eventImage.value) {
    return getAbsoluteUrl(eventImage.value)
  }
  return getAbsoluteUrl('/placeholder-event.svg')
})

useHead({ 
  title: event.value ? `${event.value.title} - KudaGo` : 'Событие - KudaGo',
  meta: event.value ? [
    {
      name: 'description',
      content: eventDescription.value
    },
    {
      property: 'og:title',
      content: event.value.title
    },
    {
      property: 'og:description',
      content: eventDescription.value
    },
    {
      property: 'og:image',
      content: ogImage.value
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      property: 'og:url',
      content: eventUrl.value
    },
    {
      property: 'og:site_name',
      content: 'KudaGo'
    }
  ] : []
})
</script>

<style scoped lang="scss">
.event-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.back-btn {
  background: none;
  border: 2px solid #e74c3c;
  color: #e74c3c;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 2rem;
  transition: all 0.2s;
  
  &:hover {
    background: #e74c3c;
    color: white;
  }
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2rem;
}

.event-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.2;
  flex: 1;
  margin: 0;
}

.event-actions {
  display: flex;
  gap: 1rem;
}

.favorite-btn-detail {
  background: white;
  border: 2px solid #ddd;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #e74c3c;
    transform: scale(1.1);
  }
  
  &.favorited {
    border-color: #e74c3c;
    background: #fff5f5;
  }
}

.event-image-wrapper {
  width: 100%;
  margin-bottom: 2rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.event-main-image {
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: cover;
  display: block;
}

.event-meta-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.meta-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.meta-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.meta-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-label {
  font-size: 0.875rem;
  color: #7f8c8d;
  font-weight: 500;
}

.meta-value {
  font-size: 1.125rem;
  color: #2c3e50;
  font-weight: 600;
}

.meta-address {
  font-size: 0.875rem;
  color: #95a5a6;
}

.event-tags-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tags-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.tags-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.875rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.375rem 0.75rem;
  background: #f8f9fa;
  border-radius: 20px;
  font-size: 0.875rem;
  color: #2c3e50;
  
  &.category-tag {
    background: #e8f4f8;
    color: #2980b9;
    font-weight: 500;
  }
}

.event-description-section {
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.event-description {
  font-size: 1.125rem;
  line-height: 1.8;
  color: #34495e;
  
  :deep(p) {
    margin-bottom: 1rem;
  }
  
  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1rem 0;
  }
  
  :deep(a) {
    color: #e74c3c;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  :deep(ul), :deep(ol) {
    margin: 1rem 0;
    padding-left: 2rem;
  }
  
  :deep(li) {
    margin-bottom: 0.5rem;
  }
}

.event-external-link {
  text-align: center;
  margin-top: 2rem;
}

.external-link-btn {
  display: inline-block;
  padding: 1rem 2rem;
  background: #e74c3c;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.125rem;
  transition: background 0.2s;
  
  &:hover {
    background: #c0392b;
  }
}

.error-state {
  text-align: center;
  padding: 4rem 2rem;
  
  h2 {
    color: #e74c3c;
    margin-bottom: 1rem;
  }
  
  p {
    color: #7f8c8d;
    margin-bottom: 2rem;
  }
}

.event-detail-skeleton {
  .skeleton-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .skeleton-back-btn {
    width: 120px;
    height: 40px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    border-radius: 8px;
    animation: shimmer 1.5s infinite;
  }
  
  .skeleton-title {
    width: 70%;
    height: 48px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    border-radius: 8px;
    animation: shimmer 1.5s infinite;
  }
  
  .skeleton-image {
    width: 100%;
    height: 400px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    border-radius: 12px;
    margin-bottom: 2rem;
    animation: shimmer 1.5s infinite;
  }
  
  .skeleton-content {
    padding: 2rem;
    background: white;
    border-radius: 12px;
    
    .skeleton-line {
      height: 20px;
      width: 100%;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      border-radius: 4px;
      margin-bottom: 1rem;
      animation: shimmer 1.5s infinite;
      
      &.short {
        width: 60%;
      }
    }
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@media (max-width: 768px) {
  .event-detail-page {
    padding: 1rem;
  }
  
  .event-title {
    font-size: 1.75rem;
  }
  
  .event-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .event-meta-section {
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }
  
  .event-description-section {
    padding: 1.5rem;
  }
}
</style>



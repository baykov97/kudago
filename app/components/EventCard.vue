<template>
  <div class="event-card" @click="navigateToEvent">
    <div class="event-image-wrapper">
      <img 
        v-if="!imageError"
        :src="eventImage" 
        :alt="event.title"
        class="event-image"
        loading="lazy"
        @error="handleImageError"
      />
      <div v-else class="event-image-placeholder">
        <span class="placeholder-icon">🎭</span>
      </div>
    </div>
    <div class="event-content">
      <h3 class="event-title">{{ event.title }}</h3>
      <div class="event-date">{{ formattedDate }}</div>
      <div v-if="event.place?.name" class="event-venue">
        {{ event.place.name }}
      </div>
      <div class="event-description" v-if="eventDescription">
        {{ eventDescription }}
      </div>
      <div class="event-meta">
        <span class="event-price">{{ eventPrice }}</span>
        <button 
          @click.stop="toggleFavorite"
          class="favorite-btn"
          :class="{ favorited: isFavorited }"
        >
          <FavoriteIcon :is-active="isFavorited" :size="20" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Event } from '~/types'

interface Props {
  event: Event
}

const props = defineProps<Props>()

const { getEventImage, formatEventDate, getEventPrice } = useKudaGo()
const favoritesStore = useFavoritesStore()

const eventImage = computed(() => getEventImage(props.event))
const formattedDate = computed(() => formatEventDate(props.event))
const eventPrice = computed(() => getEventPrice(props.event))
const isFavorited = computed(() => favoritesStore.isFavorite(props.event.id))

const eventDescription = computed(() => {
  if (!props.event.description) return ''
  
  let text = props.event.description.replace(/<[^>]*>/g, '')
  text = text.replace(/\s+/g, ' ').trim()
  
  if (text.length > 150) {
    text = text.substring(0, 150).trim() + '...'
  }
  
  return text
})

const imageError = ref(false)

const handleImageError = (): void => {
  imageError.value = true
}

watch(eventImage, () => {
  imageError.value = false
})

const route = useRoute()
const currentCity = computed(() => (route.params?.city as string) || (route.query.location as string) || 'msk')
const navigateToEvent = (): void => {
  navigateTo(`/${currentCity.value}/events/${props.event.id}`)
}

const toggleFavorite = (): void => {
  const city = (route.params?.city as string) || (route.query.location as string) || 'msk'
  favoritesStore.toggleFavorite(props.event.id, city)
}
</script>

<style scoped>
.event-image-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.event-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.placeholder-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.event-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.event-price {
  font-weight: 500;
  color: #e74c3c;
}

.favorite-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: transform 0.2s;
}

.favorite-btn:hover {
  transform: scale(1.1);
}

.favorite-btn.favorited {
  animation: heartBeat 0.6s ease-in-out;
}

@keyframes heartBeat {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
</style>
export const useFavoritesStore = defineStore('favorites', () => {
  type FavoriteEntry = number | { id: number, city: string }
  const favorites = ref<FavoriteEntry[]>([])

  const initializeFromStorage = (): void => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kudago-favorites')
      if (stored) {
        try {
          favorites.value = JSON.parse(stored) as FavoriteEntry[]
        } catch (e) {
        }
      }
    }
  }

  const saveToStorage = (): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kudago-favorites', JSON.stringify(favorites.value))
    }
  }

  const addToFavorites = (eventId: number, city: string): void => {
    const exists = favorites.value.some((e) => (typeof e === 'number' ? e === eventId : e.id === eventId))
    if (!exists) {
      favorites.value.push({ id: eventId, city })
      saveToStorage()
    }
  }

  const removeFromFavorites = (eventId: number): void => {
    const index = favorites.value.findIndex((e) => (typeof e === 'number' ? e === eventId : e.id === eventId))
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveToStorage()
    }
  }

  const isFavorite = (eventId: number): boolean => {
    return favorites.value.some((e) => (typeof e === 'number' ? e === eventId : e.id === eventId))
  }

  const toggleFavorite = (eventId: number, city: string): void => {
    if (isFavorite(eventId)) {
      removeFromFavorites(eventId)
    } else {
      addToFavorites(eventId, city)
    }
  }

  const favoritesCount = computed((): number => favorites.value.length)

  onMounted(() => {
    initializeFromStorage()
  })

  return {
    favorites: readonly(favorites),
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    favoritesCount,
    initializeFromStorage
  }
})


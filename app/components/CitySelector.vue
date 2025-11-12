<template>
  <div class="city-selector">
    <CustomSelect
      v-model="selectedCityId"
      :items="cities.map(c => ({ label: c.name, value: String(c.id) }))"
      label-key="label"
      value-key="value"
      :placeholder="loading ? 'Загрузка...' : 'Выберите город'"
      :disabled="loading"
      @change="handleCityChange"
    />
  </div>
</template>

<script setup lang="ts">
import CustomSelect from '~/components/CustomSelect.vue'
const route = useRoute()
const router = useRouter()
const cityStore = useCityStore()
const { cities, selectedCity } = storeToRefs(cityStore)

const loading = ref<boolean>(false)
const selectedCityId = ref<string>('')

onMounted(async (): Promise<void> => {
  loading.value = true
  try {
    await cityStore.loadCities()
    const routeSlug = (route.params.city as string) || ''
    let initCity = routeSlug ? cityStore.getCityBySlug(routeSlug) : (selectedCity.value ? selectedCity.value : null)
    if (!initCity) {
      initCity = cityStore.getCityBySlug('msk')
    }
    if (initCity) {
      cityStore.setCity(initCity)
      selectedCityId.value = initCity.id.toString()
    }
  } catch (error) {
  } finally {
    loading.value = false
  }
})

watch(selectedCity, (newCity) => {
  if (newCity) {
    selectedCityId.value = newCity.id.toString()
  } else {
    selectedCityId.value = ''
  }
}, { immediate: true })

const handleCityChange = (): void => {
  if (selectedCityId.value) {
    const cityId = parseInt(selectedCityId.value)
    const city = cityStore.getCityById(cityId)
    if (city) {
      cityStore.setCity(city)
      const restPath = route.path.replace(/^\/[^/]+/, '') || '/'
      router.push({ path: `/${city.slug}${restPath}`, query: route.query })
    }
  }
}

watch(() => route.params.city, (newSlug) => {
  const slug = (newSlug as string) || ''
  const city = slug ? cityStore.getCityBySlug(slug) : null
  if (city) {
    cityStore.setCity(city)
    selectedCityId.value = city.id.toString()
  } else if (!selectedCity.value) {
    const fallback = cityStore.getCityBySlug('msk')
    if (fallback) {
      cityStore.setCity(fallback)
      selectedCityId.value = fallback.id.toString()
    }
  }
})
</script>

<style scoped>
.city-selector {
  display: flex;
  align-items: center;
}

.clear-city-btn {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.clear-city-btn:hover {
  background: #c0392b;
}
</style>
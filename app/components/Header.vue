<template>
  <header class="header">
    <div class="header-content">
      <NuxtLink to="/" class="logo"> KudaGo </NuxtLink>

      <nav class="nav">
        <NuxtLink
          :to="`/${currentCity}/events`"
          class="nav-link"
          :class="{
            active: $route.path.startsWith(`/${currentCity}/events`),
          }"
        >
          События
        </NuxtLink>
        <NuxtLink
          to="/favorites"
          class="nav-link nav-link-favorites"
          :class="{ active: $route.path === '/favorites' }"
        >
          <div class="favorite-icon-wrapper">
            <FavoriteIcon :is-active="$route.path === '/favorites'" />
            <span v-if="favoritesCount > 0" class="favorite-badge">
              {{ favoritesCount }}
            </span>
          </div>
        </NuxtLink>
      </nav>

      <CitySelector />
    </div>
  </header>
</template>

<script setup lang="ts">
const favoritesStore = useFavoritesStore();
const { favoritesCount } = storeToRefs(favoritesStore);
const route = useRoute();
const cityStore = useCityStore();
const { selectedCity } = storeToRefs(cityStore);
const currentCity = computed(
  () => (route.params.city as string) || selectedCity.value?.slug || "msk",
);
</script>

<style scoped>
.favorite-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  @media (max-width: 500px) {
    width: 16px;
    height: 14px;
  }
}

.favorite-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.675rem;
  font-weight: 600;
  padding: 0 4px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  @media (max-width: 500px) {
    font-size: 0.5rem;
    min-width: 16px;
    height: 16px;
  }
}

.nav-link-favorites {
  padding: 0.5rem 0.75rem;
  @media (max-width: 500px) {
    padding: 0.25rem 0.4rem;
  }
}
</style>

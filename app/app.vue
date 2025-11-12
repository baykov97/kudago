<script setup lang="ts">
const favoritesStore = useFavoritesStore()
onMounted((): void => {
  favoritesStore.initializeFromStorage()
})
</script>

<template>
  <div>
    <link
      rel="preload"
      href="/fonts/Roboto-Regular.woff2"
      as="font"
      type="font/woff2"
      crossorigin="anonymous"
    />
    <link
      rel="preload"
      href="/fonts/Roboto-Medium.woff2"
      as="font"
      type="font/woff2"
      crossorigin="anonymous"
    />

    <NuxtRouteAnnouncer />

    <Header />

    <main class="container">
      <NuxtPage />
    </main>
  </div>
</template>

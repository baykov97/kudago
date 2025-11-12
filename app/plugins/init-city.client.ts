export default defineNuxtPlugin(() => {
  const cityStore = useCityStore()
  // Инициализируем выбранный город из cookie на клиенте как можно раньше
  cityStore.initializeFromCookie()
})



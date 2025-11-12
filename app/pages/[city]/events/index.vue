<script setup lang="ts">
import type { EventsResponse, EventParams } from "~/types";
import CustomSelect from "~/components/CustomSelect.vue";

interface Filters {
  date: string;
  category: string;
  search: string;
}

const route = useRoute();
const router = useRouter();
const citySlug = computed(() => route.params.city as string);

const PAGE_SIZE = 12;

const filters = reactive<Filters>({
  date: (route.query.date as string) || "",
  category: (route.query.category as string) || "",
  search: (route.query.search as string) || "",
});

const currentPage = ref<number>(parseInt(route.query.page as string) || 1);

const apiParams = computed((): EventParams => {
  const params: EventParams = {
    location: citySlug.value,
    page: currentPage.value,
    page_size: PAGE_SIZE,
  };
  if (filters.date) {
    const today = new Date();
    if (filters.date === "today") {
      params.actual_since = today.toISOString().split("T")[0];
      params.actual_until = params.actual_since;
    } else if (filters.date === "tomorrow") {
      const t = new Date(today.getTime() + 86400000);
      params.actual_since = t.toISOString().split("T")[0];
      params.actual_until = params.actual_since;
    } else if (filters.date === "week") {
      const t = new Date(today.getTime() + 7 * 86400000);
      params.actual_since = today.toISOString().split("T")[0];
      params.actual_until = t.toISOString().split("T")[0];
    } else if (filters.date === "month") {
      const t = new Date(today.getTime() + 30 * 86400000);
      params.actual_since = today.toISOString().split("T")[0];
      params.actual_until = t.toISOString().split("T")[0];
    }
  }
  if (filters.category) params.categories = filters.category;
  if (filters.search) params.search = filters.search;
  return params;
});

const {
  data: events,
  pending,
  error,
} = await useLazyAsyncData<EventsResponse | null>(
  "city-events",
  async () => {
    const { fetchEvents } = useKudaGo();
    return await fetchEvents(apiParams.value);
  },
  { watch: [apiParams] },
);

watch(
  filters,
  () => {
    currentPage.value = 1;
    updateURL();
  },
  { deep: true },
);

const totalPages = computed(() => {
  if (!events.value?.count) return 1;
  return Math.ceil(events.value.count / PAGE_SIZE);
});

const pageNumbers = computed(() => {
  const pages: (number | string)[] = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (current > 3) {
      pages.push("...");
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push("...");
    }

    if (total > 1) {
      pages.push(total);
    }
  }

  return pages;
});

const goToPage = (page: number): void => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  updateURL();
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const updateURL = (): void => {
  const query: Record<string, string> = {};
  if (filters.date) query.date = filters.date;
  if (filters.category) query.category = filters.category;
  if (filters.search) query.search = filters.search;
  if (currentPage.value > 1) query.page = currentPage.value.toString();
  router.replace({ query });
};

const dateOptions = [
  { label: "Все даты", value: "" },
  { label: "Сегодня", value: "today" },
  { label: "Завтра", value: "tomorrow" },
  { label: "Эта неделя", value: "week" },
  { label: "Этот месяц", value: "month" },
];

const categoryOptions = [
  { label: "Все категории", value: "" },
  { label: "Концерты", value: "concert" },
  { label: "Театр", value: "theater" },
  { label: "Выставки", value: "exhibition" },
  { label: "Вечеринки", value: "party" },
  { label: "Спорт", value: "sport" },
  { label: "Образование", value: "education" },
  { label: "Развлечения", value: "entertainment" },
];

useHead({ title: `События в ${citySlug.value.toUpperCase()} - KudaGo` });
</script>

<template>
  <div>
    <h1>События</h1>
    <div class="filters">
      <div class="filters-grid">
        <div class="filter-group">
          <label class="filter-label">Дата</label>
          <CustomSelect
            v-model="filters.date"
            :items="dateOptions"
            placeholder="Все даты"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">Категория</label>
          <CustomSelect
            v-model="filters.category"
            :items="categoryOptions"
            placeholder="Все категории"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">Поиск</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Название события..."
            class="filter-input"
          />
        </div>
      </div>
    </div>

    <div v-if="pending" class="events-grid">
      <EventCardSkeleton v-for="n in 12" :key="`skeleton-${n}`" />
    </div>
    <div v-else-if="error" class="empty-state">
      <h3>Ошибка загрузки</h3>
      <p>{{ error }}</p>
    </div>
    <div v-else-if="!events?.results?.length" class="empty-state">
      <h3>События не найдены</h3>
      <p>Попробуйте изменить фильтры поиска</p>
    </div>
    <div v-else>
      <div class="events-info">
        <p>Найдено событий: {{ events.count }}</p>
      </div>
      <div class="events-grid">
        <EventCard
          v-for="event in events.results"
          :key="event.id"
          :event="event"
        />
      </div>
      <div
        v-if="events.next || events.previous || totalPages > 1"
        class="pagination"
      >
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="pending || currentPage === 1"
          class="pagination-btn pagination-btn-nav"
          aria-label="Предыдущая страница"
        >
          <span class="pagination-icon">←</span>
          <span class="pagination-text">Предыдущая</span>
        </button>

        <div class="pagination-pages">
          <button
            v-for="(page, index) in pageNumbers"
            :key="`page-${index}-${page}`"
            @click="typeof page === 'number' ? goToPage(page) : null"
            :disabled="typeof page === 'string' || pending"
            :class="[
              'pagination-page',
              {
                'pagination-page--active': page === currentPage,
                'pagination-page--disabled': typeof page === 'string',
              },
            ]"
            :aria-label="typeof page === 'number' ? `Страница ${page}` : ''"
            :aria-current="page === currentPage ? 'page' : undefined"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="pending || currentPage === totalPages"
          class="pagination-btn pagination-btn-nav"
          aria-label="Следующая страница"
        >
          <span class="pagination-text">Следующая</span>
          <span class="pagination-icon">→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.filters {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  &-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  & .filter-group {
    display: flex;
    flex-direction: column;
  }
}

.filter {
  &-label {
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: #2c3e50;
  }
  &-input {
    padding: 0.5rem 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    &:focus {
      outline: none;
      border-color: #e74c3c;
    }
  }
}

.events-info {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  p {
    margin: 0;
    color: #7f8c8d;
    font-size: 0.9rem;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 3rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 0.75rem 1.25rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #2c3e50;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    border-color: #e74c3c;
    color: #e74c3c;
    background: #fff5f5;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
}

.pagination-btn-nav {
  .pagination-icon {
    font-size: 1.1rem;
    line-height: 1;
  }

  .pagination-text {
    @media (max-width: 640px) {
      display: none;
    }
  }

  @media (max-width: 640px) {
    padding: 0.75rem;
    min-width: 44px;
    justify-content: center;
  }
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

.pagination-page {
  min-width: 44px;
  height: 44px;
  padding: 0.5rem 0.75rem;
  border: 2px solid transparent;
  border-radius: 8px;
  background: white;
  color: #2c3e50;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled):not(.pagination-page--active) {
    border-color: #e0e0e0;
    background: #f8f9fa;
    color: #e74c3c;
  }

  &--active {
    background: #e74c3c;
    color: white;
    border-color: #e74c3c;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);

    &:hover {
      background: #c0392b;
      border-color: #c0392b;
    }
  }

  &--disabled {
    cursor: default;
    color: #95a5a6;
    border: none;
    background: transparent;

    &:hover {
      background: transparent;
      border: none;
    }
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:active:not(:disabled):not(.pagination-page--disabled) {
    transform: scale(0.95);
  }
}

@media (max-width: 768px) {
  .pagination {
    padding: 1rem;
    gap: 0.25rem;
  }

  .pagination-page {
    min-width: 40px;
    height: 40px;
    padding: 0.5rem;
    font-size: 0.875rem;
  }
}
</style>

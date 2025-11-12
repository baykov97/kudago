<template>
  <div
    ref="rootEl"
    class="custom-select"
    :class="{ 'is-open': isOpen, 'is-disabled': disabled }"
    @keydown.stop.prevent="onKeydown"
  >
    <button
      type="button"
      class="select-trigger"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="select-label">{{ selectedLabel || placeholder }}</span>
      <span class="chevron">▾</span>
    </button>
    <ul v-if="isOpen" class="options" role="listbox">
      <li
        v-for="(item, idx) in items"
        :key="getItemValue(item)"
        :class="[
          'option',
          { 'is-active': idx === activeIndex, 'is-selected': isSelected(item) },
        ]"
        role="option"
        @click="select(item)"
        @mousemove="activeIndex = idx"
      >
        {{ getItemLabel(item) }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
type OptionLike = string | number | Record<string, any>;

const props = defineProps<{
  modelValue: string | number | null;
  items: OptionLike[];
  labelKey?: string;
  valueKey?: string;
  placeholder?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number | null): void;
  (e: "change", value: string | number | null): void;
}>();

const isOpen = ref(false);
const activeIndex = ref<number>(-1);
const rootEl = ref<HTMLElement | null>(null);

const placeholder = computed(() => props.placeholder ?? "Выберите...");

const getItemLabel = (item: OptionLike): string => {
  if (typeof item === "string" || typeof item === "number") return String(item);
  if (item && typeof item === "object") {
    const key = props.labelKey ?? "label";
    if (key in item && item[key] != null) return String(item[key]);
  }
  return String(item);
};

const getItemValue = (item: OptionLike): string | number => {
  if (typeof item === "string" || typeof item === "number") return item;
  if (item && typeof item === "object") {
    const key = props.valueKey ?? "value";
    if (key in item && item[key] != null) return item[key] as string | number;
  }
  return getItemLabel(item);
};

const selectedLabel = computed(() => {
  const item = props.items.find((i) => getItemValue(i) === props.modelValue);
  return item !== undefined ? getItemLabel(item) : "";
});

const isSelected = (item: OptionLike) =>
  getItemValue(item) === props.modelValue;

const toggle = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const select = (item: OptionLike | undefined) => {
  if (item === undefined) return;
  const value = getItemValue(item);
  emit("update:modelValue", value);
  emit("change", value);
  isOpen.value = false;
};

const onKeydown = (e: KeyboardEvent) => {
  if (!isOpen.value && (e.key === "Enter" || e.key === " ")) {
    isOpen.value = true;
    return;
  }
  if (!isOpen.value) return;
  if (e.key === "Escape") isOpen.value = false;
  if (e.key === "ArrowDown")
    activeIndex.value = Math.min(activeIndex.value + 1, props.items.length - 1);
  if (e.key === "ArrowUp")
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
  if (e.key === "Enter") {
    const item = props.items[activeIndex.value];
    if (item !== undefined) select(item);
  }
};

const handleDocumentClick = (e: MouseEvent) => {
  if (!isOpen.value) return;
  const target = e.target as Node | null;
  if (rootEl.value && target && !rootEl.value.contains(target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick);
});
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
}
.select-trigger {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  color: #2c3e50;
}
.select-trigger:disabled {
  background: #f5f7fa;
  color: #b4bcc3;
  cursor: not-allowed;
}
.options {
  position: absolute;
  z-index: 10;
  margin-top: 4px;
  width: fit-content;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  max-height: 260px;
  overflow: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  min-width: 100%;
  right: 0;
  top: 100%;
}
.option {
  padding: 8px 12px;
  cursor: pointer;
  white-space: nowrap;
}
.option.is-active {
  background: #f5f7fa;
}
.option.is-selected {
  font-weight: 600;
}
.chevron {
  margin-left: 8px;
  color: #7f8c8d;
}
</style>

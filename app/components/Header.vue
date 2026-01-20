<script setup lang="ts">
/**
 * Component: Header
 *
 * @file ./app/components/Header.vue
 * @description Header component
 * @module HeaderComponent
 */

const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const localePath = useLocalePath();
const config = useRuntimeConfig();

const navData = await import("../../data/nav.json") as { default: { nav: unknown[] } };
const navItems = navData.default.nav;

const isOpen = ref<Record<number, boolean>>({});

const openDropdown = (index: number) => {
  isOpen.value = { ...isOpen.value, [index]: true };
};

const closeDropdown = (index: number) => {
  isOpen.value = { ...isOpen.value, [index]: false };
};

const getItemPath = (item: unknown): string => {
  return (item as { path?: string })?.path ?? "";
};

const getItemName = (item: unknown): string => {
  return (item as { name?: string })?.name ?? "";
};

const getItemChildren = (item: unknown): unknown[] => {
  return (item as { children?: unknown[] })?.children ?? [];
};

const hasChildren = (item: unknown): boolean => {
  const children = getItemChildren(item);
  return Array.isArray(children) && children.length > 0;
};
</script>

<template>
  <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo/Home Link -->
        <div class="shrink-0">
          <NuxtLink 
            :to="localePath('/')" 
            class="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
          >
            {{ config.public.siteName }}
          </NuxtLink>
        </div>

        <!-- Navigation Links -->
        <div class="hidden md:flex md:space-x-8 md:items-center">
          <template v-for="(item, index) in navItems" :key="getItemPath(item)">
            <!-- Simple Link (no children) -->
            <NuxtLink
              v-if="!hasChildren(item)"
              :to="localePath(getItemPath(item))"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              {{ getItemName(item) }}
            </NuxtLink>

            <!-- Dropdown Link (with children) -->
            <div
              v-else
              class="relative"
              @mouseenter="openDropdown(index)"
              @mouseleave="closeDropdown(index)"
            >
              <button
                type="button"
                class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1"
                :aria-expanded="isOpen[index]"
                aria-haspopup="true"
              >
                {{ getItemName(item) }}
                <svg
                  class="w-4 h-4 transition-transform"
                  :class="{ 'rotate-180': isOpen[index] }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div
                v-show="isOpen[index]"
                class="absolute left-0 top-full pt-2 w-48 z-50"
                @mouseenter="openDropdown(index)"
                @mouseleave="closeDropdown(index)"
              >
                <div class="bg-white rounded-md shadow-lg border border-gray-200 py-1">
                  <NuxtLink
                    :to="localePath(getItemPath(item))"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    @click="closeDropdown(index)"
                  >
                    {{ getItemName(item) }}
                  </NuxtLink>
                  <template v-for="child in getItemChildren(item)" :key="getItemPath(child)">
                    <NuxtLink
                      :to="localePath(getItemPath(child))"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      @click="closeDropdown(index)"
                    >
                      {{ getItemName(child) }}
                    </NuxtLink>
                  </template>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Language Switcher -->
        <div class="flex items-center space-x-2">
          <template v-for="loc in locales" :key="loc.code">
            <NuxtLink
              :to="switchLocalePath(loc.code)"
              :class="[
                'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                locale === loc.code
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              {{ loc.name }}
            </NuxtLink>
          </template>
        </div>
      </div>
    </nav>
  </header>
</template>

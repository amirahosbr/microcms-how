<script setup lang="ts">
const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const localePath = useLocalePath();
const config = useRuntimeConfig();
</script>

<template>
  <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo/Home Link -->
        <div class="flex-shrink-0">
          <NuxtLink 
            :to="localePath('/')" 
            class="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
          >
            {{ config.public.siteName }}
          </NuxtLink>
        </div>

        <!-- Navigation Links -->
        <div class="hidden md:flex md:space-x-8">
          <NuxtLink 
            :to="localePath('/news')" 
            class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
          >
            News
          </NuxtLink>
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

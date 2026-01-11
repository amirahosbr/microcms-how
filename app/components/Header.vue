<script setup lang="ts">
const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const localePath = useLocalePath();

const currentLocale = computed(() => locale.value);
const availableLocales = computed(() => locales.value);

const switchLanguage = (targetLocale: "ja" | "en") => {
  const path = switchLocalePath(targetLocale);
  if (path) {
    navigateTo(path);
  }
};

const homePath = computed(() => localePath('/'));
</script>

<template>
  <header class="border-b border-gray-200 bg-white">
    <div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo/Title -->
        <div class="flex-shrink-0">
          <NuxtLink :to="homePath" class="text-xl font-semibold text-gray-900">
            {{ $config.public.siteName }}
          </NuxtLink>
        </div>

        <nav class="flex items-center gap-4">
          <NuxtLink :to="localePath('/news')" class="text-gray-600 hover:text-gray-900 transition-colors">
            {{ $t("news.title") }}
          </NuxtLink>
        </nav>

        <!-- Language Switcher -->
        <nav class="flex items-center gap-2">
          <button
            v-for="loc in availableLocales"
            :key="loc.code"
            @click="switchLanguage(loc.code)"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded transition-colors',
              currentLocale === loc.code
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            ]"
          >
            {{ loc.name }}
          </button>
        </nav>
      </div>
    </div>
  </header>
</template>

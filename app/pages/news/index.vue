<script setup lang="ts">
import type { NewsListResponse } from "~~/shared/types/news";
const { t, locale } = useI18n();
const localePath = useLocalePath();

// Fetch news list from microCMS
const { data: newsList, pending, error, refresh } = await useFetch<NewsListResponse>('/api/list', {
  query: {
    endpoint: 'news',
    limit: '10',
    offset: '0',
    orders: '-publishedAt'
  },
  default: () => ({ contents: [], totalCount: 0, limit: 10, offset: 0 }),
  key: `news-list-${locale.value}`,
  server: true,
});

// Refresh data when navigating to this page to get latest changes
// onMounted runs when component is first created
onMounted(() => {
  if (process.client) {
    refresh();
  }
});

// onActivated runs when component is activated (works with keep-alive)
onActivated(() => {
  if (process.client) {
    refresh();
  }
});

// Helper to get localized title with fallback
const getLocalizedTitle = (item: { title?: string; title_en?: string }) => {
  if (locale.value === "en") {
    return item.title_en || item.title || "";
  }
  return item.title || item.title_en || "";
};

// Check if item is media category
const isMediaCategory = (item: { category?: { id?: string } | null }) => {
  return item.category?.id === "media";
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-4xl font-bold text-gray-900 mb-8">{{ t("news.title") }}</h1>

      <!-- Loading State -->
      <div v-if="pending" class="flex items-center justify-center py-20">
        <div class="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
        <p class="text-red-600 text-lg mb-2">Failed to load items.</p>
        <p class="text-sm text-gray-500">{{ error.message || 'Unknown error occurred' }}</p>
        <p class="text-xs text-gray-400 mt-4">Check console for details</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!newsList?.contents?.length" class="flex flex-col items-center justify-center py-20">
        <p class="text-gray-500 text-lg mb-2">No news articles found.</p>
        <p class="text-sm text-gray-400">Total count: {{ newsList?.totalCount || 0 }}</p>
        <p class="text-xs text-gray-400 mt-4">Make sure your microCMS environment variables are set correctly</p>
      </div>

      <!-- List Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <template v-for="item in newsList.contents" :key="item.id">
          <!-- Media category: external link -->
          <a
            v-if="isMediaCategory(item) && item.external_url"
            :href="item.external_url"
            target="_blank"
            rel="noopener noreferrer"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 block"
          >
            <!-- Image -->
            <div v-if="item.image" class="w-full h-48 overflow-hidden bg-gray-200">
              <img
                :src="item.image.url"
                :alt="getLocalizedTitle(item)"
                class="w-full h-full object-cover"
              />
            </div>
            <div v-else class="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span class="text-gray-400">No Image</span>
            </div>

            <!-- Content -->
            <div class="p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                {{ getLocalizedTitle(item) }}
              </h2>
              <time
                :datetime="item.publishedAt"
                class="text-xs text-gray-500"
              >
                {{ new Date(item.publishedAt).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }) }}
              </time>
            </div>
          </a>

          <!-- Non-media category: internal link to detail page -->
          <NuxtLink
            v-else
            :to="localePath(`/news/${item.id}`)"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 block"
          >
            <!-- Image -->
            <div v-if="item.image" class="w-full h-48 overflow-hidden bg-gray-200">
              <img
                :src="item.image.url"
                :alt="getLocalizedTitle(item)"
                class="w-full h-full object-cover"
              />
            </div>
            <div v-else class="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span class="text-gray-400">No Image</span>
            </div>

            <!-- Content -->
            <div class="p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                {{ getLocalizedTitle(item) }}
              </h2>
              <time
                :datetime="item.publishedAt"
                class="text-xs text-gray-500"
              >
                {{ new Date(item.publishedAt).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }) }}
              </time>
            </div>
          </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>
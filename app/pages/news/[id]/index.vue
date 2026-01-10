<script setup lang="ts">
import type { NewsDetail } from "~~/shared/types/news";

const route = useRoute();
const config = useRuntimeConfig();
const { t, locale } = useI18n();

// Fetch news detail from microCMS
const { data: newsDetail, pending, error } = await useFetch<NewsDetail>(
  "/api/article",
  {
    query: {
      endpoint: "news",
      contentId: route.params.id as string,
    },
    default: () => undefined,
  }
);

// Handle 404
if (!pending.value && !newsDetail.value && !error.value) {
  throw createError({
    statusCode: 404,
    message: t("news.notFound"),
  });
}

// Computed for localized title and description
const displayTitle = computed(() => 
  locale.value === "ja" ? newsDetail.value?.title : newsDetail.value?.title_en || newsDetail.value?.title
);

const displayDescription = computed(() => 
  locale.value === "ja" ? newsDetail.value?.title : newsDetail.value?.title_en || newsDetail.value?.title || t("news.title")
);

// SEO Meta
useSeoMeta({
  title: newsDetail.value
    ? `${displayTitle.value} | ${config.public.siteName}`
    : `${t("news.title")} | ${config.public.siteName}`,
  description: displayDescription.value,
  ogTitle: displayTitle.value || t("news.title"),
  ogDescription: displayDescription.value,
  ogImage: newsDetail.value?.image?.url || `${config.public.siteDomain}/images/ogpimg.png`,
  twitterCard: "summary_large_image",
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center min-h-screen">
      <div class="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <p class="text-red-600 text-lg mb-4">{{ t("news.failedToLoad") }}</p>
        <NuxtLink :to="$localePath('/news')" class="text-blue-600 hover:underline">
          ← {{ t("news.backToNews") }}
        </NuxtLink>
      </div>
    </div>

    <!-- Article Content -->
    <article v-else-if="newsDetail" class="max-w-4xl mx-auto px-4 py-12">
      <!-- Header -->
      <header class="mb-8">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {{ displayTitle }}
        </h1>
        
        <!-- Meta Info -->
        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-b border-gray-200 pb-6">
          <time :datetime="newsDetail.publishedAt">
            {{ new Date(newsDetail.publishedAt).toLocaleDateString(locale) }}
          </time>
          <a 
            v-if="newsDetail.external_url" 
            :href="newsDetail.external_url" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-blue-600 hover:underline"
          >
            {{ t("news.readOriginalArticle") }} →
          </a>
        </div>
      </header>

      <!-- Featured Image -->
      <div v-if="newsDetail.image" class="mb-12">
        <img
          :src="newsDetail.image.url"
          :alt="newsDetail.title"
          class="w-full h-auto rounded-lg shadow-lg"
        />
      </div>

      <!-- Content Blocks (Repeat Field) -->
      <div v-if="newsDetail.contentBlocks && newsDetail.contentBlocks.length > 0" class="space-y-8">
        <ContentBlockRenderer
          v-for="(block, index) in newsDetail.contentBlocks"
          :key="`${block.fieldId}-${index}`"
          :block="block"
          :index="index"
        />
      </div>

      <!-- Fallback: If no contentBlocks, show empty state -->
      <div v-else class="text-center py-12 text-gray-500">
        <p>{{ t("news.noContent") }}</p>
      </div>

      <!-- Back Link -->
      <div class="mt-12 pt-8 border-t border-gray-200">
        <NuxtLink 
          :to="$localePath('/news')" 
          class="inline-flex items-center text-blue-600 hover:underline"
        >
          ← {{ t("news.backToNews") }}
        </NuxtLink>
      </div>
    </article>
  </div>
</template>

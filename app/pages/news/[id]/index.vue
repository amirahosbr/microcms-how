<script setup lang="ts">
import type { NewsDetail, ContentBlock } from "~~/shared/types/news";
import ContentBlockRenderer from "~~/app/components/ContentBlocks/ContentBlockRenderer.vue";

const route = useRoute();
const config = useRuntimeConfig();
const { t, locale } = useI18n();
const localePath = useLocalePath();

// Extract ID from route params (works with both /news/[id] and /ja/news/[id])
const articleId = computed(() => {
  // Handle both direct id and potential nested params
  const id = route.params.id;
  if (Array.isArray(id)) {
    return id[0] as string;
  }
  return id as string;
});

// Fetch news detail from microCMS
const { data: newsDetail, pending, error } = await useFetch<NewsDetail>(
  "/api/article",
  {
    query: {
      endpoint: "news",
      contentId: articleId.value,
    },
    default: () => undefined,
    key: `article-${articleId.value}-${locale.value}`,
  }
);

// Handle 404
if (!pending.value && !newsDetail.value && !error.value) {
  throw createError({
    statusCode: 404,
    message: t("news.notFound"),
  });
}

// Redirect media category items to external URL (no detail page for media)
watch([newsDetail, pending], ([detail, isLoading]) => {
  if (!isLoading && detail) {
    const isMedia = detail.category?.id === "media";
    if (isMedia && detail.external_url) {
      navigateTo(detail.external_url, { external: true });
    }
  }
}, { immediate: true });

// Computed for localized title and description (with fallback)
const displayTitle = computed(() => {
  if (!newsDetail.value) return "";
  if (locale.value === "en") {
    return newsDetail.value.title_en || newsDetail.value.title || "";
  }
  return newsDetail.value.title || newsDetail.value.title_en || "";
});

// Computed for localized description (no fallback - only show if locale-specific exists)
const displayDescription = computed(() => {
  if (!newsDetail.value) return "";
  if (locale.value === "en") {
    return newsDetail.value.description_en || "";
  }
  return newsDetail.value.description || "";
});

// Computed for content blocks
const contentBlocks = computed(() => {
  if (!newsDetail.value) {
    console.log('[contentBlocks] No newsDetail.value');
    return [];
  }
  
  const body = newsDetail.value.body;
  const contentBlocks = newsDetail.value.contentBlocks;
  
  console.log('[contentBlocks] body:', body, 'type:', typeof body, 'isArray:', Array.isArray(body));
  console.log('[contentBlocks] contentBlocks:', contentBlocks);
  
  const blocks = (body || contentBlocks || []) as ContentBlock[];
  console.log('[contentBlocks] Final blocks:', blocks.length, blocks);
  
  return blocks;
});

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
        <NuxtLink :to="localePath('/news')" class="text-blue-600 hover:underline">
          ← {{ t("news.backToNews") }}
        </NuxtLink>
      </div>
    </div>

    <!-- Article Content -->
    <article v-else-if="newsDetail" class="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
      <!-- Header -->
      <header class="mb-10 md:mb-12">
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {{ displayTitle }}
        </h1>
        
        <!-- Description -->
        <p v-if="displayDescription" class="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed">
          {{ displayDescription }}
        </p>
        
        <!-- Meta Info -->
        <div class="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-500 border-b border-gray-200 pb-6">
          <time :datetime="newsDetail.publishedAt">
            {{ new Date(newsDetail.publishedAt).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }) }}
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
      <div v-if="newsDetail.image" class="mb-12 md:mb-16">
        <img
          :src="newsDetail.image.url"
          :alt="newsDetail.title"
          class="w-full h-auto rounded-lg shadow-lg"
        />
      </div>

      <!-- Content Blocks (Repeat Field) - body or contentBlocks -->
      <div v-if="contentBlocks && contentBlocks.length > 0" class="space-y-4">
        <!-- Debug: Show block count -->
        <!-- <div class="mb-4 p-2 bg-blue-50 text-xs">
          Rendering {{ contentBlocks.length }} content blocks
        </div> -->
        
        <ContentBlockRenderer
          v-for="(block, index) in contentBlocks"
          :key="`${block.fieldId}-${index}`"
          :block="block"
          :index="index"
        />
      </div>

      <!-- Fallback: If no body/contentBlocks but has legacy content field -->
      <div v-else-if="newsDetail.content" class="prose prose-lg max-w-none py-6">
        <div 
          class="rich-text-content"
          v-html="useSanitize().sanitizeHtml(newsDetail.content)"
        />
      </div>

      <!-- Fallback: If no body/contentBlocks, show empty state -->
      <div v-else class="text-center py-12 text-gray-500">
        <p>{{ t("news.noContent") }}</p>
        <!-- Debug: Show why blocks aren't rendering -->
        <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded text-sm text-left">
          <p><strong>Debug: No content blocks found</strong></p>
          <p>Body exists: {{ !!newsDetail.body }}</p>
          <p>Body length: {{ newsDetail.body?.length || 0 }}</p>
          <p>ContentBlocks computed length: {{ contentBlocks.length }}</p>
          <p>Body type: {{ Array.isArray(newsDetail.body) ? 'array' : typeof newsDetail.body }}</p>
          <p>First block fieldId: {{ (newsDetail.body?.[0] as any)?.fieldId || 'none' }}</p>
          <pre class="mt-2 text-xs">{{ JSON.stringify(newsDetail.body?.slice(0, 1), null, 2) }}</pre>
        </div>
      </div>

      <!-- Back Link -->
      <div class="mt-12 pt-8 border-t border-gray-200">
        <NuxtLink 
          :to="localePath('/news')" 
          class="inline-flex items-center text-blue-600 hover:underline"
        >
          ← {{ t("news.backToNews") }}
        </NuxtLink>
      </div>
    </article>
  </div>
</template>

<style scoped>
.rich-text-content :deep(img) {
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  max-width: 100%;
  height: auto;
}

.rich-text-content :deep(figure) {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.rich-text-content :deep(figure img) {
  width: 100%;
}

.rich-text-content :deep(figcaption) {
  font-size: 0.875rem;
  color: rgb(75 85 99);
  text-align: center;
  margin-top: 0.5rem;
  font-style: italic;
}

.rich-text-content :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.625;
}

.rich-text-content :deep(ul),
.rich-text-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.rich-text-content :deep(li) {
  margin-bottom: 0.5rem;
}

.rich-text-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.rich-text-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.rich-text-content :deep(a) {
  color: rgb(37 99 235);
}

.rich-text-content :deep(a:hover) {
  text-decoration: underline;
}

.rich-text-content :deep(blockquote) {
  border-left: 4px solid rgb(209 213 219);
  padding-left: 1rem;
  font-style: italic;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.rich-text-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.rich-text-content :deep(th),
.rich-text-content :deep(td) {
  border: 1px solid rgb(209 213 219);
  padding: 0.5rem 1rem;
}

.rich-text-content :deep(th) {
  background-color: rgb(243 244 246);
  font-weight: 600;
}
</style>

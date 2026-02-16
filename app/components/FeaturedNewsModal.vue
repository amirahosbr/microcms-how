<script setup lang="ts">
/**
 * Featured news modal. Data is prefetched on the articles page so this composable
 * reuses the same useFetch state and the modal can show without waiting for a new request.
 */
const { article, hasArticle, pending, source } = useFeaturedNews();

const isOpen = ref(false);

// Modal only renders on articles page, so no route check needed
const showModal = computed(
	() => hasArticle.value && isOpen.value
);

// Open modal when article is loaded (immediate for SSR/hydration)
watch(hasArticle, (v) => {
	if (v) isOpen.value = true;
}, { immediate: true });

// Article shape from microCMS
const title = computed(
	() => (article.value as { title?: string })?.title ?? ""
);
const titleEn = computed(
	() => (article.value as { title_en?: string })?.title_en
);
const description = computed(
	() => (article.value as { description?: string })?.description ?? ""
);
const articleId = computed(
	() => (article.value as { id?: string })?.id ?? ""
);

// Localized title
const displayTitle = computed(() => titleEn.value ?? title.value ?? "");
</script>

<template>
	<div v-if="showModal" class="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
		<div class="pointer-events-auto w-full max-w-sm sm:max-w-md">
			<!-- Modal card bottom-right -->
			<div
				class="relative rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
				role="dialog"
				aria-modal="true"
				aria-labelledby="featured-news-title"
			>
			<template v-if="pending">
				<div class="flex items-center justify-center py-16">
					<div class="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
				</div>
			</template>

			<template v-else>
				<!-- Header -->
				<div class="px-6 pt-6 pb-4">
					<span
						v-if="source === 'featured'"
						class="inline-block px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded mb-3"
					>
						Featured
					</span>
					<h2 id="featured-news-title" class="text-xl font-bold text-gray-900">
						{{ displayTitle }}
					</h2>
					<p v-if="description" class="mt-2 text-sm text-gray-600 line-clamp-3">
						{{ description }}
					</p>
				</div>

				<!-- Actions -->
				<div class="flex gap-3 px-6 pb-6">
					<NuxtLink
						:to="`/news/${articleId}`"
						class="flex-1 inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
					>
						Read Article
					</NuxtLink>
					<button
						type="button"
						class="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
						@click="isOpen = false"
					>
						Dismiss
					</button>
				</div>

				<!-- Close -->
				<button
					type="button"
					class="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded"
					aria-label="Close"
					@click="isOpen = false"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</template>
			</div>
		</div>
	</div>
</template>

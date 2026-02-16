<script setup lang="ts">
import type { NewsListResponse } from "~~/shared/types/news";

const { locale } = useI18n();
const route = useRoute();

// Watch for route changes and refresh data
watch(() => route.fullPath, () => {
	if (process.client) refresh();
});

const { data: articleList, pending, error, refresh } = await useFetch<NewsListResponse>(
	"/api/article",
	{
		query: {
			endpoint: "news",
			limit: "10",
			offset: "0",
			orders: "-publishedAt",
		},
		default: () => ({ contents: [], totalCount: 0, limit: 10, offset: 0 }),
		key: `articles-list-${locale.value}`,
		server: true,
		// Disable caching - always fetch fresh data
		getCachedData: () => undefined,
	}
);

onMounted(() => {
	if (process.client) refresh();
});
onActivated(() => {
	if (process.client) refresh();
});

const getCategoryLabels = (item: { category?: unknown | unknown[] | null }) => {
	const cat = item.category;
	if (!cat) return [];
	const items = Array.isArray(cat) ? cat : [cat];
	return items.map((c: unknown) =>
		locale.value === "en"
			? (c as { title_en?: string; title?: string }).title_en ?? (c as { title?: string }).title ?? ""
			: (c as { title?: string; title_en?: string }).title ?? (c as { title_en?: string }).title_en ?? ""
	);
};
</script>

<template>
	<div class="min-h-screen bg-gray-50 py-12 px-4">
		<div class="max-w-7xl mx-auto">
			<h1 class="text-4xl font-bold text-gray-900 mb-8">Articles</h1>
			<p class="text-gray-600 mb-8">
				Browse our latest articles. A featured article may appear in the modal when you visit.
			</p>

			<!-- Loading -->
			<div v-if="pending" class="flex items-center justify-center py-20">
				<div
					class="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"
				/>
			</div>

			<!-- Error -->
			<div v-else-if="error" class="flex items-center justify-center py-20">
				<p class="text-red-600">Failed to load articles.</p>
			</div>

			<!-- Empty -->
			<div
				v-else-if="!articleList?.contents?.length"
				class="flex items-center justify-center py-20"
			>
				<p class="text-gray-500">No articles found.</p>
			</div>

			<!-- Grid -->
			<div
				v-else
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
			>
				<NuxtLink
					v-for="item in articleList.contents"
					:key="item.id"
					:to="`/news/${item.id}`"
					class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 block"
				>
					<div
						v-if="item.image"
						class="w-full h-48 overflow-hidden bg-gray-200"
					>
						<img
							:src="item.image.url"
							:alt="item.title"
							class="w-full h-full object-cover"
						/>
					</div>
					<div
						v-else
						class="w-full h-48 bg-gray-200 flex items-center justify-center"
					>
						<span class="text-gray-400">No Image</span>
					</div>

					<div class="p-6">
						<h2
							class="text-xl font-semibold text-gray-900 mb-2 line-clamp-2"
						>
							{{ item.title }}
						</h2>
						<p
							v-if="item.title_en"
							class="text-sm text-gray-600 mb-4 line-clamp-2"
						>
							{{ item.title_en }}
						</p>
						<time
							:datetime="item.publishedAt"
							class="text-xs text-gray-500"
						>
							{{ new Date(item.publishedAt).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" }) }}
						</time>
						<div v-if="getCategoryLabels(item).length" class="mt-2 flex flex-wrap gap-2">
							<span
								v-for="(label, i) in getCategoryLabels(item)"
								:key="i"
								class="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700"
							>
								{{ label }}
							</span>
						</div>
					</div>
				</NuxtLink>
			</div>
		</div>
	</div>

	<ClientOnly>
		<FeaturedNewsModal />
	</ClientOnly>
</template>

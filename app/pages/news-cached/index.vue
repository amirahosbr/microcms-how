<script setup lang="ts">
import type { NewsListResponse } from "~~/shared/types/news";
const { t, locale } = useI18n();
const localePath = useLocalePath();

// Uses same /api/list as /news (stale-while-revalidate). No webhook = new articles
// don't appear until cache TTL. With webhook, cache is cleared so both /news and this page sync immediately.
const { data: newsList, pending, error, refresh } = await useFetch<NewsListResponse>(
	"/api/list",
	{
		query: {
			endpoint: "news",
			limit: "10",
			offset: "0",
			orders: "-publishedAt",
		},
		default: () => ({ contents: [], totalCount: 0, limit: 10, offset: 0 }),
		key: `news-list-cached-${locale.value}`,
		server: true,
	},
);

onMounted(() => {
	if (process.client) refresh();
});
onActivated(() => {
	if (process.client) refresh();
});

const getLocalizedTitle = (item: { title?: string; title_en?: string }) =>
	locale.value === "en" ? item.title_en || item.title || "" : item.title || item.title_en || "";

const isMediaCategory = (item: { category?: { id?: string } | null }) =>
	item.category?.id === "media";

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
			<div
				class="mb-6 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900"
			>
				<p class="font-semibold mb-1">Stale cache, no webhook (demo)</p>
				<p class="mb-1">
					This page uses <code class="rounded bg-sky-200 px-1">/api/list</code> (with
					<code class="rounded bg-sky-200 px-1">stale-while-revalidate</code>). Without
					webhook, new articles published in microCMS can take up to the cache TTL (e.g. 1
					hour) to appear here.
				</p>
				<p>
					With webhook configured (News API → カスタム通知 → your
					<code class="rounded bg-sky-200 px-1">/api/webhook</code>), cache is cleared on
					publish/update/delete, so new articles show immediately on
					<NuxtLink :to="localePath('/news')" class="font-medium underline">/news</NuxtLink>.
				</p>
			</div>

			<h1 class="text-4xl font-bold text-gray-900 mb-8">
				{{ t("news.title") }}
				<span class="text-lg font-normal text-gray-500">(cached, no webhook)</span>
			</h1>

			<div v-if="pending" class="flex items-center justify-center py-20">
				<div
					class="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"
				/>
			</div>

			<div v-else-if="error" class="flex flex-col items-center justify-center py-20">
				<p class="text-red-600 text-lg mb-2">Failed to load items.</p>
				<p class="text-sm text-gray-500">{{ error.message || "Unknown error occurred" }}</p>
			</div>

			<div
				v-else-if="!newsList?.contents?.length"
				class="flex flex-col items-center justify-center py-20"
			>
				<p class="text-gray-500 text-lg mb-2">No news articles found.</p>
				<p class="text-sm text-gray-400">Total count: {{ newsList?.totalCount || 0 }}</p>
			</div>

			<div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<template v-for="item in newsList.contents" :key="item.id">
					<a
						v-if="isMediaCategory(item) && item.external_url"
						:href="item.external_url"
						target="_blank"
						rel="noopener noreferrer"
						class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 block"
					>
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
						<div class="p-6">
							<h2 class="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
								{{ getLocalizedTitle(item) }}
							</h2>
							<time :datetime="item.publishedAt" class="text-xs text-gray-500">
								{{
									new Date(item.publishedAt).toLocaleDateString(locale, {
										year: "numeric",
										month: "long",
										day: "numeric",
									})
								}}
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
					</a>
					<NuxtLink
						v-else
						:to="localePath(`/news/${item.id}`)"
						class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 block"
					>
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
						<div class="p-6">
							<h2 class="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
								{{ getLocalizedTitle(item) }}
							</h2>
							<time :datetime="item.publishedAt" class="text-xs text-gray-500">
								{{
									new Date(item.publishedAt).toLocaleDateString(locale, {
										year: "numeric",
										month: "long",
										day: "numeric",
									})
								}}
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
				</template>
			</div>
		</div>
	</div>
</template>

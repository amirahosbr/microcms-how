<script setup lang="ts">
/**
 * Page: News – Draft preview
 *
 * @file ./app/pages/news/draft/[id]/index.vue
 * @description お知らせのプレビューページです。microCMS のプレビューリンク（draftKey 付き）で表示します。
 */

import type { NewsDetail, ContentBlock } from "~~/shared/types/news";
import ContentBlockRenderer from "~~/app/components/ContentBlocks/ContentBlockRenderer.vue";

const route = useRoute();
const config = useRuntimeConfig();
const { t, locale } = useI18n();
const localePath = useLocalePath();
const { isNewArticle } = useArticleHelpers();
const { sanitizeHtml } = useSanitize();

// Fetch News List
const { data: newsList, pending: newsPending } = await useFetch("/api/list", {
	query: {
		endpoint: "news",
		limit: "3",
		orders: "-publishedAt",
	},
});

// Fetch News Detail
const { data: newsDetail, pending: newsDetailPending } = useFetch<NewsDetail>("/api/article", {
	query: {
		endpoint: "news",
		contentId: route.params.id,
		draftKey: route.query.draftKey,
	},
});

const isNew = computed(() =>
	newsDetail.value?.publishedAt ? isNewArticle(newsDetail.value.publishedAt) : false,
);

const processedContent = computed(() => {
	const raw = newsDetail.value?.content;
	return raw ? sanitizeHtml(raw) : "";
});

const contentBlocks = computed(() => {
	const body = newsDetail.value?.body ?? newsDetail.value?.contentBlocks;
	return (body ?? []) as ContentBlock[];
});

const displayTitle = computed(() => {
	const d = newsDetail.value;
	if (!d) return "";
	return locale.value === "en" ? d.title_en || d.title || "" : d.title || d.title_en || "";
});

useSeoMeta({
	title: computed(() =>
		newsDetail.value
			? `【プレビュー】${displayTitle.value}｜${config.public.siteName}`
			: `【プレビュー】お知らせ詳細｜${config.public.siteName}`,
	),
	description: newsDetail.value?.description ?? "",
	ogTitle: computed(() =>
		newsDetail.value
			? `【プレビュー】${displayTitle.value}｜${config.public.siteName}`
			: `【プレビュー】お知らせ詳細｜${config.public.siteName}`,
	),
	ogImage: newsDetail.value?.image?.url ?? `${config.public.siteDomain}/images/ogpimg.png`,
	twitterCard: "summary_large_image",
});
</script>

<template>
	<div class="min-h-screen bg-gray-50 py-12 px-4">
		<div class="max-w-6xl mx-auto">
			<!-- Draft preview banner -->
			<div
				class="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800"
			>
				[Preview] This is a draft. You are viewing it via the microCMS preview URL (with draftKey).
			</div>

			<div v-if="newsDetailPending" class="flex justify-center py-20">
				<div class="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
			</div>
			<template v-else-if="newsDetail">
				<!-- Breadcrumb -->
				<nav class="mb-6 flex gap-2 text-sm text-gray-500">
					<NuxtLink :to="localePath('/news')" class="hover:text-gray-900">{{ t("news.title") }}</NuxtLink>
					<span>/</span>
					<span class="text-gray-700">{{ newsDetail.title }}</span>
				</nav>

				<article class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
					<header class="px-6 py-6 md:px-8 md:py-8">
						<div class="flex flex-wrap items-center gap-2 mb-2">
							<time
								:datetime="newsDetail.publishedAt"
								class="text-sm text-gray-500"
							>
								{{ new Date(newsDetail.publishedAt).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" }) }}
							</time>
							<span
								v-if="newsDetail.category"
								class="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700"
							>
								{{ Array.isArray(newsDetail.category) ? newsDetail.category.map((c: unknown) => (c as { title?: string }).title).join(", ") : (newsDetail.category as { title?: string })?.title }}
							</span>
							<span
								v-if="isNew"
								class="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
							>
								New
							</span>
						</div>
						<h1 class="text-2xl md:text-3xl font-bold text-gray-900">
							{{ displayTitle }}
						</h1>
					</header>

					<div v-if="newsDetail.image" class="w-full aspect-video overflow-hidden bg-gray-100">
						<NuxtImg
							:src="newsDetail.image.url"
							:alt="displayTitle"
							class="w-full h-full object-cover"
						/>
					</div>

					<div class="px-6 py-6 md:px-8 md:py-8">
						<div v-if="contentBlocks.length" class="space-y-8">
							<ContentBlockRenderer
								v-for="(block, index) in contentBlocks"
								:key="`${block.fieldId}-${index}`"
								:block="block"
								:index="index"
							/>
						</div>
						<div v-else-if="processedContent" class="prose prose-gray max-w-none" v-html="processedContent" />
						<p v-else class="text-gray-500">{{ t("news.noContent") }}</p>
					</div>
				</article>

				<div class="mt-8 flex justify-center">
					<NuxtLink
						:to="localePath('/contact')"
						class="rounded-full border-2 border-gray-900 px-6 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
					>
						お問い合わせ
					</NuxtLink>
				</div>
			</template>

			<div v-else class="py-20 text-center text-gray-600">
				<p>{{ t("news.notFound") }}</p>
				<p class="mt-2 text-sm">draftKey を付けた URL でアクセスしてください（microCMS のプレビューリンク）。</p>
				<NuxtLink :to="localePath('/news')" class="mt-4 inline-block text-blue-600 underline">
					{{ t("news.backToNews") }}
				</NuxtLink>
			</div>

			<!-- Latest News -->
			<section class="mt-16">
				<div class="flex items-end justify-between gap-4 mb-6">
					<h2 class="text-xl font-bold text-gray-900">最新記事</h2>
					<NuxtLink :to="localePath('/news')" class="text-sm font-medium text-gray-600 hover:text-gray-900 underline">
						一覧を見る
					</NuxtLink>
				</div>
				<div v-if="newsPending" class="flex justify-center py-10">
					<div class="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
				</div>
				<div
					v-else-if="newsList?.contents?.length"
					class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
				>
					<NuxtLink
						v-for="item in newsList.contents"
						:key="(item as { id: string }).id"
						:to="localePath(`/news/${(item as { id: string }).id}`)"
						class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
					>
						<div
							v-if="(item as { image?: { url: string } }).image"
							class="aspect-video bg-gray-100"
						>
							<NuxtImg
								:src="(item as unknown as { image?: { url: string } }).image!.url"
								:alt="(item as { title?: string }).title ?? ''"
								class="w-full h-full object-cover"
							/>
						</div>
						<div v-else class="aspect-video bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
							No Image
						</div>
						<div class="p-4">
							<time class="text-xs text-gray-500">
								{{ new Date((item as { publishedAt: string }).publishedAt).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" }) }}
							</time>
							<h3 class="mt-1 font-medium text-gray-900 line-clamp-2">
								{{ locale === "en" ? (item as { title_en?: string }).title_en ?? (item as { title?: string }).title : (item as { title?: string }).title ?? (item as { title_en?: string }).title_en }}
							</h3>
						</div>
					</NuxtLink>
				</div>
			</section>
		</div>
	</div>
</template>

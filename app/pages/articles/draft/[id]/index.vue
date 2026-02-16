<script setup lang="ts">
type BodyBlock = {
	fieldId?: string;
	content?: string;
	content_en?: string;
};

type DraftArticle = {
	title?: string;
	description?: string;
	content?: string;
	body?: BodyBlock[];
};

const route = useRoute();
const { locale } = useI18n();
const { sanitizeHtml } = useSanitize();

const hasDraftKey = computed(() => typeof route.query.draftKey === "string");

const { data: articleDetail, pending, error } = await useFetch<DraftArticle>(
	"/api/article-draft",
	{
		query: {
			endpoint: "news",
			contentId: route.params.id,
			draftKey: computed(() =>
				typeof route.query.draftKey === "string" ? route.query.draftKey : ""
			),
		},
		immediate: hasDraftKey.value,
	}
);

const bodyHtml = computed(() => {
	const blocks = articleDetail.value?.body;
	if (!Array.isArray(blocks) || blocks.length === 0) return "";
	const parts = blocks.map((block: BodyBlock) =>
		locale.value === "en"
			? block.content_en ?? block.content ?? ""
			: block.content ?? block.content_en ?? ""
	);
	const raw = parts.filter(Boolean).join("");
	return raw ? sanitizeHtml(raw) : "";
});

const hasLegacyContent = computed(
	() => Boolean(articleDetail.value?.content) && !bodyHtml.value,
);
const legacyContentHtml = computed(() => {
	const raw = articleDetail.value?.content;
	return raw ? sanitizeHtml(raw) : "";
});
</script>

<template>
	<div class="min-h-screen bg-gray-50 px-4 py-12">
		<div class="mx-auto max-w-3xl">
			<div class="mb-6 rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
				Preview mode (draft)
			</div>

			<div v-if="!hasDraftKey" class="rounded bg-white p-6 text-gray-700 shadow-sm">
				draftKey is required.
			</div>

			<div v-else-if="pending" class="rounded bg-white p-6 text-gray-700 shadow-sm">
				Loading draft...
			</div>

			<div v-else-if="error" class="rounded bg-white p-6 text-red-600 shadow-sm">
				Failed to load draft article.
			</div>

			<article v-else-if="articleDetail" class="rounded bg-white p-6 shadow-sm">
				<h1 class="mb-3 text-2xl font-semibold text-gray-900">{{ articleDetail.title }}</h1>
				<p v-if="articleDetail.description" class="mb-4 text-gray-600">{{ articleDetail.description }}</p>
				<div v-if="bodyHtml" class="prose max-w-none" v-html="bodyHtml" />
				<div v-else-if="hasLegacyContent" class="prose max-w-none" v-html="legacyContentHtml" />
			</article>
		</div>
	</div>
</template>

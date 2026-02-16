<script setup lang="ts">
type DraftArticle = {
	title?: string;
	description?: string;
	content?: string;
};

const route = useRoute();
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
				<div v-if="articleDetail.content" class="prose max-w-none" v-html="articleDetail.content" />
			</article>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ContentBlock, NewsDetail } from "~~/shared/types/news";
import ContentBlockRenderer from "~~/app/components/ContentBlocks/ContentBlockRenderer.vue";

const route = useRoute();
const { locale } = useI18n();

const { data, pending, error } = await useFetch<NewsDetail>("/api/article", {
	query: {
		endpoint: "news",
		contentId: route.params.id,
		draftKey: route.query.draftKey,
	},
});

const displayTitle = computed(() => {
	if (!data.value) {
		return "";
	}
	return locale.value === "en"
		? data.value.title_en ?? data.value.title ?? ""
		: data.value.title ?? data.value.title_en ?? "";
});

const blocks = computed(() => {
	const value = data.value?.body ?? data.value?.contentBlocks ?? [];
	return value as ContentBlock[];
});
</script>

<template>
	<div class="min-h-screen bg-slate-50 py-10 px-4">
		<div class="mx-auto max-w-5xl">
			<div class="mb-4 rounded border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-900">
				ANV prototype preview page
			</div>

			<div v-if="pending" class="text-sm text-slate-500">Loading preview...</div>
			<div v-else-if="error || !data" class="text-sm text-red-600">Failed to load preview.</div>

			<article v-else class="rounded-xl border bg-white p-6">
				<h1 class="text-2xl font-bold">{{ displayTitle }}</h1>
				<p v-if="data.description" class="mt-3 text-slate-700">{{ data.description }}</p>
				<p v-if="data.description_en" class="mt-2 text-slate-500">{{ data.description_en }}</p>

				<div class="mt-8 space-y-8">
					<ContentBlockRenderer
						v-for="(block, index) in blocks"
						:key="`${block.fieldId}-${index}`"
						:block="block"
						:index="index"
					/>
				</div>
			</article>
		</div>
	</div>
</template>

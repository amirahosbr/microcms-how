/**
 * Composable: Featured News
 *
 * Fetches the article for the modal: featured first (featured=true),
 * otherwise latest published. Returns null if no news.
 */

export type FeaturedNewsResponse = {
	article: unknown | null;
	source: "featured" | "latest" | null;
};

export function useFeaturedNews() {
	const { data, pending, error, refresh } = useFetch<FeaturedNewsResponse>(
		"/api/featured-news",
		{
			default: () => ({ article: null, source: null }),
		}
	);

	const article = computed(() => data.value?.article ?? null);
	const source = computed(() => data.value?.source ?? null);
	const hasArticle = computed(() => article.value !== null);

	return {
		article,
		source,
		hasArticle,
		pending,
		error,
		refresh,
	};
}

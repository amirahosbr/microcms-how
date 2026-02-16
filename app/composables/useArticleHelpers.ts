/**
 * Composable: useArticleHelpers
 *
 * @file ./app/composables/useArticleHelpers.ts
 * @description Helpers for news/article display (e.g. "New" badge).
 */

const NEW_DAYS = 7;

export function useArticleHelpers() {
	const isNewArticle = (publishedAt: string): boolean => {
		if (!publishedAt) return false;
		const publishedDate = new Date(publishedAt);
		const now = new Date();
		const daysDiff = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
		return daysDiff <= NEW_DAYS;
	};

	return { isNewArticle };
}

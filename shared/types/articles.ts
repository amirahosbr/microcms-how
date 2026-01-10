/**
 * Type: Articles
 *
 * @file ./shared/types/articles.ts
 * @description Shared types for Articles from microCMS。
 * @module Type
 */

import type {
	MicroCMSBaseFields,
	MicroCMSImage,
	MicroCMSListResponse,
} from "./microCMS";

// Content Reference type for category and location
export type MicroCMSContentReference = MicroCMSBaseFields & {
	title: string;
	title_en?: string; // English title for i18n
};

// Type alias for categories/locations list response
export type CategoriesListResponse =
	MicroCMSListResponse<MicroCMSContentReference>;

export type ArticleItem = MicroCMSBaseFields & {
	title: string;
	title_en?: string; // English title for i18n
	category: MicroCMSContentReference[];
	image?: MicroCMSImage;
	external_url?: string;
	publication?: string;
	publication_en?: string;
	content?: string; // HTML content (Japanese)
	information?: {
		fieldId: string;
		content?: string; // HTML content (Japanese)
		content_en?: string; // HTML content (English)
		description?: string;
		description_en?: string;
	};
	location?: MicroCMSContentReference[];
};

export type ArticleListResponse = MicroCMSListResponse<ArticleItem>;

// Transformed type for UI components
export type ContentListItem = {
	id: string;
	title: string;
	location: string;
	date: string;
	image: string;
	tag: string[];
	content: string;
};

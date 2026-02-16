/**
 * Shared Type: microCMS
 *
 * @file ./shared/types/microCMS.ts
 * @description microCMS用の型宣言です。
 * @module Type
 */

// List API Query
export type ListApiQuery = {
	endpoint?: string;
	fields?: string;
	filters?: string;
	q?: string;
	limit?: string;
	offset?: string;
	orders?: string;
	draftKey?: string;
};

// Article API Query
export type ArticleApiQuery = {
	endpoint?: string;
	contentId?: string;
	fields?: string;
	filters?: string;
	q?: string;
	limit?: string;
	offset?: string;
	orders?: string;
	depth?: string;
};

// ============================================
// Common Base Types
// ============================================

export type MicroCMSImage = {
	url: string;
	height: number;
	width: number;
};

export type MicroCMSBaseFields = {
	id: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	revisedAt: string;
};

export type MicroCMSListResponse<T> = {
	contents: T[];
	totalCount: number;
	offset?: number;
	limit?: number;
};

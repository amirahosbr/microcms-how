/**
 * Type: News
 *
 * @file ./shared/types/news.ts
 * @description Types for News with repeat field (contentBlocks)
 * @module Type
 */

import type { MicroCMSBaseFields, MicroCMSImage, MicroCMSListResponse } from "./microCMS";

// Content Block Types (Repeat Field)
export type ProfileCardBlock = {
  fieldId: "cf_profileCard";
  name: string;
  role: string;
  role_en?: string;
  bio: string;
  bio_en?: string;
  image?: MicroCMSImage;
};

export type RichTextBlock = {
  fieldId: "cf_richTextBlock";
  content: string;
  content_en?: string;
};

export type ContentBlock = ProfileCardBlock | RichTextBlock;

// News Item Type
export type NewsItem = MicroCMSBaseFields & {
  title: string;
  title_en?: string;
  category: unknown | null;
  image?: MicroCMSImage;
  external_url?: string;
  contentBlocks: ContentBlock[] | null;
};

export type NewsListResponse = MicroCMSListResponse<NewsItem>;
export type NewsDetail = NewsItem;

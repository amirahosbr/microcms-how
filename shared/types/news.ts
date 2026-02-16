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
  bio: string;
  bio_en?: string;
  image?: MicroCMSImage;
  imagePosition?: "left" | "right" | ("left" | "right")[]; // Default layout (JP/default) - can be array from microCMS
  imagePosition_en?: "left" | "right" | ("left" | "right")[]; // English locale override (rare, only when EN differs) - can be array from microCMS
};

export type RichTextBlock = {
  fieldId: "cf_richTextBlock";
  content: string;
  content_en?: string;
  layout?: "default" | "full-width" | "narrow";
};

export type RichTextImageBlock = {
  fieldId: "cf_richTextImage";
  content: string;
  content_en?: string;
  image: MicroCMSImage;
};

export type ImageBlock = {
  fieldId: "cf_imageBlock";
  image: MicroCMSImage;
  caption?: string;
  caption_en?: string;
  layout?: "default" | "full-width" | "narrow";
  alignment?: "left" | "center" | "right";
};

export type ImageGalleryBlock = {
  fieldId: "cf_imageGalleryBlock";
  images: MicroCMSImage[];
  captions?: string[];
  captions_en?: string[];
  layout?: "grid" | "carousel" | "stacked";
  columns?: 2 | 3 | 4;
};

export type LogoGroupBlock = {
  fieldId: "cf_logoGroup";
  heading: string;
  heading_en?: string;
  logos: Array<{
    fieldId: "logos";
    logo: MicroCMSImage;
  }>;
};

export type ContentBlock = ProfileCardBlock | RichTextBlock | RichTextImageBlock | ImageBlock | ImageGalleryBlock | LogoGroupBlock;

// Category type (API returns title, title_en; name is fallback)
export type NewsCategory = MicroCMSBaseFields & {
  name?: string;
  title?: string;
  title_en?: string;
};

// News Item Type
export type NewsItem = MicroCMSBaseFields & {
  title?: string;
  title_en?: string;
  description?: string;
  description_en?: string;
  category: NewsCategory | null;
  location?: unknown | null;
  image?: MicroCMSImage;
  external_url?: string;
  publication?: string;
  publication_en?: string;
  content?: string; // Legacy content field
  contentBlocks?: ContentBlock[] | null; // Legacy field name
  body?: ContentBlock[] | null; // New field name (repeat field)
};

export type NewsListResponse = MicroCMSListResponse<NewsItem>;
export type NewsDetail = NewsItem;

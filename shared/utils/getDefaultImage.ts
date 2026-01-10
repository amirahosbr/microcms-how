/**
 * Utility: Get Default Image
 *
 * @file ./shared/utils/getDefaultImage.ts
 * @description Get Default Image
 * @module Utility
 */

export const getDefaultImage = (image: string | undefined | null): string => {
	if (!image || image.trim() === "") return "/images/dummy/placeholder.png";

	return image;
};

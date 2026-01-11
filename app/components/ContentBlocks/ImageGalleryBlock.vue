<script setup lang="ts">
import type { ImageGalleryBlock } from "~~/shared/types/news";

type Props = {
  block: ImageGalleryBlock;
};

const props = defineProps<Props>();
const { locale } = useI18n();

const getCaption = (index: number): string => {
  if (!props.block.captions && !props.block.captions_en) return "";
  const captions = locale.value === "ja" 
    ? props.block.captions 
    : props.block.captions_en || props.block.captions;
  return captions?.[index] || "";
};

const layoutClass = computed(() => {
  const layout = props.block.layout || "grid";
  if (layout === "carousel") return "flex overflow-x-auto gap-4 pb-4";
  if (layout === "stacked") return "space-y-6";
  return "grid gap-4";
});

const gridColumnsClass = computed(() => {
  if (props.block.layout !== "grid") return "";
  const cols = props.block.columns || 3;
  if (cols === 2) return "grid-cols-1 md:grid-cols-2";
  if (cols === 4) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
  return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
});
</script>

<template>
  <div 
    class="my-8"
    :class="[layoutClass, gridColumnsClass]"
  >
    <figure
      v-for="(image, index) in block.images"
      :key="index"
      class="flex-shrink-0"
      :class="{
        'w-full': block.layout === 'grid' || block.layout === 'stacked',
        'w-80': block.layout === 'carousel',
      }"
    >
      <img
        :src="image.url"
        :alt="getCaption(index) || `Image ${index + 1}`"
        class="w-full h-auto rounded-lg shadow-md"
        :width="image.width"
        :height="image.height"
      />
      <figcaption 
        v-if="getCaption(index)"
        class="text-sm text-gray-600 text-center mt-2 italic"
      >
        {{ getCaption(index) }}
      </figcaption>
    </figure>
  </div>
</template>

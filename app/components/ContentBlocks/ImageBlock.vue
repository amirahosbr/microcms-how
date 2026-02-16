<script setup lang="ts">
import type { ImageBlock } from "~~/shared/types/news";

type Props = {
  block: ImageBlock;
};

const props = defineProps<Props>();
const { locale } = useI18n();

const displayCaption = computed(() => 
  locale.value === "ja" 
    ? props.block.caption 
    : props.block.caption_en || props.block.caption || ""
);

const layoutClass = computed(() => {
  const layout = props.block.layout || "default";
  if (layout === "full-width") return "w-full";
  if (layout === "narrow") return "max-w-2xl mx-auto";
  return "max-w-4xl mx-auto";
});

const alignmentClass = computed(() => {
  const align = props.block.alignment || "center";
  if (align === "left") return "ml-0 mr-auto";
  if (align === "right") return "ml-auto mr-0";
  return "mx-auto";
});
</script>

<template>
  <figure 
    class="my-8"
    :class="[layoutClass, alignmentClass]"
  >
    <img
      :src="block.image.url"
      :alt="displayCaption || 'Image'"
      class="w-full h-auto rounded-lg shadow-lg"
      :width="block.image.width"
      :height="block.image.height"
    />
    <figcaption 
      v-if="displayCaption"
      class="text-sm text-gray-600 text-center mt-3 italic"
    >
      {{ displayCaption }}
    </figcaption>
  </figure>
</template>

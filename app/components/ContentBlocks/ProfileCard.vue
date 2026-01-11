<script setup lang="ts">
import type { ProfileCardBlock } from "~~/shared/types/news";

type Props = {
  block: ProfileCardBlock;
};

const props = defineProps<Props>();
const { locale } = useI18n();

const displayBio = computed(() => {
  const bioHtml = locale.value === "en"
    ? (props.block.bio_en || props.block.bio || "")
    : (props.block.bio || props.block.bio_en || "");
  
  return bioHtml ? useSanitize().sanitizeHtml(bioHtml) : "";
});

const imagePosition = computed(() => props.block.layout || "right");
const isImageRight = computed(() => imagePosition.value === "right");
</script>

<template>
  <div 
    class="flex flex-col gap-6 md:gap-8"
    :class="{
      'md:flex-row-reverse': isImageRight, // Image on left = reverse order
      'md:flex-row': !isImageRight, // Image on right = normal order (content left, image right)
    }"
  >
    <!-- Content (appears first in DOM, will be on left when image is right) -->
    <div class="flex-1">
      <div 
        v-if="displayBio" 
        class="prose prose-base max-w-none text-gray-700 leading-relaxed"
        v-html="displayBio"
      />
    </div>

    <!-- Image (appears second in DOM, will be on right when using flex-row) -->
    <div v-if="block.image" class="shrink-0">
      <img
        :src="block.image.url"
        alt="Profile"
        class="w-48 h-48 md:w-56 md:h-56 object-cover object-top"
      />
    </div>
    <div v-else class="shrink-0 w-48 h-48 md:w-56 md:h-56 bg-gray-200 flex items-center justify-center">
      <span class="text-gray-400 text-sm">No Image</span>
    </div>
  </div>
</template>

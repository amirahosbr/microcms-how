<script setup lang="ts">
import type { RichTextImageBlock } from "~~/shared/types/news";

type Props = {
  block: RichTextImageBlock;
};

const props = defineProps<Props>();
const { locale } = useI18n();

// Get content - no fallback, only show if locale-specific content exists
const displayContent = computed(() => {
  const content = locale.value === "en" ? props.block.content_en : props.block.content;
  
  if (!content) return "";
  
  return useSanitize().sanitizeHtml(content);
});

// Check if locale-specific content exists
const hasContent = computed(() => {
  return locale.value === "en" ? !!props.block.content_en : !!props.block.content;
});
</script>

<template>
  <div 
    v-if="hasContent && block.image"
    class="rich-text-image-block"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- Content -->
      <div class="prose prose-lg max-w-none">
        <div 
          class="rich-text-content"
          v-html="displayContent"
        />
      </div>
      
      <!-- Image -->
      <div class="flex items-start h-full">
        <img
          :src="block.image.url"
          :alt="displayContent"
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.rich-text-content :deep(p) {
  line-height: 1.75;
  font-size: 1rem;
  color: rgb(17 24 39);
  margin-bottom: 1rem;
}

.rich-text-content :deep(p:last-child) {
  margin-bottom: 0;
}

.rich-text-content :deep(ul),
.rich-text-content :deep(ol) {
  list-style-type: disc;
  padding-left: 16px;
  margin-bottom: 1rem;
}

.rich-text-content :deep(ol) {
  list-style-type: decimal;
}

.rich-text-content :deep(li) {
  line-height: 1.75;
}

.rich-text-content :deep(strong) {
  font-weight: 700;
  color: rgb(17 24 39);
}

.rich-text-content :deep(a) {
  color: rgb(37 99 235);
}

.rich-text-content :deep(a:hover) {
  text-decoration: underline;
}
</style>

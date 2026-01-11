<script setup lang="ts">
import type { RichTextBlock } from "~~/shared/types/news";

type Props = {
  block: RichTextBlock;
};

const props = defineProps<Props>();
const { locale } = useI18n();

const displayContent = computed(() => {
  const content = locale.value === "en"
    ? (props.block.content_en || props.block.content)
    : (props.block.content || props.block.content_en);
  return content ? useSanitize().sanitizeHtml(content) : "";
});

const layoutClass = computed(() => {
  const layout = props.block.layout || "default";
  if (layout === "full-width") return "max-w-full";
  if (layout === "narrow") return "max-w-2xl mx-auto";
  return "max-w-none";
});
</script>

<template>
  <div 
    class="prose prose-lg max-w-none"
    :class="layoutClass"
  >
    <div 
      class="rich-text-content"
      v-html="displayContent"
    />
  </div>
</template>

<style scoped>
.rich-text-content :deep(img) {
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  max-width: 100%;
  height: auto;
}

.rich-text-content :deep(figure img) {
  width: 100%;
}

.rich-text-content :deep(figcaption) {
  font-size: 0.875rem;
  color: rgb(75 85 99);
  text-align: center;
  font-style: italic;
}

.rich-text-content :deep(p) {
  line-height: 1.75;
  font-size: 1rem;
  color: rgb(17 24 39);
}

.rich-text-content :deep(ul),
.rich-text-content :deep(ol) {
  list-style-type: disc;
}

.rich-text-content :deep(ol) {
  list-style-type: decimal;
}

.rich-text-content :deep(li) {
  line-height: 1.75;
}

.rich-text-content :deep(li > p) {
  display: inline-block;
  width: 100%;
}

.rich-text-content :deep(h2) {
  font-size: 1.75rem;
  font-weight: 700;
  color: rgb(17 24 39);
  line-height: 1.3;
}

.rich-text-content :deep(h3) {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(17 24 39);
  line-height: 1.4;
}

.rich-text-content :deep(a) {
  color: rgb(37 99 235);
}

.rich-text-content :deep(a:hover) {
  text-decoration: underline;
}

.rich-text-content :deep(blockquote) {
  border-left: 4px solid rgb(209 213 219);
  font-style: italic;
}

.rich-text-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
}

.rich-text-content :deep(th),
.rich-text-content :deep(td) {
  border: 1px solid rgb(209 213 219);
}

.rich-text-content :deep(th) {
  background-color: rgb(243 244 246);
  font-weight: 600;
}

.rich-text-content :deep(strong) {
  font-weight: 700;
  color: rgb(17 24 39);
}

.rich-text-content :deep(br) {
  display: block;
}
</style>

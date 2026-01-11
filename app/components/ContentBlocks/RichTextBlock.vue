<script setup lang="ts">
import type { RichTextBlock } from "~~/shared/types/news";

type Props = {
  block: RichTextBlock;
};

const props = defineProps<Props>();
const { locale } = useI18n();

// Get content - no fallback, only show if locale-specific content exists
const displayContent = computed(() => {
  const content = locale.value === "en" ? props.block.content_en : props.block.content;
  
  if (!content) return "";
  
  const sanitized = useSanitize().sanitizeHtml(content);
  
  // Post-process HTML to wrap consecutive figures in a grid container
  let processed = sanitized;
  let previousProcessed = '';
  let iterations = 0;
  const maxIterations = 10;
  
  while (processed !== previousProcessed && iterations < maxIterations) {
    previousProcessed = processed;
    iterations++;
    
    processed = processed.replace(
      /(<figure[^>]*>[\s\S]*?<\/figure>)(\s*(?:<br\s*\/?>|<p>\s*<\/p>)?\s*)(<figure[^>]*>[\s\S]*?<\/figure>)/gi,
      (match, fig1, space, fig2, offset, string) => {
        const beforeMatch = string.substring(0, offset);
        const openDivs = (beforeMatch.match(/<div class="figure-grid">/g) || []).length;
        const closeDivs = (beforeMatch.match(/<\/div>/g) || []).length;
        
        if (openDivs > closeDivs) {
          return match;
        }
        
        return `<div class="figure-grid">${fig1}${space}${fig2}</div>`;
      }
    );
  }
  
  return processed;
});

// Check if locale-specific content exists
const hasContent = computed(() => {
  return locale.value === "en" ? !!props.block.content_en : !!props.block.content;
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
    v-if="hasContent"
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
  max-width: 100%;
  height: auto;
}

.rich-text-content :deep(figure) {
  margin: 16px 0;
}

.rich-text-content :deep(figure img) {
  width: 100%;
}

/* 2-column grid for consecutive figures */
.rich-text-content :deep(.figure-grid) {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin: 16px 0;
}

.rich-text-content :deep(.figure-grid figure) {
  margin: 0;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.rich-text-content :deep(.figure-grid figure img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.rich-text-content :deep(figcaption) {
  font-size: 0.875rem;
  color: rgb(75 85 99);
  text-align: center;
  font-style: italic;
}

.rich-text-content :deep(p) {
  line-height: 1.5;
  font-size: 1rem;
  color: rgb(17 24 39);
}

.rich-text-content :deep(ul),
.rich-text-content :deep(ol) {
  list-style-type: disc;
  padding-left: 16px;
}

.rich-text-content :deep(ol) {
  list-style-type: decimal;
}

.rich-text-content :deep(li) {
  line-height: 1.5;
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

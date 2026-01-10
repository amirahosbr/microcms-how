<script setup lang="ts">
import type { RichTextBlock } from "~~/shared/types/news";

type Props = {
  block: RichTextBlock;
};

const props = defineProps<Props>();
const { locale } = useI18n();

const displayContent = computed(() => 
  locale.value === "ja" ? props.block.content : props.block.content_en || props.block.content
);
</script>

<template>
  <div 
    class="prose prose-lg max-w-none py-6"
    v-html="displayContent"
  />
</template>

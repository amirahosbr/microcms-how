<script setup lang="ts">
import type { ContentBlock } from "~~/shared/types/news";

type Props = {
  block: ContentBlock;
  index: number;
};

const props = defineProps<Props>();
</script>

<template>
  <div :key="`block-${props.index}`">
    <ProfileCard 
      v-if="props.block.fieldId === 'cf_profileCard'" 
      :block="props.block" 
    />
    <RichTextBlock 
      v-else-if="props.block.fieldId === 'cf_richTextBlock'" 
      :block="props.block" 
    />
  </div>
</template>

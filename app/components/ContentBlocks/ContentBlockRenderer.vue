<script setup lang="ts">
import type { ContentBlock } from "~~/shared/types/news";
import ProfileCard from "./ProfileCard.vue";
import RichTextBlock from "./RichTextBlock.vue";
import ImageBlock from "./ImageBlock.vue";
import ImageGalleryBlock from "./ImageGalleryBlock.vue";
import LogoGroupBlock from "./LogoGroupBlock.vue";

type Props = {
  block: ContentBlock;
  index: number;
};

const props = defineProps<Props>();
</script>

<template>
  <div :key="`block-${props.index}`" class="content-block">
    <ProfileCard 
      v-if="props.block.fieldId === 'cf_profileCard'" 
      :block="props.block as any"
      :index="props.index"
    />
    <RichTextBlock 
      v-else-if="props.block.fieldId === 'cf_richTextBlock'" 
      :block="props.block as any" 
    />
    <ImageBlock 
      v-else-if="props.block.fieldId === 'cf_imageBlock'" 
      :block="props.block as any" 
    />
    <ImageGalleryBlock 
      v-else-if="props.block.fieldId === 'cf_imageGalleryBlock'" 
      :block="props.block as any" 
    />
    <LogoGroupBlock 
      v-else-if="props.block.fieldId === 'cf_logoGroup'" 
      :block="props.block as any" 
    />
  </div>
</template>

<style scoped>
.content-block {
  width: 100%;
}
</style>

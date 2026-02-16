<script setup lang="ts">
import type { LogoGroupBlock } from "~~/shared/types/news";

type Props = {
  block: LogoGroupBlock;
};

const props = defineProps<Props>();
const { locale } = useI18n();

const displayHeading = computed(() => {
  return locale.value === "en"
    ? (props.block.heading_en || props.block.heading)
    : (props.block.heading || props.block.heading_en);
});
</script>

<template>
  <div class="logo-group-block">
    <!-- Heading -->
    <h3 v-if="displayHeading" class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-6">
      {{ displayHeading }}
    </h3>
    
    <!-- Logos Grid -->
    <div v-if="block.logos && block.logos.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
      <div
        v-for="(logoItem, index) in block.logos"
        :key="index"
        class="flex items-center justify-center"
      >
        <img
          v-if="logoItem.logo"
          :src="logoItem.logo.url"
          :alt="displayHeading"
          class="max-w-full h-auto object-contain"
          :style="{
            maxHeight: '80px',
            width: 'auto'
          }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.logo-group-block {
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgb(229 231 235);
}

.logo-group-block:first-child {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}
</style>

<script setup lang="ts">
import type { ProfileCardBlock } from "~~/shared/types/news";

type Props = {
  block: ProfileCardBlock;
};

const props = defineProps<Props>();
const { locale } = useI18n();

const displayName = computed(() => props.block.name);
const displayRole = computed(() => 
  locale.value === "ja" ? props.block.role : props.block.role_en || props.block.role
);
const displayBio = computed(() => 
  locale.value === "ja" ? props.block.bio : props.block.bio_en || props.block.bio
);
</script>

<template>
  <div class="flex flex-col md:flex-row gap-6 md:gap-8 py-8">
    <!-- Image -->
    <div v-if="block.image" class="flex-shrink-0">
      <img
        :src="block.image.url"
        :alt="displayName"
        class="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
      />
    </div>
    <div v-else class="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-200 flex items-center justify-center">
      <span class="text-gray-400 text-sm">No Image</span>
    </div>

    <!-- Content -->
    <div class="flex-1">
      <h3 class="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
        {{ displayName }}
      </h3>
      <p class="text-sm md:text-base text-gray-600 mb-4">
        {{ displayRole }}
      </p>
      <div 
        v-if="displayBio" 
        class="prose prose-sm max-w-none"
        v-html="displayBio"
      />
    </div>
  </div>
</template>

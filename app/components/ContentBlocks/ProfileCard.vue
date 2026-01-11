<script setup lang="ts">
import type { ProfileCardBlock } from "~~/shared/types/news";

type Props = {
  block: ProfileCardBlock;
};

const props = defineProps<Props>();
const { locale } = useI18n();

// Get bio content - no fallback, only show if locale-specific content exists
const displayBio = computed(() => {
  const bioHtml = locale.value === "en" ? props.block.bio_en : props.block.bio;
  return bioHtml ? useSanitize().sanitizeHtml(bioHtml) : "";
});

// Extract position value from array or string format
const extractPosition = (pos: "left" | "right" | ("left" | "right")[] | undefined): "left" | "right" | null => {
  if (!pos) return null;
  if (Array.isArray(pos) && pos.length > 0) {
    const value = pos[0];
    return value === "left" || value === "right" ? value : null;
  }
  return pos === "left" || pos === "right" ? pos : null;
};

// Get image position: imagePosition_en (EN) > imagePosition (default) > "left"
const imagePosition = computed((): "left" | "right" => {
  if (locale.value === "en" && props.block.imagePosition_en) {
    return extractPosition(props.block.imagePosition_en) ?? "left";
  }
  return extractPosition(props.block.imagePosition) ?? "left";
});

const isImageRight = computed(() => imagePosition.value === "right");
</script>

<template>
  <!-- Text wrapping layout: image floats, text flows around it (like Microsoft Word) -->
  <section class="profile-card-wrapper">
    <!-- Image - floats to allow text wrapping -->
    <div 
      v-if="block.image" 
      class="profile-image-float"
      :class="{
        'float-right': isImageRight,
        'float-left': !isImageRight,
      }"
    >
      <img
        :src="block.image.url"
        alt="Profile"
        class="w-48 h-48 md:w-56 md:h-56 object-cover object-top rounded-md"
        loading="lazy"
      />
    </div>
    <div 
      v-else 
      class="profile-image-float w-48 h-48 md:w-56 md:h-56 bg-gray-200 rounded-md flex items-center justify-center"
      :class="{
        'float-right': isImageRight,
        'float-left': !isImageRight,
      }"
    >
      <span class="text-gray-400 text-sm">No Image</span>
    </div>

    <!-- Text content - flows around the floated image -->
    <div 
      v-if="displayBio" 
      class="profile-text-content prose prose-base max-w-none text-gray-700 leading-relaxed"
      v-html="displayBio"
    />
    
    <!-- Clear float to prevent layout issues -->
    <div class="clear-both"></div>
  </section>
</template>

<style scoped>
.profile-card-wrapper {
  overflow: hidden; /* Contain floats */
}

/* Mobile: stack image and text */
.profile-image-float {
  margin-bottom: 1.5rem;
  float: none;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

/* Desktop: float image to allow text wrapping */
@media (min-width: 768px) {
  .profile-image-float {
    margin-bottom: 1rem;
    margin-top: 0;
  }

  .profile-image-float.float-right {
    float: right;
    margin-left: 1.5rem;
    margin-right: 0;
  }

  .profile-image-float.float-left {
    float: left;
    margin-right: 1.5rem;
    margin-left: 0;
  }
}

/* Text content flows around floated image */
.profile-text-content {
  overflow-wrap: break-word;
  word-wrap: break-word;
}

/* Clear float */
.clear-both {
  clear: both;
}

/* Ensure images inside text don't float */
.profile-text-content :deep(img) {
  float: none !important;
  display: block;
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
}
</style>

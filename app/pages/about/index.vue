<script setup lang="ts">
/**
 * Page: About
 *
 * @file ./app/pages/about/index.vue
 * @description About page
 * @module AboutPage
 */

defineOgImage({
  component: 'NuxtSeo',
  props: {
    title: 'About',
    description: 'About HOW TO?',
    siteName: 'HOW TO?',
    theme: '#0ea5e9',
    colorMode: 'light',
  },
  alt: 'About — HOW TO?',
})
</script>

<template>
  <div>About</div>
</template>
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
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-4xl font-bold text-gray-900 mb-8">About</h1>

      <section class="space-y-6 text-gray-600">
        <p class="text-lg leading-relaxed">
          <strong class="text-gray-900">HOW TO?</strong> is a small project for learning and trying out
          <a
            href="https://microcms.io"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sky-600 hover:underline"
          >microCMS</a>
          with Nuxt: listing content, drafts, webhooks, and forms.
        </p>
        <p class="leading-relaxed">
          You can browse news and articles powered by microCMS, try different list strategies (cached, no-stale, webhook), and use the contact forms (simple, dynamic fields, multi-step).
        </p>
        <p class="leading-relaxed">
          Built with Nuxt and Tailwind. No type annotations — focused on type-driven design and minimal boilerplate.
        </p>
      </section>
    </div>
  </div>
</template>
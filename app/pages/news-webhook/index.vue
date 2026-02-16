<script setup lang="ts">
useSeoMeta({
  title: "News Webhook",
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-7xl mx-auto">
      <div
        class="mb-6 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900"
      >
        <p class="font-semibold mb-1">Stale cache with webhook (demo)</p>
        <p class="mb-1">
          This page uses
          <code class="rounded bg-sky-200 px-1">/api/list</code> (with
          <code class="rounded bg-sky-200 px-1">stale-while-revalidate</code>).
          Without webhook, new articles published in microCMS can take up to the
          cache TTL (e.g. 1 hour) to appear here.
        </p>
        <p>
          With webhook configured (News API → Custom Notification → your
          <code class="rounded bg-sky-200 px-1">/api/webhook</code>), cache is
          cleared on publish/update/delete, so new articles show immediately on
          <NuxtLink to="/news" class="font-medium underline"
            >/news</NuxtLink
          >.
        </p>
      </div>

      <h1 class="text-4xl font-bold text-gray-900 mb-8">
        News Webhook
        <span class="text-lg font-normal text-gray-500"
          >(cached with news webhook)</span
        >
      </h1>
    </div>
  </div>
</template>

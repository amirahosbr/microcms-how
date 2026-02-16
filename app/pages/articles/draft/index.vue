<script setup lang="ts">
useSeoMeta({
	title: "Articles Draft Preview",
});
</script>

<template>
	<div class="min-h-screen bg-gray-50 px-4 py-12">
		<div class="mx-auto max-w-3xl rounded bg-white p-6 text-gray-700 shadow-sm">
			Open a draft URL with id and draftKey.
			<div class="mt-2 font-mono text-sm text-gray-500">/articles/draft/&lt;id&gt;?draftKey=&lt;key&gt;</div>
		</div>
	</div>
</template>

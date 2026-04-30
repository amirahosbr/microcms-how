<script setup lang="ts">
import type {
	CategoryOption,
	IngestResult,
	SubmitMode,
	SubmitResult,
	UiBlock,
} from "~~/shared/types/anv-proto";

const title = ref("");
const titleEn = ref("");
const description = ref("");
const descriptionEn = ref("");
const categoryId = ref("");
const featured = ref(false);
const blocks = ref<UiBlock[]>([]);

const categories = ref<CategoryOption[]>([]);
const categoriesLoading = ref(false);
const categoryEndpoint = ref("category");

const submitLoading = ref(false);
const submitError = ref("");
const submitResult = ref<SubmitResult | null>(null);
const ingestLoading = ref(false);
const ingestError = ref("");
const documentFile = ref<File | null>(null);
const ingestImageFiles = ref<File[]>([]);

const uid = (): string => {
	return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const addRichTextBlock = (): void => {
	blocks.value = [
		...blocks.value,
		{
			id: uid(),
			type: "richText",
			content: "",
			contentEn: "",
		},
	];
};

const addProfileBlock = (): void => {
	blocks.value = [
		...blocks.value,
		{
			id: uid(),
			type: "profile",
			bio: "",
			bioEn: "",
			imageFile: null,
		},
	];
};

const removeBlock = (id: string): void => {
	blocks.value = blocks.value.filter((block) => block.id !== id);
};

const setProfileImage = (id: string, file: File | null): void => {
	blocks.value = blocks.value.map((block) => {
		if (block.id !== id || block.type !== "profile") {
			return block;
		}
		return {
			...block,
			imageFile: file,
		};
	});
};

const onProfileImageChange = (id: string, event: Event): void => {
	const target = event.target;
	const input = target instanceof HTMLInputElement ? target : null;
	const file = input?.files?.[0] ?? null;
	setProfileImage(id, file);
};

const onDocumentFileChange = (event: Event): void => {
	const target = event.target;
	const input = target instanceof HTMLInputElement ? target : null;
	documentFile.value = input?.files?.[0] ?? null;
};

const onIngestImagesChange = (event: Event): void => {
	const target = event.target;
	const input = target instanceof HTMLInputElement ? target : null;
	ingestImageFiles.value = input?.files ? Array.from(input.files) : [];
};

const fetchCategories = async (): Promise<void> => {
	categoriesLoading.value = true;
	try {
		const result = await $fetch<{
			endpoint: string;
			categories: CategoryOption[];
		}>("/api/anv-proto/categories", {
			query: {
				endpoint: categoryEndpoint.value,
			},
		});
		categories.value = result.categories;
	} catch {
		categories.value = [];
	} finally {
		categoriesLoading.value = false;
	}
};

const buildPayload = (): {
	title: string;
	titleEn: string;
	description: string;
	descriptionEn: string;
	categoryId?: string;
	featured: boolean;
	status: SubmitMode;
	blocks: Array<Record<string, unknown>>;
	files: Array<{ key: string; file: File }>;
} => {
	const files = blocks.value.flatMap((block) => {
		if (block.type !== "profile" || !block.imageFile) {
			return [];
		}
		return [{ key: `profile-image-${block.id}`, file: block.imageFile }];
	});

	const serializedBlocks = blocks.value.map((block) => {
		if (block.type === "richText") {
			return {
				type: "richText",
				content: block.content,
				contentEn: block.contentEn,
			};
		}
		const imageKey = block.imageFile ? `profile-image-${block.id}` : undefined;
		return {
			type: "profile",
			bio: block.bio,
			bioEn: block.bioEn,
			imageKey,
		};
	});

	return {
		title: title.value,
		titleEn: titleEn.value,
		description: description.value,
		descriptionEn: descriptionEn.value,
		categoryId: categoryId.value || undefined,
		featured: featured.value,
		status: "draft",
		blocks: serializedBlocks,
		files,
	};
};

const mapIngestBlocksToUi = (
	ingest: IngestResult,
	images: File[],
): UiBlock[] => {
	return ingest.blocks.map((block) => {
		if (block.type === "richText") {
			return {
				id: uid(),
				type: "richText",
				content: block.content ?? "",
				contentEn: block.contentEn ?? "",
			};
		}

		const matchedImage =
			images.find((image) => image.name === block.profileImageName) ?? null;
		return {
			id: uid(),
			type: "profile",
			bio: block.bio ?? "",
			bioEn: block.bioEn ?? "",
			imageFile: matchedImage,
		};
	});
};

const onAiIngest = async (): Promise<void> => {
	ingestError.value = "";
	ingestLoading.value = true;
	try {
		if (!documentFile.value) {
			throw new Error("Please upload one document for AI ingest.");
		}

		const formData = new FormData();
		formData.append("document", documentFile.value);
		ingestImageFiles.value.forEach((image, index) => {
			formData.append(`image:${index}`, image);
		});

		const result = await $fetch<IngestResult>("/api/anv-proto/ingest", {
			method: "POST",
			body: formData,
		});

		title.value = result.title;
		titleEn.value = result.titleEn;
		description.value = result.description;
		descriptionEn.value = result.descriptionEn;
		featured.value = result.featured;
		blocks.value = mapIngestBlocksToUi(result, ingestImageFiles.value);
	} catch (error: unknown) {
		const fallback = "AI ingest failed.";
		if (error && typeof error === "object" && "data" in error) {
			const wrapped = error as { data?: { message?: string } };
			ingestError.value = wrapped.data?.message ?? fallback;
		} else if (error instanceof Error && error.message) {
			ingestError.value = error.message;
		} else {
			ingestError.value = fallback;
		}
	} finally {
		ingestLoading.value = false;
	}
};

const onSubmit = async (mode: SubmitMode): Promise<void> => {
	submitError.value = "";
	submitResult.value = null;
	submitLoading.value = true;

	try {
		const payload = buildPayload();
		payload.status = mode;

		const formData = new FormData();
		const submitBody = {
			title: payload.title,
			titleEn: payload.titleEn,
			description: payload.description,
			descriptionEn: payload.descriptionEn,
			categoryId: payload.categoryId,
			featured: payload.featured,
			status: payload.status,
			blocks: payload.blocks,
		};
		formData.append("payload", JSON.stringify(submitBody));
		payload.files.forEach((entry) => {
			formData.append(`file:${entry.key}`, entry.file);
		});

		const result = await $fetch<SubmitResult>("/api/anv-proto/submit", {
			method: "POST",
			body: formData,
		});
		submitResult.value = result;
	} catch (error: unknown) {
		const fallback = "Failed to submit article.";
		if (error && typeof error === "object" && "data" in error) {
			const wrapped = error as { data?: { message?: string } };
			submitError.value = wrapped.data?.message ?? fallback;
		} else {
			submitError.value = fallback;
		}
	} finally {
		submitLoading.value = false;
	}
};

await fetchCategories();
</script>

<template>
	<div class="min-h-screen bg-slate-50 py-10 px-4">
		<div class="mx-auto max-w-5xl">
			<h1 class="text-2xl font-bold text-slate-900">ANV Prototype Upload</h1>
			<p class="mt-2 text-sm text-slate-600">
				Protected by native browser auth dialog.
			</p>
			<div class="mt-8 space-y-6">
				<div class="rounded-xl border bg-white p-6">
					<h2 class="text-lg font-semibold text-slate-900">AI Ingest</h2>
					<p class="mt-1 text-sm text-slate-600">
						Upload one document and optional images, then AI will prefill the form below.
					</p>
					<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
						<label class="block text-sm">
							<span class="mb-1 block">Document (docx/txt)</span>
							<input type="file" accept=".docx,.txt,.md,.html,.htm,.json" @change="onDocumentFileChange" />
						</label>
						<label class="block text-sm">
							<span class="mb-1 block">Reference images (optional)</span>
							<input type="file" accept="image/*" multiple @change="onIngestImagesChange" />
						</label>
					</div>
					<p v-if="documentFile" class="mt-2 text-xs text-slate-500">
						Document: {{ documentFile.name }}
					</p>
					<p v-if="ingestImageFiles.length" class="mt-1 text-xs text-slate-500">
						Images: {{ ingestImageFiles.map((file) => file.name).join(", ") }}
					</p>
					<p v-if="ingestError" class="mt-3 text-sm text-red-600">{{ ingestError }}</p>
					<button
						type="button"
						:disabled="ingestLoading"
						class="mt-4 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
						@click="onAiIngest"
					>
						{{ ingestLoading ? "Ingesting..." : "Use AI to Fill Form" }}
					</button>
				</div>

				<form class="space-y-6 rounded-xl border bg-white p-6" @submit.prevent>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<label class="block text-sm">
							<span class="mb-1 block">Title JP</span>
							<input v-model="title" type="text" class="w-full rounded border px-3 py-2" />
						</label>
						<label class="block text-sm">
							<span class="mb-1 block">Title EN</span>
							<input v-model="titleEn" type="text" class="w-full rounded border px-3 py-2" />
						</label>
						<label class="block text-sm md:col-span-2">
							<span class="mb-1 block">Category endpoint</span>
							<div class="flex gap-2">
								<input v-model="categoryEndpoint" type="text" class="w-full rounded border px-3 py-2" />
								<button type="button" class="rounded border px-3 py-2 text-sm" @click="fetchCategories">
									Refresh
								</button>
							</div>
						</label>
						<label class="block text-sm">
							<span class="mb-1 block">Category</span>
							<select v-model="categoryId" class="w-full rounded border px-3 py-2">
								<option value="">No category</option>
								<option v-for="option in categories" :key="option.id" :value="option.id">
									{{ option.label }}
								</option>
							</select>
							<p v-if="categoriesLoading" class="mt-1 text-xs text-slate-500">Loading categories...</p>
						</label>
						<label class="mt-7 inline-flex items-center gap-2 text-sm">
							<input v-model="featured" type="checkbox" />
							<span>Featured</span>
						</label>
						<label class="block text-sm md:col-span-2">
							<span class="mb-1 block">Description JP</span>
							<textarea v-model="description" class="h-28 w-full rounded border px-3 py-2" />
						</label>
						<label class="block text-sm md:col-span-2">
							<span class="mb-1 block">Description EN</span>
							<textarea v-model="descriptionEn" class="h-28 w-full rounded border px-3 py-2" />
						</label>
					</div>

					<div class="rounded-lg border p-4">
						<div class="mb-4 flex items-center justify-between">
							<h3 class="font-semibold">Body sections</h3>
							<div class="flex gap-2">
								<button type="button" class="rounded border px-3 py-1.5 text-sm" @click="addRichTextBlock">
									+ Rich Text
								</button>
								<button type="button" class="rounded border px-3 py-1.5 text-sm" @click="addProfileBlock">
									+ Profile
								</button>
							</div>
						</div>

						<div v-if="!blocks.length" class="text-sm text-slate-500">No blocks added yet.</div>

						<div v-for="(block, index) in blocks" :key="block.id" class="mb-4 rounded border p-4">
							<div class="mb-3 flex items-center justify-between">
								<p class="text-sm font-medium">Block {{ index + 1 }} ({{ block.type }})</p>
								<button type="button" class="text-sm text-red-600" @click="removeBlock(block.id)">
									Remove
								</button>
							</div>

							<div v-if="block.type === 'richText'" class="grid grid-cols-1 gap-3 md:grid-cols-2">
								<label class="block text-sm">
									<span class="mb-1 block">Content JP</span>
									<textarea v-model="block.content" class="h-32 w-full rounded border px-3 py-2" />
								</label>
								<label class="block text-sm">
									<span class="mb-1 block">Content EN</span>
									<textarea v-model="block.contentEn" class="h-32 w-full rounded border px-3 py-2" />
								</label>
							</div>

							<div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2">
								<label class="block text-sm">
									<span class="mb-1 block">Bio JP</span>
									<textarea v-model="block.bio" class="h-24 w-full rounded border px-3 py-2" />
								</label>
								<label class="block text-sm">
									<span class="mb-1 block">Bio EN</span>
									<textarea v-model="block.bioEn" class="h-24 w-full rounded border px-3 py-2" />
								</label>
								<label class="block text-sm md:col-span-2">
									<span class="mb-1 block">Profile image</span>
									<input
										type="file"
										accept="image/*"
										@change="onProfileImageChange(block.id, $event)"
									/>
								</label>
							</div>
						</div>
					</div>

					<p v-if="submitError" class="text-sm text-red-600">{{ submitError }}</p>
					<div class="flex flex-wrap gap-3">
						<button
							type="button"
							:disabled="submitLoading"
							class="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
							@click="onSubmit('draft')"
						>
							Submit as Draft
						</button>
						<button
							type="button"
							:disabled="submitLoading"
							class="rounded border border-slate-900 px-4 py-2 text-sm font-medium text-slate-900 disabled:opacity-50"
							@click="onSubmit('publish')"
						>
							Publish
						</button>
					</div>
				</form>

				<div v-if="submitResult" class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
					<p class="text-sm font-medium text-emerald-900">Submitted successfully.</p>
					<p class="mt-1 text-sm text-emerald-800">ID: {{ submitResult.id }} | Status: {{ submitResult.status }}</p>
					<div class="mt-3 flex flex-wrap gap-3 text-sm">
						<NuxtLink :to="submitResult.previewUrl" class="underline">Open preview</NuxtLink>
						<NuxtLink :to="submitResult.publishedUrl" class="underline">Open public page</NuxtLink>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

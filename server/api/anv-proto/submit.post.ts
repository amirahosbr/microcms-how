import type { MultiPartData } from "h3";
import { requireBasicAuth } from "~~/server/utils/anvProtoAuth";
import type { MicroCMSImage } from "~~/shared/types/microCMS";

type DraftStatus = "draft" | "publish";

type RichTextDraftBlock = {
	type: "richText";
	content: string;
	contentEn: string;
};

type ProfileDraftBlock = {
	type: "profile";
	bio: string;
	bioEn: string;
	imageKey?: string;
};

type DraftBlock = RichTextDraftBlock | ProfileDraftBlock;

type DraftPayload = {
	title: string;
	titleEn: string;
	description: string;
	descriptionEn: string;
	categoryId?: string;
	featured: boolean;
	status: DraftStatus;
	blocks: DraftBlock[];
};

type UploadedAsset = {
	key: string;
	image: MicroCMSImage;
};

type MicroCMSCreateResponse = {
	id: string;
	draftKey?: string;
};

const parsePayload = (part: MultiPartData | undefined): DraftPayload => {
	if (!part?.data) {
		throw createError({ statusCode: 400, message: "Missing payload field." });
	}
	try {
		const raw = JSON.parse(part.data.toString("utf-8")) as DraftPayload;
		if (!raw.title || !raw.titleEn) {
			throw new Error("title/titleEn required");
		}
		return raw;
	} catch {
		throw createError({ statusCode: 400, message: "Invalid payload JSON." });
	}
};

const uploadMedia = async (
	serviceDomain: string,
	apiKey: string,
	part: MultiPartData,
): Promise<MicroCMSImage> => {
	const uploadUrl = `https://${serviceDomain}.microcms.io/api/v1/media`;
	const mimeType = part.type ?? "application/octet-stream";
	const filename = part.filename ?? `upload-${Date.now()}`;
	const bytes = new Uint8Array(part.data);
	const blob = new Blob([bytes], { type: mimeType });
	const formData = new FormData();
	formData.append("file", blob, filename);

	const response = await fetch(uploadUrl, {
		method: "POST",
		headers: {
			"X-MICROCMS-API-KEY": apiKey,
		},
		body: formData,
	});

	if (!response.ok) {
		const message = await response.text();
		throw createError({
			statusCode: 500,
			message: `Failed to upload media: ${message}`,
		});
	}

	const result = (await response.json()) as {
		url?: string;
		width?: number;
		height?: number;
	};
	if (!result.url) {
		throw createError({
			statusCode: 500,
			message: "Media upload response did not include image URL.",
		});
	}

	return {
		url: result.url,
		width: result.width ?? 0,
		height: result.height ?? 0,
	};
};

const buildBodyBlocks = (
	blocks: DraftBlock[],
	assets: Map<string, MicroCMSImage>,
): Array<Record<string, unknown>> => {
	return blocks.map((block) => {
		if (block.type === "richText") {
			return {
				fieldId: "cf_richTextBlock",
				content: block.content,
				content_en: block.contentEn,
			};
		}

		const profileBlock: Record<string, unknown> = {
			fieldId: "cf_profileCard",
			bio: block.bio,
			bio_en: block.bioEn,
		};
		if (block.imageKey) {
			const image = assets.get(block.imageKey);
			if (image) {
				profileBlock.image = image;
			}
		}
		return profileBlock;
	});
};

export default eventHandler(async (event) => {
	requireBasicAuth(event);

	const config = useRuntimeConfig();
	const serviceDomain = config.microcms.serviceDomain;
	const apiKey = config.microcms.apiKey;
	if (!serviceDomain || !apiKey) {
		throw createError({
			statusCode: 500,
			message: "microCMS credentials are not configured.",
		});
	}

	const endpoint = process.env.ANV_PROTO_NEWS_ENDPOINT ?? "news";
	const multipart = await readMultipartFormData(event);
	if (!multipart) {
		throw createError({ statusCode: 400, message: "Multipart form is required." });
	}

	const payloadPart = multipart.find((item) => item.name === "payload");
	const payload = parsePayload(payloadPart);

	const uploadedAssets: UploadedAsset[] = [];
	const fileParts = multipart.filter((item) => item.name?.startsWith("file:"));
	for (const part of fileParts) {
		if (!part.name) {
			continue;
		}
		const key = part.name.replace("file:", "");
		const image = await uploadMedia(serviceDomain, apiKey, part);
		uploadedAssets.push({ key, image });
	}
	const assetMap = new Map<string, MicroCMSImage>(
		uploadedAssets.map((item) => [item.key, item.image]),
	);

	const body = {
		title: payload.title,
		title_en: payload.titleEn,
		description: payload.description,
		description_en: payload.descriptionEn,
		featured: payload.featured,
		category: payload.categoryId || undefined,
		body: buildBodyBlocks(payload.blocks, assetMap),
	};

	const createUrl = new URL(`https://${serviceDomain}.microcms.io/api/v1/${endpoint}`);
	createUrl.searchParams.set("status", payload.status === "publish" ? "publish" : "draft");

	const createResponse = await fetch(createUrl, {
		method: "POST",
		headers: {
			"X-MICROCMS-API-KEY": apiKey,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

	if (!createResponse.ok) {
		const errorText = await createResponse.text();
		throw createError({
			statusCode: 500,
			message: `Failed to create content: ${errorText}`,
		});
	}

	const created = (await createResponse.json()) as MicroCMSCreateResponse;
	const result = {
		id: created.id,
		draftKey: created.draftKey ?? null,
		previewUrl: created.draftKey
			? `/news/draft/${created.id}?draftKey=${created.draftKey}`
			: `/news/${created.id}`,
		publishedUrl: `/news/${created.id}`,
		status: payload.status,
	};

	return result;
});

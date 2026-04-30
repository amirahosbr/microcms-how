import type { MultiPartData } from "h3";
import mammoth from "mammoth";
import { requireBasicAuth } from "~~/server/utils/anvProtoAuth";
import type { IngestAiBlock, IngestResult } from "~~/shared/types/anv-proto";

type OpenRouterMessageContent =
	| {
			type: "text";
			text: string;
	  }
	| {
			type: "image_url";
			image_url: {
				url: string;
			};
	  };

type OpenRouterResponse = {
	choices?: Array<{
		message?: {
			content?: string;
		};
	}>;
};

const parseJsonObject = (raw: string): unknown => {
	const trimmed = raw.trim();
	const fenced = trimmed.match(/```json\s*([\s\S]*?)```/i);
	if (fenced && fenced[1]) {
		return JSON.parse(fenced[1].trim());
	}
	return JSON.parse(trimmed);
};

const parseIngestResult = (value: unknown): IngestResult => {
	if (!value || typeof value !== "object") {
		throw createError({ statusCode: 502, message: "AI response is not a valid object." });
	}
	const input = value as Record<string, unknown>;
	const blocksRaw = Array.isArray(input.blocks) ? input.blocks : [];
	const blocks: IngestAiBlock[] = blocksRaw
		.map((item) => {
			if (!item || typeof item !== "object") {
				return null;
			}
			const block = item as Record<string, unknown>;
			const typeValue = block.type;
			const type =
				typeValue === "richText" || typeValue === "profile"
					? typeValue
					: null;
			if (!type) {
				return null;
			}
			const parsedBlock: IngestAiBlock = {
				type,
				content: typeof block.content === "string" ? block.content : "",
				contentEn: typeof block.contentEn === "string" ? block.contentEn : "",
				bio: typeof block.bio === "string" ? block.bio : "",
				bioEn: typeof block.bioEn === "string" ? block.bioEn : "",
				profileImageName:
					typeof block.profileImageName === "string"
						? block.profileImageName
						: undefined,
			};
			return parsedBlock;
		})
		.filter((item) => item !== null);

	return {
		title: typeof input.title === "string" ? input.title : "",
		titleEn: typeof input.titleEn === "string" ? input.titleEn : "",
		description: typeof input.description === "string" ? input.description : "",
		descriptionEn: typeof input.descriptionEn === "string" ? input.descriptionEn : "",
		featured: Boolean(input.featured),
		categoryHint: typeof input.categoryHint === "string" ? input.categoryHint : "",
		blocks,
	};
};

const extractDocumentText = async (part: MultiPartData): Promise<string> => {
	const mimeType = part.type ?? "";

	if (
		mimeType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
	) {
		const docx = await mammoth.extractRawText({
			buffer: part.data,
		});
		return docx.value.trim();
	}

	return part.data.toString("utf-8").trim();
};

const toBase64 = (part: MultiPartData): string => {
	return Buffer.from(part.data).toString("base64");
};

export default eventHandler(async (event) => {
	requireBasicAuth(event);

	const openRouterApiKey = process.env.OPENROUTER_API_KEY ?? "";
	if (!openRouterApiKey) {
		throw createError({
			statusCode: 500,
			message: "Missing OPENROUTER_API_KEY for AI ingest.",
		});
	}

	const multipart = await readMultipartFormData(event);
	if (!multipart) {
		throw createError({ statusCode: 400, message: "Multipart form is required." });
	}

	const documentPart = multipart.find((part) => part.name === "document");
	if (!documentPart?.data) {
		throw createError({ statusCode: 400, message: "Document file is required." });
	}

	const imageParts = multipart.filter((part) => part.name?.startsWith("image:"));
	const docText = await extractDocumentText(documentPart);
	if (!docText) {
		throw createError({ statusCode: 400, message: "Document text is empty." });
	}

	const imageListText = imageParts
		.map((part) => `- ${part.filename ?? "unknown-image"}`)
		.join("\n");

	const promptText = [
		"You are mapping a press release to a microCMS news schema.",
		"Return ONLY valid JSON with this exact shape:",
		`{
  "title": "string",
  "titleEn": "string",
  "description": "string",
  "descriptionEn": "string",
  "featured": false,
  "categoryHint": "string",
  "blocks": [
    {
      "type": "richText",
      "content": "string",
      "contentEn": "string"
    },
    {
      "type": "profile",
      "bio": "string",
      "bioEn": "string",
      "profileImageName": "exact filename from provided list if possible"
    }
  ]
}`,
		"Rules:",
		"- Keep Japanese text in non-EN fields and English in EN fields.",
		"- Create 2 to 6 blocks total.",
		"- If profile info does not exist, omit profile block.",
		"- categoryHint should be a short category label guess.",
		`Available image filenames:\n${imageListText || "- none"}`,
		`Document text:\n${docText}`,
	].join("\n\n");

	const content: OpenRouterMessageContent[] = [
		{
			type: "text",
			text: promptText,
		},
	];

	for (const imagePart of imageParts) {
		if (!imagePart.type?.startsWith("image/")) {
			continue;
		}
		content.push({
			type: "image_url",
			image_url: {
				url: `data:${imagePart.type};base64,${toBase64(imagePart)}`,
			},
		});
	}

	const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${openRouterApiKey}`,
			"content-type": "application/json",
			"HTTP-Referer": process.env.ANV_PROTO_SITE_URL ?? "http://localhost:3001",
			"X-Title": "ANV Proto AI Ingest",
		},
		body: JSON.stringify({
			model:
				process.env.ANV_PROTO_AI_MODEL ??
				"anthropic/claude-3.5-sonnet",
			max_tokens: 1400,
			temperature: 0,
			messages: [
				{
					role: "user",
					content,
				},
			],
		}),
	});

	if (!response.ok) {
		const message = await response.text();
		throw createError({
			statusCode: 502,
			message: `AI ingest failed: ${message}`,
		});
	}

	const ai = (await response.json()) as OpenRouterResponse;
	const text = ai.choices?.[0]?.message?.content?.trim() ?? "";
	if (!text) {
		throw createError({
			statusCode: 502,
			message: "AI ingest returned no text output.",
		});
	}

	const parsed = parseJsonObject(text);
	const result = parseIngestResult(parsed);
	return result;
});

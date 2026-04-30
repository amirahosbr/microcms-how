export type CategoryOption = {
	id: string;
	label: string;
};

export type RichTextUiBlock = {
	id: string;
	type: "richText";
	content: string;
	contentEn: string;
};

export type ProfileUiBlock = {
	id: string;
	type: "profile";
	bio: string;
	bioEn: string;
	imageFile: File | null;
};

export type UiBlock = RichTextUiBlock | ProfileUiBlock;

export type SubmitMode = "draft" | "publish";

export type SubmitResult = {
	id: string;
	draftKey: string | null;
	previewUrl: string;
	publishedUrl: string;
	status: SubmitMode;
};

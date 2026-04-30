import { useMicroCMSClient } from "~~/shared/utils/microcms";
import { requireBasicAuth } from "~~/server/utils/anvProtoAuth";

type CategoryItem = {
	id: string;
	name?: string;
	title?: string;
	title_en?: string;
};

export default eventHandler(async (event) => {
	requireBasicAuth(event);

	const endpoint = getQuery(event).endpoint;
	const categoryEndpoint =
		typeof endpoint === "string" && endpoint
			? endpoint
			: process.env.ANV_PROTO_CATEGORY_ENDPOINT ?? "category";

	const client = useMicroCMSClient();
	const result = await client.getList<CategoryItem>({
		endpoint: categoryEndpoint,
		queries: {
			limit: 100,
			fields: "id,name,title,title_en",
			orders: "createdAt",
		},
	});

	return {
		endpoint: categoryEndpoint,
		categories: result.contents.map((category) => ({
			id: category.id,
			label:
				category.title ?? category.name ?? category.title_en ?? category.id,
		})),
	};
});

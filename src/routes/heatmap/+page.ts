import type { PageLoad } from './$types';

const load: PageLoad = async ({ fetch }) => {
	const schema = await fetch('/retirement_OECD/heatmap-schema.json').then((res) => res.json());

	const data = await fetch('/retirement_OECD/heatmap.json').then((res) => res.json());

	return { schema, data };
};

export { load };

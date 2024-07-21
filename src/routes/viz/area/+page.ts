import type { PageLoad } from './$types';

const load: PageLoad = async ({ fetch }) => {
	const schema = await fetch('/retirement_OECD/area-schema.json').then((res) => res.json());

	const data = await fetch('/retirement_OECD/area.json').then((res) => res.json());

	return { schema, data };
};

export { load };

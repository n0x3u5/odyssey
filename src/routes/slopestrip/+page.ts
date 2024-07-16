import type { PageLoad } from './$types';

const load: PageLoad = async ({ fetch }) => {
	const schema = await fetch('/retirement_OECD/slopestrip-schema.json').then((res) => res.json());

	const data = await fetch('/retirement_OECD/slopestrip.json').then((res) => res.json());

	return { schema, data };
};

export { load };

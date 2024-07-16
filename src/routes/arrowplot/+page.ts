import type { PageLoad } from './$types';

const load: PageLoad = async ({ fetch }) => {
	const schema = await fetch('/retirement_OECD/retirement_OECD_Extract_schema.json').then((res) =>
		res.json()
	);

	const data = await fetch('/retirement_OECD/retirement_OECD_Extract.json').then((res) =>
		res.json()
	);

	return { schema, data };
};

export { load };

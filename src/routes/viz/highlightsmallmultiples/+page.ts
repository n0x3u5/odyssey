import type { PageLoad } from './$types';

const load: PageLoad = async ({ fetch }) => {
	const schema = fetch(
		'/retirement_OECD/retirement_OECD (small multiples)_Extract_schema.json'
	).then((res) => res.json());

	const data = fetch('/retirement_OECD/retirement_OECD (small multiples)_Extract.json').then(
		(res) => res.json()
	);

	return { schema, data };
};

export { load };

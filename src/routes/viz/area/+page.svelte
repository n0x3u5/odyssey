<script lang="ts">
	import { Area } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

<main class="prose m-auto flex size-full max-w-4xl flex-col prose-h1:mb-8 prose-h1:mt-4">
	<h1>
		PERCENTAGE OF OECD COUNTRIES BY LABOUR MARKET EXIT AGE GROUP: <span class="text-red-600"
			>ABOVE 65 YEARS</span
		>,
		<span class="text-blue-700">60-65 YEARS</span>,
		<span class="text-purple-400">UNDER 60 YEARS</span>, 1972-2022
	</h1>
	{#await import('@viz/muze') then { default: muze }}
		<Area {muze} {schema} {data}></Area>
	{/await}
</main>

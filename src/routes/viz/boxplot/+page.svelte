<script lang="ts">
	import { Boxplot } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

<main class="prose m-auto flex size-full max-w-4xl flex-col p-4 prose-h1:mb-4 prose-h2:my-2">
	<h1>
		DISTRIBUTION OF OECD COUNTRIES BY EFFECTIVE AGE OF LABOUR MARKET EXIT FOR EACH 5 YEARS,
		1972-2022
	</h1>
	{#await import('@viz/muze') then { default: muze }}
		<Boxplot {muze} {schema} {data}></Boxplot>
	{/await}
</main>

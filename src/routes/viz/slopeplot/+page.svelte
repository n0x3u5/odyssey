<script lang="ts">
	import { Slopeplot } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

<main class="prose m-auto flex size-full max-w-4xl flex-col py-4">
	<h1>CHANGE IN EFFECTIVE AGE OF LABOUR MARKET EXIT ACCROSS OECD COUNTRIES, 1972 vs. 2022</h1>
	{#await import('@viz/muze') then { default: muze }}
		<Slopeplot {muze} {schema} {data}></Slopeplot>
	{/await}
</main>

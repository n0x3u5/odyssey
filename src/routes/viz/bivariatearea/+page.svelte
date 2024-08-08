<script lang="ts">
	import { BivariateArea } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

<main class="prose m-auto flex size-full max-w-4xl flex-col py-4 prose-h1:mb-4">
	<h1>
		GAP IN EFFECTIVE AGE OF LABOUR MARKET EXIT: WHEN IT WAS HIGHER FOR
		<span class="text-indigo-500">MALE</span>
		OR <span class="text-yellow-500">FEMALE</span>, 1972-2022
	</h1>
	{#await import('@viz/muze') then { default: muze }}
		<BivariateArea {muze} {schema} {data}></BivariateArea>
	{/await}
</main>

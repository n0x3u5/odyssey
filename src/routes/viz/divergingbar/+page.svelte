<script lang="ts">
	import { DivergingBar } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

<main class="prose m-auto flex size-full max-w-4xl flex-col prose-h1:mb-2 prose-h1:mt-4">
	<h1>
		GAP IN EFFECTIVE AGE OF LABOUR MARKET EXIT: IN WHICH COUNTRIES IT'S HIGHER FOR
		<span class="text-indigo-500">FEMALE</span>
		OR
		<span class="text-yellow-500">MALE</span>, 2022
	</h1>
	{#await import('@viz/muze') then { default: muze }}
		<DivergingBar {muze} {schema} {data}></DivergingBar>
	{/await}
</main>

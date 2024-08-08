<script lang="ts">
	import { SmallMultiples } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

<main class="prose m-auto flex size-full max-w-4xl flex-col py-4">
	<h1>
		EFFECTIVE AGE OF LABOUR MARKET EXIT ACCROSS OECD COUNTRIES BY YEAR FOR
		<span class="text-indigo-500">FEMALE</span>
		AND
		<span class="text-yellow-500">MALE</span>, 1972-2022
	</h1>
	{#await import('@viz/muze') then { default: muze }}
		<SmallMultiples {muze} {schema} {data}></SmallMultiples>
	{/await}
</main>

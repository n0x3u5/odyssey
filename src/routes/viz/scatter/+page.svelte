<script lang="ts">
	import { Scatter } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

<main class="prose m-auto flex size-full max-w-4xl flex-col p-4 prose-h1:mb-0">
	<h1>EFFECTIVE AGE OF LABOUR MARKET EXIT FOR FEMALE AND MALE ACCROSS OECD COUNTRIES, 2022</h1>
	{#await import('@viz/muze') then { default: muze }}
		<Scatter {muze} {schema} {data}></Scatter>
	{/await}
</main>

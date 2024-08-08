<script lang="ts">
	import { TileMap } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

<main
	class="prose m-auto flex size-full max-w-4xl flex-col py-4 prose-h1:mt-0 prose-h2:m-0 prose-h3:m-0"
>
	<h1>AGE OF LABOUR MARKET EXIT IN EUROPE, 1972 vs. 2022</h1>
	{#await import('@viz/muze') then { default: muze }}
		<TileMap {muze} {schema} {data}></TileMap>
	{/await}
</main>

<script lang="ts">
	import { Dumbell } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

<main>
	{#await import('@viz/muze') then { default: muze }}
		<Dumbell {muze} {schema} {data}></Dumbell>
	{/await}
</main>

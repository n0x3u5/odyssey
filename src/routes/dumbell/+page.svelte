<script lang="ts">
	import { Dumbell } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

<main class="h-screen w-screen p-4">
	{#await import('@viz/muze') then { default: muze }}
		<Dumbell {muze} {schema} {data}></Dumbell>
	{/await}
</main>

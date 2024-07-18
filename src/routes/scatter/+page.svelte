<script lang="ts">
	import { Scatter } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

<main class="h-screen w-screen p-4">
	{#await import('@viz/muze') then { default: muze }}
		<Scatter {muze} {schema} {data}></Scatter>
	{/await}
</main>

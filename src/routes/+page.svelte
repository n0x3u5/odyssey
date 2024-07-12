<script lang="ts">
	import { Muze } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

<div class="h-screen w-screen bg-amber-50 p-4">
	{#await import('@viz/muze') then { default: muze }}
		<Muze {muze} {schema} {data}></Muze>
	{/await}
</div>

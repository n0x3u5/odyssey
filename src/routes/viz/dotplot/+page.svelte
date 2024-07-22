<script lang="ts">
	import { Dotplot } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

<div class="prose m-auto size-full max-w-4xl">
	<main class="size-full">
		{#await import('@viz/muze') then { default: muze }}
			<Dotplot {muze} {schema} {data}></Dotplot>
		{/await}
	</main>
</div>

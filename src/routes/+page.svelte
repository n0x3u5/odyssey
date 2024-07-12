<script lang="ts">
	import { Muze } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

{#await import('@viz/muze') then { default: muze }}
	<Muze {muze} {schema} {data}></Muze>
{/await}

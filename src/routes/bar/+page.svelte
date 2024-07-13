<script lang="ts">
	import { Bar } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

{#await import('@viz/muze') then { default: muze }}
	<Bar {muze} {schema} {data}></Bar>
{/await}

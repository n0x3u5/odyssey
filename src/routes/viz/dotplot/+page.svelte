<script lang="ts">
	import { Dotplot } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

<div
	class="prose m-auto size-full max-w-4xl prose-h1:mb-0 prose-h1:mt-4 prose-h2:mb-2 prose-h2:mt-8"
>
	<main class="flex size-full flex-col pb-4">
		<h1>
			DISTRIBUTION OF OECD COUNTRIES BY EFFECTIVE AGE OF LABOUR MARKET EXIT BY DECADE, 1972-2022
		</h1>
		{#await import('@viz/muze') then { default: muze }}
			<Dotplot {muze} {schema} {data}></Dotplot>
		{/await}
	</main>
</div>

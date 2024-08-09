<script lang="ts">
	import { WinLoss } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

<main
	class="prose m-auto flex size-full max-w-4xl flex-col py-4 prose-h1:my-4 prose-h2:my-4 prose-h2:text-lg prose-h3:my-1 prose-h3:text-center prose-h3:text-sm prose-h3:font-normal"
>
	<h1>
		CHANGE IN EFFECTIVE AGE OF LABOUR MARKET EXIT BY YEAR FOR COUNTRIES AT THE EDGES OF
		DISTRIBUTION, 1972-2022
	</h1>
	{#await import('@viz/muze') then { default: muze }}
		<WinLoss {muze} {schema} {data}></WinLoss>
	{/await}
</main>

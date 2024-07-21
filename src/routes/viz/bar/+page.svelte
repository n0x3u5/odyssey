<script lang="ts">
	import { Bar } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

<div
	class="prose mx-auto flex size-full max-w-4xl flex-col pt-4 prose-h1:mb-4 prose-h2:m-0 prose-h3:m-0 prose-h4:m-0 prose-hr:mb-4 prose-hr:mt-0 prose-hr:border-black"
>
	<header>
		<h1>
			EFFECTIVE AGE OF LABOUR MARKET EXIT ACROSS OECD COUNTRIES, FOR <span class="text-indigo-500"
				>FEMALE</span
			>
			AND <span class="text-yellow-500">MALE</span>, 2022
		</h1>
		<div class="flex justify-between">
			<h2>FEMALE</h2>
			<h2>MALE</h2>
		</div>
	</header>
	<main class="not-prose flex w-full grow">
		{#await import('@viz/muze') then { default: muze }}
			<Bar {muze} {schema} {data}></Bar>
		{/await}
	</main>
</div>

<script lang="ts">
	import { Bar } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

<article
	class="prose mx-auto flex h-screen w-screen max-w-4xl flex-col p-4 prose-h2:m-0 prose-h3:m-0 prose-h4:m-0 prose-hr:mb-4 prose-hr:mt-0 prose-hr:border-black"
>
	<header>
		<div class="flex items-center justify-between">
			<span class="inline-block transition-transform hover:-translate-x-1">
				<a class="text-gray-500 no-underline hover:text-black" href="/">
					<svg class="inline size-4"><use href="#icon-arrow-left" /></svg>
					<svg class="inline size-5"><use href="#icon-home" /></svg>
				</a>
			</span>
			<h3>Bar Chart</h3>
			<span class="inline-block transition-transform hover:translate-x-1">
				<h4>
					<a class="text-gray-500 hover:text-black" href="/bar">
						Bar Chart <svg class="inline size-4 rotate-180"><use href="#icon-arrow-left" /></svg>
					</a>
				</h4>
			</span>
		</div>
		<hr />
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
	<footer>
		<p class="text-right text-xs">
			Data Source: OECD Data Explorer | Citations: OECD Pensions at a glance 2023 Report | Powered
			by: Muze
		</p>
	</footer>
</article>

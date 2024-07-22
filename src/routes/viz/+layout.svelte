<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	const prevPage = $derived(data.prevPageInfo);
	const currentPage = $derived(data.currentPageInfo);
	const nextPage = $derived(data.nextPageInfo);
</script>

<div class="flex h-screen w-screen flex-col p-4">
	<nav
		class="prose m-auto w-full max-w-4xl prose-h3:my-0 prose-h3:-ml-2 prose-h3:inline prose-h4:m-0 prose-hr:mt-0 prose-hr:border-black"
	>
		<div class="flex items-center justify-between pb-2">
			<span class="inline-block w-1/4 transition-transform hover:-translate-x-1">
				<a
					class="text-gray-500 no-underline hover:text-black"
					href={prevPage.name === '' ? '/' : `/viz/${prevPage.name}`}
				>
					<svg class="inline size-4"><use href="#icon-arrow-left" /></svg>
					{#if prevPage.name === ''}
						<svg class="hidden size-5 align-text-bottom md:inline"><use href="#icon-home" /></svg>
					{:else}
						<span class="hidden md:inline">{prevPage.alt}</span>
					{/if}
				</a>
			</span>
			<span class="whitespace-nowrap">
				<a class="text-gray-500" href="/">
					<svg class="-mr-2 inline size-6 align-text-bottom"><use href="#icon-home" /></svg>
				</a>
				<svg class="inline size-6 align-text-bottom"><use href="#icon-slash" /></svg>
				<h3>{currentPage.alt}</h3>
			</span>
			<span class="inline-block w-1/4 text-right transition-transform hover:translate-x-1">
				<h4>
					<a
						class="text-gray-500 no-underline hover:text-black"
						href={nextPage.name === '' ? '/' : `/viz/${nextPage.name}`}
					>
						{#if nextPage.name === ''}
							<svg class="hidden size-5 md:inline"><use href="#icon-home" /></svg>
						{:else}
							<span class="hidden md:inline">{nextPage.alt}</span>
						{/if}
						<svg class="inline size-4 rotate-180"><use href="#icon-arrow-left" /></svg>
					</a>
				</h4>
			</span>
		</div>
		<hr />
	</nav>
	{@render children()}
	<footer class="prose m-auto block w-full max-w-4xl">
		<p class="text-right text-xs">
			Data Source: OECD Data Explorer | Citations: OECD Pensions at a glance 2023 Report | Powered
			by: Muze
		</p>
	</footer>
</div>

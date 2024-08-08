<script lang="ts">
	import { Heatmap } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);

	let selectedGender: string | null = $state(null);

	$effect(() => {
		if (selectedGender === null) {
			selectedGender = localStorage.getItem('selectedGender') ?? 'Female';
		}
	});

	$effect(() => {
		if (localStorage.getItem('selectedGender') !== selectedGender && selectedGender !== null) {
			localStorage.setItem('selectedGender', selectedGender);
		}
	});
</script>

<main class="prose m-auto flex size-full max-w-4xl flex-col pt-4 prose-h1:my-4 prose-h1:text-3xl">
	<div class="self-end">
		<label class="pr-2" for="country">Show for:</label>
		<select
			id="country"
			bind:value={selectedGender}
			class="h-7 min-w-48 max-w-max rounded border border-gray-500 py-0 pl-2 pt-0 uppercase"
		>
			{#if selectedGender != null}
				<option selected={selectedGender === 'Female'} value={'Female'}>Female</option>
				<option selected={selectedGender === 'Male'} value={'Male'}>Male</option>
			{/if}
		</select>
	</div>
	{#if selectedGender != null}
		<h1>
			DIFFERENCE IN AGE OF LABOUR MARKET EXIT FOR <span class="uppercase">{selectedGender}</span> FROM
			OECD AVERAGE BY YEAR, 1972-2022
		</h1>
	{/if}
	{#await import('@viz/muze') then { default: muze }}
		<Heatmap {muze} {schema} {data} selectedGender={selectedGender ?? 'Female'}></Heatmap>
	{/await}
</main>

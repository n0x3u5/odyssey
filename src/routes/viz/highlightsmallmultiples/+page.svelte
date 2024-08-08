<script lang="ts">
	import { HighlightSmallMultiples } from '$lib';
	import { DataModel } from '@viz/datamodel';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schemaP = $derived(pageData.schema);
	const dataP = $derived(pageData.data);

	const loadedDataP = $derived(
		Promise.all([schemaP, dataP]).then(([schema, data]) => DataModel.loadData(data, schema))
	);

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

<main class="prose m-auto flex size-full max-w-4xl flex-col py-4 prose-h1:my-4">
	{#if selectedGender != null}
		<div class="self-end">
			<label class="pr-2" for="country">Show for:</label>
			<select
				id="country"
				bind:value={selectedGender}
				class="h-7 min-w-48 max-w-max rounded border border-gray-500 py-0 pl-2 pt-0 uppercase"
			>
				<option selected={selectedGender === 'Female'} value={'Female'}>Female</option>
				<option selected={selectedGender === 'Male'} value={'Male'}>Male</option>
			</select>
		</div>
		<h1>
			EFFECTIVE AGE OF LABOUR MARKET EXIT FOR <span class="uppercase">{selectedGender}</span>
			ACCROSS OECD COUNTRIES BY YEAR, 1972-2022
		</h1>
	{/if}
	{#await Promise.all([loadedDataP, import('@viz/muze')])}
		<svg
			class="size-16 grow animate-spin place-self-center text-black"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
			></circle>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	{:then [loadedData, { default: muze }]}
		<HighlightSmallMultiples {muze} {loadedData} selectedGender={selectedGender ?? 'Female'}
		></HighlightSmallMultiples>
	{/await}
</main>

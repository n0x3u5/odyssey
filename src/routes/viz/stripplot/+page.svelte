<script lang="ts">
	import { StripPlot } from '$lib';
	import type { PageData } from './$types';
	import { DataModel, SortOrder } from '@viz/datamodel';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema ?? []);
	const data = $derived(pageData.data ?? [[]]);

	const countries = $derived.by(() => {
		let selectedDM = new DataModel(DataModel.loadDataSync(data, schema)).select({
			field: 'Country',
			value: 'OECD average',
			operator: 'neq'
		});

		if (Array.isArray(selectedDM)) {
			selectedDM = selectedDM[0];
		}

		return (
			selectedDM
				.sort([['Country', SortOrder.ASC]])
				.getField('Country')
				?.uniques() ?? []
		);
	});

	let selectedCountry: string | null = $state(null);

	$effect(() => {
		if (selectedCountry === null) {
			selectedCountry = localStorage.getItem('selectedCountry') ?? 'Mexico';
		}
	});

	$effect(() => {
		if (localStorage.getItem('selectedCountry') !== selectedCountry && selectedCountry !== null) {
			localStorage.setItem('selectedCountry', selectedCountry);
		}
	});
</script>

<div
	class="prose m-auto size-full max-w-4xl prose-h1:my-4 prose-h1:text-balance prose-h2:mb-0 prose-h2:mt-2"
>
	<main class="flex size-full flex-col py-4">
		<span class="self-end">
			<label for="country">Country to highlight:</label>
			<select
				id="country"
				bind:value={selectedCountry}
				class="h-7 min-w-48 max-w-max rounded border border-gray-500 py-0 pl-2 pt-0 uppercase"
			>
				{#if selectedCountry != null}
					{#each countries as country}
						<option selected={selectedCountry === country} value={country}>{country}</option>
					{/each}
				{/if}
			</select>
		</span>
		{#if selectedCountry != null}
			<h1>
				DISTRIBUTION OF COUNTRIES (<span class="uppercase text-blue-500">{selectedCountry}</span>
				vs. <span class="text-neutral-400">OTHERS</span>) BY AGE OF LABOUR MARKET EXIT FOR EACH 5
				YEARS, 1972-2022
			</h1>
		{/if}
		{#await import('@viz/muze') then { default: muze }}
			<StripPlot {muze} {data} {schema} selectedCountry={selectedCountry ?? ''}></StripPlot>
		{/await}
	</main>
</div>

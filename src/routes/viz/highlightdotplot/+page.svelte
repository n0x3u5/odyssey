<script lang="ts">
	import { HighlightDotPlot } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema ?? []);
	const data = $derived(pageData.data ?? [[]]);

	let selectedCountry = $state('Mexico');
</script>

<div
	class="prose m-auto size-full max-w-4xl prose-h1:mb-0 prose-h1:mt-4 prose-h2:mb-0 prose-h2:mt-2"
>
	<main class="flex size-full flex-col pb-2">
		<h1>
			DISTRIBUTION OF COUNTRIES BY (<span class="uppercase text-blue-500">{selectedCountry}</span>
			vs. <span class="text-neutral-400">OTHERS</span>) AGE OF LABOUR MARKET EXIT BY DECADE,
			1972-2022
		</h1>
		{#await import('@viz/muze') then { default: muze }}
			{@const dataModel = new muze.DataModel(muze.DataModel.loadDataSync(data, schema)).sort([
				['Country', 'asc']
			])}
			{@const countries = dataModel.getField('Country').uniques()}
			<select
				bind:value={selectedCountry}
				class="max-w-max self-end rounded border border-gray-500 uppercase"
			>
				{#each countries as country}
					<option value={country}>{country}</option>
				{/each}
			</select>
			<HighlightDotPlot {muze} {dataModel} {selectedCountry}></HighlightDotPlot>
		{/await}
	</main>
</div>

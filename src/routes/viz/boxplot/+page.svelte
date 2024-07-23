<script lang="ts">
	import { Boxplot } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);

	let isAdvanced = $state(false);
</script>

<main class="prose m-auto flex size-full max-w-4xl flex-col p-4 prose-h1:mb-4 prose-h2:my-2">
	<h1>
		DISTRIBUTION OF OECD COUNTRIES BY EFFECTIVE AGE OF LABOUR MARKET EXIT FOR EACH 5 YEARS,
		1972-2022
	</h1>
	<div class="self-end">
		<label class="align-middle" for="advanced">Unlock insights?</label>
		<input
			class="align-middle"
			type="checkbox"
			id="advanced"
			value="surprise"
			bind:checked={isAdvanced}
		/>
	</div>
	{#await import('@viz/muze') then { default: muze }}
		<Boxplot {muze} {schema} {data} {isAdvanced}></Boxplot>
	{/await}
</main>

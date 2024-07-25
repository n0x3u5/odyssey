<script lang="ts">
	import { Boxplot } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);

	let isAdvanced = $state(false);
</script>

<main
	class="prose m-auto flex size-full max-w-4xl flex-col py-4 prose-h1:mb-0 prose-h1:mt-4 prose-h2:my-2"
>
	<h1>
		DISTRIBUTION OF OECD COUNTRIES BY EFFECTIVE AGE OF LABOUR MARKET EXIT FOR EACH 5 YEARS,
		1972-2022
	</h1>
	<div class="self-end">
		<label class={`${isAdvanced ? 'animate-none' : 'animate-pulse'} align-middle`} for="advanced"
			>Overlay Box Plot</label
		>
		<input
			class="rounded align-middle"
			type="checkbox"
			id="advanced"
			value="isAdvanced"
			bind:checked={isAdvanced}
		/>
	</div>
	{#await import('@viz/muze') then { default: muze }}
		<Boxplot {muze} {schema} {data} {isAdvanced}></Boxplot>
	{/await}
</main>

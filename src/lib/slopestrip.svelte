<script lang="ts">
	import { untrack } from 'svelte';

	type Muze = typeof import('@viz/muze').default;

	let {
		muze,
		schema = [],
		data = [[]]
	}: {
		muze: Muze;
		schema: Array<{ name: string; type: 'dimension' | 'measure' }>;
		data: Array<Array<unknown>>;
	} = $props();

	const DataModel = $derived(muze.DataModel);
	const loadedData = $derived(DataModel.loadDataSync(data, schema));
	const dm = $derived(
		new DataModel(loadedData).select({
			operator: 'and',
			conditions: [
				{
					operator: 'or',
					conditions: [
						{ field: 'Year Int', value: 1972, operator: 'eq' },
						{ field: 'Year Int', value: 2022, operator: 'eq' }
					]
				},
				{ field: 'Gender', value: 'Female', operator: 'eq' }
			]
		})
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.columns([
				['Smh Column', 'Effective labour market exit age'],
				['Exit age for Country (Table 1)']
			])
			.rows(['Smh Row', { field: 'Year Int', as: 'discrete' }])
			.layers([
				{
					mark: 'point',
					encoding: {
						x: 'Effective labour market exit age',
						y: 'Year Int',
						color: { value: () => '#d4d4d4' }
					}
				},
				{
					mark: 'line',
					encoding: {
						x: 'Exit age for Country (Table 1)',
						y: 'Year Int',
						color: 'Table1'
					}
				},
				{
					mark: 'point',
					encoding: {
						x: 'Exit age for Country (Table 1)',
						y: 'Year Int',
						text: {
							field: 'Country',
							filter: ({ rowData }: { rowData: Record<string, number> }) =>
								rowData['Year Int'] === 1972,
							labelPlacement: {
								anchors: ['outside-top']
							}
						},
						color: 'Table1'
					}
				}
			])
			.detail('Country')
			.config({
				autoGroupBy: { disabled: true },
				legend: {
					show: false,
					color: {
						domainRangeMap: { 'Table 1': '#3b82f6', 'Table 2': '#d4d4d4' }
					}
				},
				axes: {
					x: { show: false },
					y: { showAxisName: false }
				},
				rows: { facets: { show: false } },
				columns: { facets: { show: false }, headers: { show: false } }
			});
	});

	$effect(() => {
		viz;
		untrack(() => canvas.mount(viz));

		return () => {
			canvas.dispose();
		};
	});
</script>

<div class="smh size-full" bind:this={viz}></div>

<style>
	div.smh :global(g.muze-layer-group > g.muze-layer-point:last-child) {
		fill-opacity: 1;
	}

	div.smh :global(g.muze-layer-group > g.muze-layer-point:last-child g.muze-layer-point) {
		fill-opacity: 1;
	}
</style>

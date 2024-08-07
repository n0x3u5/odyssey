<script lang="ts">
	import { untrack } from 'svelte';
	import type { DataModel as TDataModel, Layer } from './types';

	type Muze = typeof import('@viz/muze').default;

	let {
		muze,
		loadedData = { schema: [], data: [[]] },
		selectedGender = 'Female'
	}: {
		muze: Muze;
		loadedData: {
			schema: Array<{ name: string; type: 'dimension' | 'measure' }>;
			data: Array<Array<unknown>>;
		};
		selectedGender: string;
	} = $props();

	const html = $derived(muze.Operators.html);
	const DataModel = $derived(muze.DataModel);
	const rootDm = $derived(
		new DataModel(loadedData).select({
			operator: 'or',
			conditions: [
				{ field: 'Year Int', value: 1972, operator: 'eq' },
				{ field: 'Year Int', value: 2022, operator: 'eq' }
			]
		})
	);
	const dm = $derived(rootDm.select({ field: 'Gender', value: selectedGender, operator: 'eq' }));
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
						color: { value: () => '#d4d4d4' },
						detail: ['Country']
					},
					interactive: false
				},
				{
					mark: 'line',
					transition: { disabled: true },
					encoding: {
						x: 'Exit age for Country (Table 1)',
						y: 'Year Int',
						color: 'Table1'
					}
				},
				{
					mark: 'point',
					nearestPointThreshold: 150,
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
						color: {
							value: () => '#3b82f6'
						}
					}
				}
			])
			.config({
				autoGroupBy: { disabled: true },
				legend: {
					show: false,
					color: {
						domainRangeMap: { 'Table 1': '#3b82f6', 'Table 2': '#d4d4d4' }
					}
				},
				axes: {
					x: { name: 'AGE OF LABOUR MARKET EXIT →', showInnerTicks: false },
					y: { showAxisName: false }
				},
				rows: { facets: { show: false } },
				columns: { facets: { show: false }, headers: { show: false } },
				interaction: {
					tooltip: {
						formatter: (
							{ dataModel }: { dataModel: TDataModel },
							{ context }: { context: { targetLayer: Layer } }
						) => {
							const Country = dataModel.getField('Country').data().at(0);
							const Gender = dataModel.getField('Gender').data().at(0);

							const selectedDM = context.targetLayer.data().select({
								operator: 'and',
								conditions: [
									{ field: 'Country', value: Country, operator: 'eq' },
									{ field: 'Gender', value: Gender, operator: 'eq' }
								]
							});
							const exitAge1972 = selectedDM
								.select({ field: 'Year Int', value: 1972, operator: 'eq' })
								.getField('Effective labour market exit age')
								.data()
								.at(0);
							const exitAge2022 = selectedDM
								.select({ field: 'Year Int', value: 2022, operator: 'eq' })
								.getField('Effective labour market exit age')
								.data()
								.at(0);

							return html`<div
								class="flex flex-col gap-2 py-1 pb-2 pt-1 font-sans text-xs text-black"
							>
								<div>
									<p class="font-bold">${Country}</p>
								</div>
								<div>
									<p>1972: <span class="font-bold">${exitAge1972}</span> years</p>
									<p>2022: <span class="font-bold">${exitAge2022}</span> years</p>
								</div>
							</div>`;
						}
					}
				}
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

<div class="smh not-prose w-5xl min-w-5xl grow" bind:this={viz}></div>

<style lang="postcss">
	div.smh :global(g.muze-layer-group > g.muze-layer-point:last-child) {
		fill-opacity: 1;
	}

	div.smh :global(g.muze-layer-labels-group text) {
		@apply !font-sans;
		@apply !font-bold;
		@apply !fill-blue-500;
		@apply !text-xs;
	}

	div.smh :global(g.muze-layer-group > g.muze-layer-point:last-child g.muze-layer-point) {
		fill-opacity: 1;
	}

	div.smh :global(line.muze-tick-lines) {
		@apply !stroke-black;
	}

	div.smh :global(g.muze-ticks text) {
		@apply !fill-black;
	}

	div.smh :global(div.muze-grid-center-1 td.muze-grid-td) {
		@apply !border-transparent;
	}

	div.smh :global(div.muze-grid-top td.muze-grid-td) {
		@apply !opacity-0;
		@apply !border-transparent;
		@apply !pointer-events-none;
	}

	div.smh :global(td.muze-grid-darker-top) {
		@apply !border-t-neutral-300;
	}

	div.smh :global(td.muze-grid-darker-bottom) {
		@apply !border-b-neutral-300;
	}

	div.smh :global(div.muze-grid-bottom td.muze-grid-td) {
		@apply !border-transparent;
	}

	div.smh :global(div.muze-grid-bottom td.muze-grid-td:has(svg):nth-child(1) g.muze-axis > text) {
		text-anchor: end !important;
		transform: translate(170px, 19px);
		fill: #000000 !important;
	}

	div.smh
		:global(
			div.muze-grid-bottom td.muze-grid-td:has(svg):not(td.muze-grid-td:has(svg):nth-child(1))
		) {
		@apply !opacity-0;
		@apply !pointer-events-none;
	}
</style>

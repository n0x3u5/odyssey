<script lang="ts">
	import { untrack } from 'svelte';
	import type { DataModel as TDataModel } from './types';

	type Muze = typeof import('@viz/muze').default;

	let {
		muze,
		loadedData = {
			schema: [],
			data: [[]]
		},
		selectedGender = 'Female'
	}: {
		muze: Muze;
		loadedData: {
			schema: Array<{ name: string; type: 'dimension' | 'measure' }>;
			data: Array<Array<unknown>>;
		};
		selectedGender: string;
	} = $props();

	const DataModel = $derived(muze.DataModel);
	const html = $derived(muze.Operators.html);
	const dm = $derived(
		new DataModel(loadedData)
			.select({
				field: 'Gender',
				value: selectedGender,
				operator: 'eq'
			})
			.sort([['Table', 'desc']])
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.rows([['Smh Row', 'Effective labour market exit age'], ['Country name value']])
			.columns(['Smh Column', 'Year'])
			.color('Table')
			.detail(['Country'])
			.layers([
				{
					mark: 'line',
					transition: { disabled: true },
					encoding: {
						x: 'Year',
						y: 'Effective labour market exit age'
					}
				},
				{
					mark: 'point',
					encoding: {
						x: 'Year',
						y: 'Country name value',
						text: 'Country',
						size: { value: () => 0 }
					}
				}
			])
			.minUnitHeight(200)
			.config({
				rows: { facets: { show: false } },
				columns: {
					facets: { show: false },
					headers: { show: false }
				},
				axes: {
					x: {
						showAxisLine: true,
						showAxisName: false,
						nice: false,
						domain: [+new Date(1970, 0, 1), +new Date(2024, 0, 1)]
					},
					y: { show: false, compact: false }
				},
				legend: {
					show: false,
					color: {
						domainRangeMap: {
							'Table 1': '#2563eb',
							'Table 2': '#d4d4d4'
						}
					}
				},
				interaction: {
					tooltip: {
						formatter: ({ dataModel }: { dataModel: TDataModel }) => {
							const country = dataModel.getField('Country').data().at(0);
							const year = dataModel.getField('Year Int').data().at(0);
							const exitAge = dataModel.getField('Effective labour market exit age').data().at(0);

							return html`<div class="pb-1 font-sans text-black">
								<p class="font-semibold">${country}</p>
								<p>${year}</p>
								<p><span class="font-semibold">${exitAge}</span> years</p>
							</div>`;
						}
					}
				}
			});
	});

	const onRenderComplete = () => {
		[...document.querySelectorAll('g.muze-layer-line')].forEach((el) => {
			const highlightedLine = el.querySelector('g.muze-layer-line-0');
			if (highlightedLine != null) {
				el.insertAdjacentElement('beforeend', highlightedLine);
			}
		});
	};

	$effect(() => {
		canvas.on('afterRendered', onRenderComplete);

		return () => {
			canvas.off('afterRendered', onRenderComplete);
		};
	});

	$effect(() => {
		viz;
		untrack(() => canvas.mount(viz));

		return () => {
			canvas.dispose();
		};
	});
</script>

<div class="smh not-prose grow" bind:this={viz}></div>

<style lang="postcss">
	div.smh :global(div.muze-grid-center-2 tr.muze-grid-tr:first-child td.muze-grid-td) {
		@apply !border-t-neutral-300;
	}

	div.smh :global(g.muze-layer-line path) {
		@apply !stroke-[1px];
	}

	div.smh :global(g.muze-layer-line g.muze-layer-line-0 path) {
		@apply !stroke-[2px];
	}

	div.smh :global(line.muze-tick-lines) {
		@apply !stroke-black;
	}

	div.smh :global(g.muze-ticks text) {
		@apply !fill-black;
		@apply !translate-y-1;
	}

	div.smh :global(g.muze-layer-labels-group text) {
		@apply !font-sans;
		@apply !font-bold;
		@apply !text-xs;
	}

	div.smh :global(div.muze-grid-bottom td.muze-grid-td) {
		@apply !border-transparent;
	}
</style>

<script lang="ts">
	import { untrack } from 'svelte';
	import type { Canvas, DataModel as TDataModel } from './types';

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

	const html = $derived(muze.Operators.html);
	const DataModel = $derived(muze.DataModel);
	const loadedData = $derived(DataModel.loadDataSync(data, schema));
	const dm = $derived(
		new DataModel(loadedData)
			.select({
				operator: 'and',
				conditions: [
					{ field: 'Decades only : T|F', value: 'True', operator: 'eq' },
					{ field: 'Country: OECD Avg ', value: 'OECD average', operator: 'neq' }
				]
			})
			.calculateVariable({ name: 'fiftySeven', type: 'measure', defAggFn: 'avg' }, [], () => 57)
			.calculateVariable({ name: 'twelve', type: 'measure', defAggFn: 'avg' }, [], () => 12)
	);
	const [femaleDM, maleDM] = $derived(
		dm.select({ field: 'Gender', value: 'Female', operator: 'eq' }, { mode: 'all' })
	);
	const env = $derived(muze());
	const femaleCanvas = $derived(env.canvas());
	const maleCanvas = $derived(env.canvas());

	let femaleViz: HTMLDivElement | null = $state(null);
	let maleViz: HTMLDivElement | null = $state(null);

	const updateCanvas = ({
		canvas,
		dataModel,
		colorName,
		colorHex
	}: {
		canvas: Canvas;
		dataModel: TDataModel;
		colorName: string;
		colorHex: `#${string}`;
	}) =>
		canvas
			.data(dataModel)
			.detail(['Country'])
			.rows([['avg(Row (decade year) 2)', 'count(DISTINCT Country)'], ['twelve']])
			.columns([
				[
					'avg(Column (decade year) 2)',
					{ field: 'Effective labour market exit age (bins)', as: 'continuous' }
				],
				['fiftySeven']
			])
			.layers([
				{
					mark: 'bar',
					encoding: {
						x: 'Effective labour market exit age (bins)',
						y: 'count(DISTINCT Country)',
						color: { value: () => colorHex }
					}
				},
				{
					mark: 'point',
					encoding: {
						x: 'fiftySeven',
						y: 'twelve',
						text: 'avg(Year Int)',
						size: { value: () => 0 }
					}
				}
			])
			.config({
				autoGroupBy: { disabled: true },
				rows: { facets: { show: false } },
				columns: { facets: { show: false }, headers: { show: false } },
				axes: {
					y: { show: false, domain: [0, 15] },
					x: {
						domain: [54, 80],
						name: 'AGE OF LABOUR MARKET EXIT →',
						tickFormat: ({
							formattedValue,
							rawValue
						}: {
							formattedValue: string;
							rawValue: [number, number] | number;
						}) => {
							if (Array.isArray(rawValue)) {
								return rawValue[0] % 5 === 0 ? formattedValue : '';
							} else {
								return formattedValue;
							}
						}
					}
				},
				legend: {
					show: false
				},
				gridLines: {
					show: false
				},
				interaction: {
					tooltip: {
						formatter: ({ dataModel }: { dataModel: TDataModel }) => {
							const country = dataModel.getField<string>('Country').data().at(0);
							const year = dataModel.getField('avg(Year Int)').data().at(0);
							const exitAge = dataModel
								.getField('Effective labour market exit age (bins)')
								.data()
								.at(0);
							return html`<div class="pt-1"><span class="font-bold">${country}</span>, ${year}</div>
								<div class="pb-2">
									<span class="${colorName} font-bold">${exitAge}</span> years
								</div>`;
						}
					}
				}
			});

	$effect(() => {
		updateCanvas({
			canvas: femaleCanvas,
			dataModel: femaleDM,
			colorName: 'text-indigo-500',
			colorHex: '#6366f1'
		});
	});

	const onAnimationEnd = () => {
		[...document.querySelectorAll('g.muze-layer-bars rect')].map((rect) => {
			const height = rect.getAttribute('height');
			if (height != null) {
				rect.setAttribute('height', `${+height - 0.5}`);
			}
		});
	};

	$effect(() => {
		femaleCanvas.on('animationEnd', onAnimationEnd);

		return () => {
			femaleCanvas.off('animationEnd', onAnimationEnd);
		};
	});

	$effect(() => {
		femaleViz;
		untrack(() => femaleCanvas.mount(femaleViz));

		return () => {
			femaleCanvas.dispose();
		};
	});

	$effect(() => {
		updateCanvas({
			canvas: maleCanvas,
			dataModel: maleDM,
			colorName: 'text-yellow-500',
			colorHex: '#eab308'
		});
	});

	$effect(() => {
		maleCanvas.on('animationEnd', onAnimationEnd);

		return () => {
			maleCanvas.off('animationEnd', onAnimationEnd);
		};
	});

	$effect(() => {
		maleViz;
		untrack(() => maleCanvas.mount(maleViz));

		return () => {
			maleCanvas.dispose();
		};
	});
</script>

<div class="flex grow flex-col">
	<h2>FEMALE</h2>
	<div class="not-prose dotplot -mt-8 grow" bind:this={femaleViz}></div>
	<h2>MALE</h2>
	<div class="not-prose dotplot -mt-8 grow" bind:this={maleViz}></div>
</div>

<style>
	div.dotplot :global(g.muze-layer-overlay-path-group path) {
		stroke-width: 2px !important;
	}

	div.dotplot :global(g.muze-layer-point) {
		fill-opacity: 0 !important;
	}

	div.dotplot :global(g.muze-layer-point-labels text) {
		font-weight: bold !important;
		font-size: 1rem !important;
	}

	div.dotplot :global(div.muze-layout-container-component:has(> div.muze-grid-top)) {
		display: none;
	}

	div.dotplot :global(g.muze-ticks text) {
		fill: #000000 !important;
	}

	div.dotplot :global(g.muze-ticks line) {
		stroke: #000000 !important;
	}

	div.dotplot
		:global(div.muze-grid-center td.muze-grid-td:has(> div):has(svg):has(g):nth-child(1)) {
		border-left: none !important;
		border-top: none !important;
	}

	div.dotplot
		:global(div.muze-grid-center td.muze-grid-td:has(> div):has(svg):has(g):nth-child(2)) {
		border-top: none !important;
	}

	div.dotplot
		:global(div.muze-grid-center td.muze-grid-td:has(> div):has(svg):has(g):nth-child(3)) {
		border-right: none !important;
		border-top: none !important;
	}

	div.dotplot :global(div.muze-grid-bottom td.muze-grid-td) {
		border: none !important;
	}

	div.dotplot
		:global(div.muze-grid-bottom td.muze-grid-td:has(svg):nth-child(1) g.muze-axis > text) {
		text-anchor: end !important;
		transform: translate(170px, 40px);
		fill: #000000 !important;
	}

	div.dotplot
		:global(div.muze-grid-bottom td.muze-grid-td:has(svg):nth-child(2) g.muze-axis > text) {
		display: none !important;
	}

	div.dotplot
		:global(div.muze-grid-bottom td.muze-grid-td:has(svg):nth-child(3) g.muze-axis > text) {
		display: none !important;
	}
</style>

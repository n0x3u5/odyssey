<script lang="ts">
	import { untrack } from 'svelte';
	import type { Canvas, DataModel as TDataModel } from './types';

	type Muze = typeof import('@viz/muze').default;

	let {
		muze,
		selectedCountry = 'Mexico',
		data = [[]],
		schema = []
	}: {
		muze: Muze;
		selectedCountry?: string;
		data: Array<Array<unknown>>;
		schema: Array<{ name: string; type: 'dimension' | 'measure' }>;
	} = $props();

	const DataModel = $derived(muze.DataModel);
	const loadedData = $derived(DataModel.loadDataSync(data, schema));
	const rootDM = $derived(
		new DataModel(loadedData).select({
			operator: 'and',
			conditions: [
				{ field: 'Every 5 years T|F', value: 'True', operator: 'eq' },
				{ field: 'Country: OECD Avg ', value: 'OECD average', operator: 'neq' }
			]
		})
	);
	const [femaleDM, maleDM] = $derived(
		rootDM
			.calculateVariable(
				{ name: 'Country highlight', type: 'dimension' },
				['Country'],
				(country: string) => (country === selectedCountry ? 'True' : 'False')
			)
			.select({ field: 'Gender', value: 'Female', operator: 'eq' }, { mode: 'all' })
	);
	const html = $derived(muze.Operators.html);
	const env = $derived(muze());
	const femaleCanvas = $derived(env.canvas());
	const maleCanvas = $derived(env.canvas());

	let femaleViz: HTMLDivElement | null = $state(null);
	let maleViz: HTMLDivElement | null = $state(null);

	const updateCanvas = ({
		canvas,
		dm,
		showYAxis,
		title
	}: {
		canvas: Canvas;
		dm: TDataModel;
		showYAxis: boolean;
		title: string;
	}) => {
		return canvas
			.data(dm)
			.rows(['Effective labour market exit age'])
			.columns([['Year', 'Year'], ['Year']])
			.detail(['Country'])
			.color('Country highlight')
			.title(title, { align: 'left' })
			.config({
				columns: { facets: { show: false }, headers: { show: false } },
				axes: {
					x: {
						transition: { disabled: true },
						showAxisName: false,
						compact: true,
						showInnerTicks: false,
						tickFormat: ({ formattedValue }: { formattedValue: string }) =>
							formattedValue.slice(-4, formattedValue.length)
					},
					y: {
						transition: { disabled: true },
						name: 'AGE OF LABOUR MARKET EXIT →',
						show: showYAxis,
						domain: [49, 81],
						tickFormat: ({
							formattedValue,
							rawValue
						}: {
							formattedValue: string;
							rawValue: number;
						}) => {
							return rawValue % 5 === 0 ? `${formattedValue} years` : '';
						}
					}
				},
				legend: {
					show: false,
					color: {
						domainRangeMap: {
							True: '#2563eb',
							False: '#d4d4d4'
						}
					}
				},
				interaction: {
					tooltip: {
						formatter: ({ dataModel }: { dataModel: TDataModel }) => {
							const country = dataModel.getField<string>('Country').data().at(0);
							const year = dataModel.getField('Year Int').data().at(0);
							const exitAge = dataModel.getField('Effective labour market exit age').data().at(0);
							const isSelectedCountry =
								dataModel.getField('Country highlight').data().at(0) === 'True';
							return html`<div class="pt-1"><span class="font-bold">${country}</span>, ${year}</div>
								${isSelectedCountry
									? `<div class="pb-2"><span class="font-bold text-blue-500">${exitAge}</span> years</div>`
									: `<div class="pb-2"><span class="font-bold text-neutral-400">${exitAge}</span> years</div>`}`;
						}
					}
				}
			})
			.layers([
				{
					mark: 'tick',
					transition: { disabled: true }
				}
			]);
	};

	$effect(() => {
		updateCanvas({ canvas: femaleCanvas, dm: femaleDM, showYAxis: true, title: 'FEMALE' });
	});

	$effect(() => {
		updateCanvas({ canvas: maleCanvas, dm: maleDM, showYAxis: false, title: 'MALE' });
	});

	const onFemaleRenderComplete = ({ emitter: canvas }: { emitter: Canvas }) => {
		const axisSVG = canvas.yAxes()[0].mount();
		const axisName = axisSVG.querySelector('text.muze-axis-name');

		if (axisName instanceof SVGTextElement) {
			axisName.setAttribute(
				'transform',
				`matrix(0, -1, 1, 0, -67.2, ${axisSVG.getBoundingClientRect().height - 18})`
			);
		}
	};

	$effect(() => {
		femaleCanvas.on('afterRendered', onFemaleRenderComplete);

		return () => {
			femaleCanvas.off('afterRendered', onFemaleRenderComplete);
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
		maleViz;
		untrack(() => maleCanvas.mount(maleViz));

		return () => {
			maleCanvas.dispose();
		};
	});
</script>

<div class="stripplot flex max-w-5xl grow">
	<div class="not-prose grow-[545]" bind:this={femaleViz}></div>
	<div class="not-prose grow-[455]" bind:this={maleViz}></div>
</div>

<style lang="postcss">
	div.stripplot :global(div.muze-title-cell) {
		@apply font-sans;
		@apply text-2xl;
		@apply text-black;
		@apply !pl-0;
	}

	div.stripplot :global(g.muze-layer-group g.muze-layer-tick path) {
		stroke-width: 3px !important;
	}

	div.stripplot :global(text.muze-axis-name) {
		text-anchor: start !important;
		fill: #000000 !important;
	}

	div.stripplot :global(div.muze-grid-center td.muze-grid-td) {
		border-top: transparent !important;
		border-bottom: transparent !important;
		border-color: #ebebeb !important;
	}

	div.stripplot :global(div.muze-grid-center td.muze-grid-td:has(div.muze-axis-cell)) {
		border: transparent !important;
	}

	div.stripplot :global(div.muze-grid-top td.muze-grid-td) {
		border-color: transparent !important;
	}

	div.stripplot :global(div.muze-grid-bottom td.muze-grid-td) {
		border-color: transparent !important;
	}

	div.stripplot :global(g.muze-ticks line) {
		stroke: #000000 !important;
	}

	div.stripplot :global(g.muze-ticks text) {
		fill: #000000 !important;
	}
</style>

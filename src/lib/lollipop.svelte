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

	const DataModel = $derived(muze.DataModel);
	const loadedData = $derived(DataModel.loadDataSync(data, schema));
	const rootDM = $derived(
		new DataModel(loadedData).select({
			field: 'Year Int',
			value: 2022,
			operator: 'eq'
		})
	);
	const [avgFemaleOECD, avgMaleOECD] = $derived(
		rootDM
			.groupBy(['Gender', 'Country'])
			.calculateVariable(
				{
					name: '{OECD Average}',
					type: 'measure',
					defAggFn: 'avg'
				},
				['Effective labour market exit age', 'Country'],
				(exitAge: number, country: string) => (country === 'OECD average' ? exitAge : null)
			)
			.groupBy(['Gender'])
			.select({ field: 'Gender', value: 'Female', operator: 'eq' }, { mode: 'all' })
			.map(
				(dm: TDataModel) =>
					+(dm.getField<number>('Effective labour market exit age').data().at(0)?.toFixed(2) ?? 0)
			)
	);

	const [femaleDM, maleDM] = $derived(
		rootDM
			.select({ field: 'Country', value: 'OECD average', operator: 'neq' })
			.calculateVariable(
				{ name: '{Exit age diff from average}', type: 'measure', defAggFn: 'sum' },
				['Gender', 'Effective labour market exit age'],
				(gender: 'Male' | 'Female', exitAge: number) =>
					exitAge - (gender === 'Female' ? avgFemaleOECD : avgMaleOECD)
			)
			.calculateVariable(
				{ name: 'isNegativeAgeDiff', type: 'dimension' },
				['{Exit age diff from average}'],
				(ageDiff: number) => (Math.sign(ageDiff) <= 0 ? 'Negative' : 'Positive')
			)
			.sort([['isNegativeAgeDiff', 'asc']])
			.splitByRow(['Gender'])
	);
	const env = $derived(muze());
	const femaleCanvas = $derived(env.canvas());
	const maleCanvas = $derived(env.canvas());

	const updateCanvas = ({ canvas, dm }: { canvas: Canvas; dm: TDataModel }) => {
		const [min, max] = dm.getField<number>('{Exit age diff from average}').minMax();
		const minDM = dm.select({ field: '{Exit age diff from average}', value: min, operator: 'eq' });
		const maxDM = dm.select({ field: '{Exit age diff from average}', value: max, operator: 'eq' });
		const maxCountry = maxDM.getField<string>('Country').data().at(0);
		const minCountry = minDM.getField<string>('Country').data().at(0);
		return canvas
			.data(dm)
			.rows(['Country'])
			.columns(['{Exit age diff from average}'])
			.layers([
				{
					mark: 'bar',
					transition: { disabled: true },
					encoding: {
						y: 'Country',
						x: '{Exit age diff from average}',
						size: { value: () => 2 },
						text: {
							field: 'Country',
							labelPlacement: {
								anchors: ['outside-bottom', 'outside-top']
							}
						}
					}
				},
				{
					mark: 'point',
					encoding: {
						y: 'Country',
						x: '{Exit age diff from average}',
						text: {
							field: '{Exit age diff from average}',
							filter: ({ rowData: { Country: val } }: { rowData: Record<string, unknown> }) =>
								val === minCountry || val === maxCountry,
							formatter: ({ rawValue }: { rawValue: number }) =>
								rawValue < 0 ? `${rawValue.toFixed(1)} years` : `+${rawValue.toFixed(1)} years`
						}
					}
				}
			])
			.color('isNegativeAgeDiff')
			.config({
				columns: {
					facets: {
						show: false
					},
					headers: { show: false }
				},
				axes: {
					x: {
						domain: [-7.5, 7.5],
						name: '← DIFFERENCE IN YEARS →',
						showAxisLine: false,
						tickFormat: ({
							formattedValue,
							rawValue
						}: {
							formattedValue: string;
							rawValue: number;
						}) => (rawValue <= 0 ? formattedValue : `+${formattedValue}`)
					},
					y: {
						show: false,
						compact: true,
						fields: {
							Country: {
								ordering: {
									type: 'field',
									direction: 'desc',
									field: { name: '{Exit age diff from average}', aggregation: 'sum' }
								}
							}
						}
					}
				},
				legend: {
					show: false,
					color: {
						domainRangeMap: {
							Positive: '#dc2626',
							Negative: '#2563eb'
						}
					}
				},
				interaction: {
					highlight: { sideEffects: { tooltip: { enabled: false } } },
					select: { sideEffects: { tooltip: { enabled: false } } }
				}
			});
	};

	let femaleViz: HTMLDivElement | null = $state(null);
	let maleViz: HTMLDivElement | null = $state(null);

	$effect(() => {
		updateCanvas({ canvas: femaleCanvas, dm: femaleDM });
	});

	$effect(() => {
		femaleViz;
		untrack(() => femaleCanvas.mount(femaleViz));

		return () => {
			femaleCanvas.dispose();
		};
	});

	$effect(() => {
		updateCanvas({ canvas: maleCanvas, dm: maleDM });
	});

	$effect(() => {
		maleViz;
		untrack(() => maleCanvas.mount(maleViz));

		return () => {
			maleCanvas.dispose();
		};
	});
</script>

<div class="flex">
	<div class="grow pb-2 text-center">
		<p><strong>FEMALE</strong></p>
		<p>OECD average:</p>
		<p><strong>{avgFemaleOECD.toFixed(1)} years</strong></p>
	</div>
	<div class="grow pb-2 text-center">
		<p><strong>MALE</strong></p>
		<p>OECD average:</p>
		<p><strong>{avgMaleOECD.toFixed(1)} years</strong></p>
	</div>
</div>
<div class="lollipop flex h-full w-full flex-col">
	<div class="flex grow">
		<div class="not-prose female grow" bind:this={femaleViz}></div>
		<div class="not-prose male grow" bind:this={maleViz}></div>
	</div>
</div>

<style>
	div.lollipop :global(g.muze-layer-point) {
		fill-opacity: 1;
		stroke: #d4d4d4;
		stroke-width: 1;
	}
</style>

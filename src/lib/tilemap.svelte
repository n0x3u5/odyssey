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
	const html = $derived(muze.Operators.html);
	const loadedData = $derived(DataModel.loadDataSync(data, schema));
	const rootDM = $derived(new DataModel(loadedData));
	const exitAgeExtent = $derived(rootDM.getField('Avg. Effective labour market exit age').minMax());
	const [male2022DM, female2022DM, male1972DM, female1972DM] = $derived(
		rootDM.splitByRow(['UPPER(Gender)', 'Year Int'])
	);

	const env = $derived(muze());

	const female1972Canvas = $derived(env.canvas());
	const female2022Canvas = $derived(env.canvas());
	const male1972Canvas = $derived(env.canvas());
	const male2022Canvas = $derived(env.canvas());

	let female1972Viz: HTMLDivElement | null = $state(null);
	let female2022Viz: HTMLDivElement | null = $state(null);
	let male1972Viz: HTMLDivElement | null = $state(null);
	let male2022Viz: HTMLDivElement | null = $state(null);

	const updateCanvas = (canvas: Canvas, colorDomain: [number, number]) =>
		canvas
			.rows([{ field: 'Latitude (generated)', as: 'continuous' }])
			.columns([{ field: 'Longitude (generated)', as: 'continuous' }])
			.layers([
				{
					mark: 'bar',
					transition: { disabled: true },
					encoding: {
						color: 'Avg. Effective labour market exit age',
						text: 'Code'
					}
				}
			])
			.config({
				autoGroupBy: { disabled: true },
				axes: {
					x: {
						show: false,
						padding: 0.2
					},
					y: {
						show: false,
						padding: 0.2,
						fields: {
							'Latitude (generated)': {
								ordering: {
									type: 'natural',
									direction: 'desc'
								}
							}
						}
					}
				},
				legend: {
					show: false,
					color: {
						stops: 3,
						domain: colorDomain,
						range: ['#f1f2eb', '#d9d9d9', '#e15759']
					}
				},
				rows: {
					facets: { show: false }
				},
				columns: {
					headers: { show: false },
					facets: { show: false }
				},
				interaction: {
					tooltip: {
						formatter: ({ dataModel }: { dataModel: TDataModel }) => {
							const country = dataModel.getField('Country').data().at(0);
							const year = dataModel.getField('Year Int').data().at(0);
							const exitAge = dataModel
								.getField('Avg. Effective labour market exit age')
								.data()
								.at(0);
							const gender = dataModel.getField('UPPER(Gender)').data().at(0);

							return html`<div
								class="flex flex-col gap-2 py-1 pb-2 pt-1 font-sans text-xs text-black"
							>
								<div>
									<p class="font-bold">${country}</p>
									<p>${gender}</p>
								</div>
								<div>
									<p>${year}</p>
									<p><span class="font-bold">${exitAge}</span> years</p>
								</div>
							</div>`;
						}
					}
				}
			});

	$effect(() => {
		updateCanvas(female1972Canvas.data(female1972DM), exitAgeExtent);
		updateCanvas(female2022Canvas.data(female2022DM), exitAgeExtent);
		updateCanvas(male1972Canvas.data(male1972DM), exitAgeExtent);
		updateCanvas(male2022Canvas.data(male2022DM), exitAgeExtent);
	});

	const onAnimationEnd = ({ emitter: canvas }: { emitter: Canvas }) => {
		[...canvas.mount().querySelectorAll('g.muze-layer-bars rect')].map((rect) => {
			const height = rect.getAttribute('height');
			const width = rect.getAttribute('width');
			const x = rect.getAttribute('x');
			const y = rect.getAttribute('y');
			const gap = 1;
			if (x != null) {
				rect.setAttribute('x', `${+x + gap}`);
			}
			if (y != null) {
				rect.setAttribute('y', `${+y + gap}`);
			}
			if (width != null) {
				rect.setAttribute('width', `${+width - gap * 2}`);
			}
			if (height != null) {
				rect.setAttribute('height', `${+height - gap * 2}`);
			}
		});
	};

	$effect(() => {
		female1972Canvas.on('animationEnd', onAnimationEnd);
		female2022Canvas.on('animationEnd', onAnimationEnd);
		male1972Canvas.on('animationEnd', onAnimationEnd);
		male2022Canvas.on('animationEnd', onAnimationEnd);

		return () => {
			female1972Canvas.off('animationEnd', onAnimationEnd);
			female2022Canvas.off('animationEnd', onAnimationEnd);
			male1972Canvas.off('animationEnd', onAnimationEnd);
			male2022Canvas.off('animationEnd', onAnimationEnd);
		};
	});

	$effect(() => {
		female1972Viz;
		female2022Viz;
		male1972Viz;
		male2022Viz;
		untrack(() => female1972Canvas.mount(female1972Viz));
		untrack(() => female2022Canvas.mount(female2022Viz));
		untrack(() => male1972Canvas.mount(male1972Viz));
		untrack(() => male2022Canvas.mount(male2022Viz));

		return () => {
			female1972Canvas.dispose();
			female2022Canvas.dispose();
			male1972Canvas.dispose();
			male2022Canvas.dispose();
		};
	});
</script>

<h2>FEMALE</h2>
<div class="flex grow flex-col items-end">
	<div class="flex w-5/6 grow">
		<div class="flex grow flex-col">
			<h3>1972</h3>
			<div class="not-prose tilemap grow" bind:this={female1972Viz}></div>
		</div>
		<div class="flex grow flex-col">
			<h3>2022</h3>
			<div class="not-prose tilemap grow" bind:this={female2022Viz}></div>
		</div>
	</div>
</div>
<h2>MALE</h2>
<div class="flex grow flex-col items-end">
	<div class="flex w-5/6 grow">
		<div class="flex grow flex-col">
			<h3>1972</h3>
			<div class="not-prose tilemap grow" bind:this={male1972Viz}></div>
		</div>
		<div class="flex grow flex-col">
			<h3>2022</h3>
			<div class="not-prose tilemap grow" bind:this={male2022Viz}></div>
		</div>
	</div>
</div>

<style>
	div.tilemap :global(td.muze-grid-td) {
		border: transparent !important;
	}
</style>

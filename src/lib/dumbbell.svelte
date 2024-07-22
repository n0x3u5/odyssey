<script lang="ts">
	import { untrack } from 'svelte';
	import type { DataModel as TDataModel, Canvas } from './types';

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
	const share = $derived(muze.Operators.share);
	const html = $derived(muze.Operators.html);
	const loadedData = $derived(DataModel.loadDataSync(data, schema));
	const dm = $derived(
		new DataModel(loadedData).select({
			field: 'Year Int',
			value: 2022,
			operator: 'eq'
		})
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	let bodyWidth: number | null = $state(null);
	let bodyHeight: number | null = $state(null);

	const pointSize = $derived.by(() =>
		typeof bodyHeight == 'number' ? (bodyHeight > 768 ? 4 : 2) : 4
	);
	const barSize = $derived.by(() =>
		typeof bodyHeight == 'number' ? (bodyHeight > 768 ? 8 : 2) : 8
	);

	const pointEncodingFemale = $derived.by(() => {
		return typeof bodyWidth == 'number'
			? bodyWidth > 768
				? {
						x: 'Effective labour market exit age (female)',
						color: { value: () => '#6366f1' },
						size: { value: () => pointSize },
						text: {
							field: 'Gender',
							formatter: ({ formattedValue }: { formattedValue: string }) => {
								return formattedValue.toUpperCase();
							},
							filter: ({ rowData }: { rowData: { Country: string } }) => {
								return rowData.Country === 'Iceland';
							}
						}
					}
				: {
						x: 'Effective labour market exit age (female)',
						color: { value: () => '#6366f1' },
						size: { value: () => pointSize }
					}
			: {
					x: 'Effective labour market exit age (female)',
					color: { value: () => '#6366f1' },
					size: { value: () => pointSize },
					text: {
						field: 'Gender',
						formatter: ({ formattedValue }: { formattedValue: string }) => {
							return formattedValue.toUpperCase();
						},
						filter: ({ rowData }: { rowData: { Country: string } }) => {
							return rowData.Country === 'Iceland';
						}
					}
				};
	});

	const pointEncodingMale = $derived.by(() => {
		return typeof bodyWidth == 'number'
			? bodyWidth > 768
				? {
						x: 'Effective labour market exit age (male)',
						color: { value: () => '#eab308' },
						size: { value: () => pointSize },
						text: {
							field: 'Gender',
							formatter: ({ formattedValue }: { formattedValue: string }) => {
								return formattedValue.toUpperCase();
							},
							filter: ({ rowData }: { rowData: { Country: string } }) => {
								return rowData.Country === 'Iceland';
							}
						}
					}
				: {
						x: 'Effective labour market exit age (male)',
						color: { value: () => '#eab308' },
						size: { value: () => pointSize }
					}
			: {
					x: 'Effective labour market exit age (male)',
					color: { value: () => '#eab308' },
					size: { value: () => pointSize },
					text: {
						field: 'Gender',
						formatter: ({ formattedValue }: { formattedValue: string }) => {
							return formattedValue.toUpperCase();
						},
						filter: ({ rowData }: { rowData: { Country: string } }) => {
							return rowData.Country === 'Iceland';
						}
					}
				};
	});

	$effect(() => {
		barSize;
		bodyHeight;

		canvas
			.data(dm)
			.rows(['Country'])
			.columns([
				share(
					'Effective labour market exit age (female)',
					'Effective labour market exit age (male)'
				)
			])
			.layers([
				{
					mark: 'bar',
					transition: { disabled: true },
					encoding: {
						x: 'Effective labour market exit age (female)',
						x0: 'Effective labour market exit age (male)',
						size: { value: () => barSize },
						color: 'OECD Average highlight'
					}
				},
				{
					mark: 'point',
					encoding: pointEncodingFemale
				},
				{
					mark: 'point',
					encoding: pointEncodingMale
				}
			])
			.config({
				rows: { headers: { fields: { Country: { show: false } } } },
				axes: {
					x: {
						transition: { disabled: true },
						showAxisLine: false,
						name: 'AGE OF LABOUR MARKET EXIT →',
						tickFormat: (
							{ formattedValue }: { formattedValue: string },
							{ tickIndex }: { tickIndex: number }
						) => {
							return tickIndex === 0 ? `${formattedValue} (years)` : formattedValue;
						}
					},
					y: {
						compact: true,
						showAxisName: false,
						fields: {
							Country: {
								ordering: {
									type: 'field',
									direction: 'desc',
									field: { name: 'Effective labour market exit age (male)', aggregation: 'avg' }
								}
							}
						}
					}
				},
				legend: {
					show: false,
					color: {
						domainRangeMap: { False: '#d4d4d4', True: '#737373' }
					}
				},
				interaction: {
					tooltip: {
						formatter: ({ dataModel }: { dataModel: TDataModel }) => {
							const femaleValue = dataModel
								.getField<number>('Effective labour market exit age (female)')
								.data()
								.at(0);
							const maleValue = dataModel
								.getField<number>('Effective labour market exit age (male)')
								.data()
								.at(0);
							const countryValue = dataModel.getField<string>('Country').data().at(0);

							return html`<div class="flex flex-col gap-2 pb-1">
								<div class="font-bold">${countryValue}</div>
								<div
									class="${typeof maleValue === 'number' && typeof femaleValue === 'number'
										? 'grid-rows-2'
										: 'grid-rows-1'} grid grid-cols-2"
								>
									${typeof maleValue === 'number'
										? `<div>Male:</div>
									<div><span class="font-bold text-yellow-500">${maleValue}</span> years</div>`
										: ''}
									${typeof femaleValue === 'number'
										? `<div>Female:</div>
										<div><span class="font-bold text-indigo-500">${femaleValue}</span> years</div>`
										: ''}
								</div>
							</div>`;
						}
					}
				}
			});
	});

	const onAfterRendered = ({ emitter: canvas }: { emitter: Canvas }) => {
		const yAxes = canvas.yAxes();

		yAxes.forEach((yAxis) => {
			const yAxisEl = yAxis.mount();
			const yAxisTexts = yAxisEl.querySelectorAll('text');
			[...yAxisTexts].forEach((textElement) => {
				if (textElement.textContent === 'OECD average') {
					textElement.classList.add('!fill-green-600');
					textElement.classList.add('!font-bold');
				} else {
					textElement.classList.add('!fill-black');
					textElement.classList.add('!font-normal');
				}
			});
		});
	};

	$effect(() => {
		canvas.on('afterRendered', onAfterRendered);

		return () => {
			canvas.off('afterRendered', onAfterRendered);
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

<svelte:body bind:clientWidth={bodyWidth} bind:clientHeight={bodyHeight} />
<div class="flex size-full flex-col">
	<div class="inline-flex items-center justify-end space-x-4 md:hidden">
		<div class="flex items-center space-x-2">
			<span class="size-2 rounded-full border border-gray-300 bg-indigo-500" aria-hidden="true"
			></span>
			<span class="text-xs font-medium text-gray-700">Female</span>
		</div>
		<div class="flex items-center space-x-2">
			<span class="size-2 rounded-full border border-gray-300 bg-yellow-500" aria-hidden="true"
			></span>
			<span class="text-xs font-medium text-gray-700">Male</span>
		</div>
	</div>
	<div class="not-prose dumbbell grow" bind:this={viz}></div>
</div>

<style>
	div.dumbbell :global(g.muze-layer-point) {
		fill-opacity: 1;
		stroke: #e5e5e5;
		stroke-width: 1px;
	}

	@media (min-width: 768px) {
		div.dumbbell :global(g.muze-layer-point) {
			stroke-width: 2px;
		}
	}

	div.dumbbell :global(svg.muze-axis-container-bottom text.muze-axis-name) {
		text-anchor: end !important;
		transform: translate(190px, 40px);
	}

	div.dumbbell :global(div.muze-axis-cell-left g.muze-discrete-axis text) {
		fill: #000000 !important;
	}

	div.dumbbell :global(g.muze-layer-labels-group .muze-layer-labels:first-child text) {
		fill: #6366f1 !important;
		font-weight: 700;
	}

	div.dumbbell :global(g.muze-layer-labels-group .muze-layer-labels:last-child text) {
		fill: #eab308 !important;
		font-weight: 700;
	}
</style>

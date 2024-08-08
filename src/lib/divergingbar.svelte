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
	const dm = $derived(
		new DataModel(loadedData).calculateVariable(
			{ name: 'SUM(Male - Female Diff)', type: 'measure', defAggFn: 'sum' },
			[
				'avg(Effective labour market exit age (female))',
				'avg(Effective labour market exit age (male))'
			],
			(female: number, male: number) => male - female
		)
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.rows(['Region (group)', 'Country'])
			.columns([['SUM(Male - Female Diff)'], ['SUM(Male - Female Diff)']])
			.color('SUM(Male - Female Diff)')
			.layers([{ mark: 'bar', transition: { disabled: true } }])
			.config({
				rows: {
					headers: {
						show: false,
						fields: {
							'Region (group)': { show: false },
							Country: { show: false }
						}
					},
					facets: {
						fields: {
							'Region (group)': {
								ordering: {
									type: 'custom',
									values: [
										'Latin America',
										'Oceania',
										'N. America',
										'Europe & Middle East',
										'East Asia'
									]
								}
							}
						}
					}
				},
				axes: {
					x: {
						transition: { disabled: true },
						showAxisName: true
					},
					y: {
						transition: { disabled: true },
						showAxisName: false,
						compact: true,
						fields: {
							Country: {
								ordering: {
									type: 'field',
									direction: 'desc',
									field: { name: 'SUM(Male - Female Diff)', aggregation: 'sum' }
								}
							}
						}
					}
				},
				legend: {
					show: false,
					color: {
						domain: [-2, 7],
						range: ['#6366f1', '#d4d4d4', '#eab308'],
						stops: [-2, 0, 7]
					}
				},
				gridLines: {
					zeroLineColor: '#000000'
				},
				interaction: {
					tooltip: {
						formatter: ({ dataModel }: { dataModel: TDataModel }) => {
							const femaleValue = dataModel
								.getField<number>('avg(Effective labour market exit age (female))')
								.data()
								.at(0);
							const maleValue = dataModel
								.getField<number>('avg(Effective labour market exit age (male))')
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

	let zeroLeft: number | null = $state(null);
	let vizLeft: number | null = $state(null);

	const onAfterRendered = ({ emitter: canvas }: { emitter: Canvas }) => {
		const yAxes = canvas.yAxes();
		const xAxes = canvas.xAxes();

		yAxes.forEach((yAxis) => {
			const mountPoint = yAxis.mount();
			const yAxisGroup = mountPoint.querySelector('g.muze-axis');

			if (yAxisGroup instanceof SVGGElement) {
				yAxisGroup.style.textAnchor = 'start';
				yAxisGroup.setAttribute('transform', 'translate(0,0)');
			}

			mountPoint.querySelectorAll('g.muze-ticks text').forEach((tick) => {
				tick.setAttribute('x', '0');
			});
		});

		xAxes.forEach((xAxis) => {
			const mountPoint = xAxis.mount();

			mountPoint.querySelectorAll('g.muze-ticks text').forEach((tick) => {
				if (tick instanceof SVGTextElement) {
					const tickContent = tick.textContent ?? '';
					if (tick.textContent === '0') {
						zeroLeft = tick.getBoundingClientRect().left;
					}
					tick.textContent = `${Math.abs(Number.parseFloat(tickContent))}`;
				}
			});
		});

		canvas
			.composition()
			.visualGroup.placeholderInfo()
			.values.forEach((r) =>
				r.forEach((c) => {
					const visualUnit = c.source();
					const lastMarkLayerContainer = visualUnit.layers().at(-1)?.mount().parentElement ?? null;
					visualUnit._gridLines.forEach((gridLine) => {
						const gridLineGroup = gridLine.mount();
						[...gridLineGroup.children].forEach((child) => {
							[...child.children].forEach(
								(gridLinePathContainer: Element & { __data__?: { data: { xvalue: number } } }) => {
									const gridValue = gridLinePathContainer.__data__?.data.xvalue;
									if (gridLinePathContainer instanceof SVGGElement) {
										gridLinePathContainer.style.strokeWidth = '2px';
										if (gridValue === 0) {
											gridLinePathContainer.style.stroke = '#000000';
										} else {
											gridLinePathContainer.style.strokeOpacity = '0';
										}
									}
								}
							);
						});
						const gridLineContainer = gridLineGroup.parentElement?.parentElement ?? null;
						if (gridLineContainer != null) {
							lastMarkLayerContainer?.insertAdjacentElement('afterend', gridLineContainer);
						}
					});
				})
			);
	};

	$effect(() => {
		canvas.on('afterRendered', onAfterRendered);

		return () => {
			canvas.off('afterRendered', onAfterRendered);
		};
	});

	$effect(() => {
		vizLeft = viz?.getBoundingClientRect().left ?? null;
		untrack(() => canvas.mount(viz));

		return () => {
			canvas.dispose();
		};
	});
</script>

<div class="not-prose divergingbar relative grow" bind:this={viz}>
	{#if vizLeft != null && zeroLeft != null}
		<div
			class="absolute max-h-4 -translate-x-1/2 truncate font-sans text-sm"
			style={`left: ${zeroLeft - vizLeft}px;`}
		>
			<span class="font-bold text-indigo-500">HIGHER FOR FEMALE</span> ← DIFFERENCE IN YEARS →
			<span class="font-bold text-yellow-500">HIGHER FOR MALE</span>
		</div>
	{/if}
</div>

<style lang="postcss">
	div.divergingbar :global(div.muze-facet-header) {
		@apply !text-black;
		@apply !font-semibold;
		@apply !text-xs;
	}

	div.divergingbar :global(g.muze-ticks text) {
		@apply !fill-black;
		@apply !text-xs;
	}

	div.divergingbar :global(div.muze-grid-top line.muze-tick-lines) {
		@apply !stroke-black;
	}

	div.divergingbar :global(div.muze-grid-bottom line.muze-tick-lines) {
		@apply !stroke-black;
	}

	div.divergingbar :global(div.muze-grid-center-1 td.muze-grid-td) {
		@apply !border-x-transparent;
	}

	div.divergingbar :global(div.muze-grid-center-2 td.muze-grid-td) {
		@apply !border-x-transparent;
	}

	div.divergingbar :global(div.muze-grid-top td.muze-grid-td) {
		@apply !border-x-transparent;
	}

	div.divergingbar :global(div.muze-grid-bottom td.muze-grid-td) {
		@apply !border-x-transparent;
	}

	div.divergingbar :global(div.muze-grid-bottom text.muze-axis-name) {
		@apply !fill-transparent;
	}

	div.divergingbar :global(div.muze-grid-top text.muze-axis-name) {
		@apply !fill-transparent;
	}
</style>

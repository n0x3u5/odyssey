<script lang="ts">
	import { untrack } from 'svelte';
	import type { DataModel as TDataModel, Layer } from './types';

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
		new DataModel(loadedData).select({
			operator: 'and',
			conditions: [
				{
					operator: 'or',
					conditions: [
						{ field: 'Year', value: '01-01-1972', operator: 'eq' },
						{ field: 'Year', value: '01-01-2022', operator: 'eq' }
					]
				},
				{ field: 'Country', value: 'OECD average', operator: 'neq' }
			]
		})
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.rows(['Effective labour market exit age'])
			.columns(['Gender', 'Year'])
			.layers([
				{
					mark: 'line',
					highlightExactPoint: true,
					crossline: false,
					nearestPointThreshold: 150
				},
				{
					mark: 'text',
					interactive: false,
					encoding: {
						color: { value: () => '#000000' },
						text: {
							field: 'Country',
							formatter: (
								{ formattedValue }: { formattedValue: string },
								{
									dataPoint: { dataObj }
								}: {
									dataPoint: {
										dataObj: {
											Gender: 'Male' | 'Female';
											Country: string;
											'Effective labour market exit age': number;
										};
									};
								}
							) => {
								const gender = dataObj.Gender;
								const country = dataObj.Country;

								if (gender === 'Female') {
									if (
										country === 'Mexico' ||
										country === 'Japan' ||
										country === 'Spain' ||
										country === 'Türkiye'
									) {
										return `${formattedValue}, ${dataObj['Effective labour market exit age']}`;
									}
								} else {
									if (
										country === 'Mexico' ||
										country === 'Japan' ||
										country === 'Spain' ||
										country === 'Luxembourg'
									) {
										return `${formattedValue}, ${dataObj['Effective labour market exit age']}`;
									}
								}
								return '';
							}
						}
					}
				}
			])
			.color('Gender')
			.config({
				legend: { show: false, color: { domainRangeMap: { Female: '#6366f1', Male: '#eab308' } } },
				columns: { headers: { show: false } },
				axes: {
					x: {
						showAxisName: false,
						showAxisLine: true,
						// showInnerTicks: true,
						tickFormat: ({ formattedValue }: { formattedValue: string }) =>
							formattedValue.slice(-4, formattedValue.length)
					},
					y: {
						tickFormat: () => '',
						name: 'AGE OF LABOUR MARKET EXIT →'
					}
				},
				interaction: {
					tooltip: {
						includeDataFromAllLayers: true,
						formatter: (
							{ dataModel }: { dataModel: TDataModel },
							{ context }: { context: { targetLayer: Layer } }
						) => {
							const Country = dataModel.getField('Country').data().at(0);
							const Gender = dataModel.getField('Gender').data().at(0);
							// const 'Effective labour market exit age' = dataModel.getField('Effective labour market exit age');
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
									<p class="uppercase">${Gender}</p>
								</div>
								<div>
									<p>1972: <span class="font-bold">${exitAge1972}</span> years</p>
									<p>2022: <span class="font-bold">${exitAge2022}</span> years</p>
								</div>
							</div>`;
						}
					}
				}
			})
			.detail(['Country']);
	});

	const onAfterRendered = () => {
		document
			.querySelectorAll('g.muze-layer-text text')
			// @ts-expect-error - TS doesn't know about __data__ property added by d3
			.forEach((el: Element & { __data__: { data: Record<string, number> } }) => {
				el.setAttribute('text-anchor', el.__data__.data['Year Int'] === 1972 ? 'end' : 'start');
				el.setAttribute('alignment-baseline', 'text-before-edge');
				el.setAttribute('dx', el.__data__.data['Year Int'] === 1972 ? '-8px' : '8px');
			});

		document.querySelectorAll('text.muze-ticks tspan').forEach((el) => {
			el.setAttribute('dy', '25px');
		});

		document.querySelectorAll('text.muze-axis-name').forEach((el) => {
			if (el instanceof SVGTextElement) {
				const axisLength = el.ownerSVGElement?.getBoundingClientRect().height ?? 0;
				el.setAttribute('transform', `translate(-21.2,${axisLength - 10})rotate(-90)`);
			}
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

<div class="not-prose slopeplot grow" bind:this={viz}></div>

<style lang="postcss">
	div.slopeplot :global(.muze-grid-center td.muze-grid-td) {
		border-top-color: transparent !important;
		border-right-color: transparent !important;
		border-left-color: transparent !important;
		@apply !border-b-neutral-200;
	}

	div.slopeplot :global(.muze-grid-top td.muze-grid-td) {
		border-color: transparent !important;
	}

	div.slopeplot :global(.muze-grid-bottom td.muze-grid-td) {
		border-color: transparent !important;
	}

	div.slopeplot :global(.muze-ticks line) {
		stroke: #000000 !important;
	}

	div.slopeplot :global(div.muze-text-cell) {
		@apply !text-2xl;
		@apply !font-bold;
		@apply !text-black;
		@apply !uppercase;
		@apply !justify-center;
		@apply !font-sans;
	}

	div.slopeplot :global(text.muze-ticks) {
		@apply !text-base;
		@apply !font-sans;
		@apply !font-bold;
		@apply !fill-black;
		@apply !uppercase;
	}

	div.slopeplot :global(text.muze-axis-name) {
		text-anchor: start !important;
		@apply !text-black;
	}
</style>

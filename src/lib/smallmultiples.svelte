<script lang="ts">
	import { untrack } from 'svelte';
	import type { Layer, DataModel as TDataModel } from './types';

	type Muze = typeof import('@viz/muze').default;

	const getCountryFromCoordinates = (col: string, row: string): string | null => {
		const countryMatrix = [
			['OECD average', 'Chile', 'Estonia', 'Hungary', 'Japan', 'Mexico', 'Portugal', 'Switzerland'],
			[
				'Australia',
				'Colombia',
				'Finland',
				'Iceland',
				'Korea',
				'Netherlands',
				'Slovak Republic',
				'Türkiye'
			],
			[
				'Austria',
				'Costa Rica',
				'France',
				'Ireland',
				'Latvia',
				'New Zealand',
				'Slovenia',
				'United Kingdom'
			],
			['Belgium', 'Czechia', 'Germany', 'Israel', 'Lithuania', 'Norway', 'Spain', 'United States'],
			['Canada', 'Denmark', 'Greece', 'Italy', 'Luxembourg', 'Poland', 'Sweden', null]
		];

		const rowIndex = parseInt(col) - 1;
		const colIndex = parseInt(row) - 1;

		if (
			rowIndex >= 0 &&
			rowIndex < countryMatrix.length &&
			colIndex >= 0 &&
			colIndex < countryMatrix[0].length
		) {
			return countryMatrix[rowIndex][colIndex] || null;
		}

		return null;
	};

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
		new DataModel(loadedData)
			.calculateVariable(
				{ name: 'Small multiples column1', type: 'dimension' },
				['Country'],
				(country: string) => {
					if (
						country === 'OECD average' ||
						country === 'Chile' ||
						country === 'Estonia' ||
						country === 'Hungary' ||
						country === 'Japan' ||
						country === 'Mexico' ||
						country === 'Portugal' ||
						country === 'Switzerland'
					) {
						return '1';
					} else if (
						country === 'Australia' ||
						country === 'Colombia' ||
						country === 'Finland' ||
						country === 'Iceland' ||
						country === 'Korea' ||
						country === 'Netherlands' ||
						country === 'Slovak Republic' ||
						country === 'Türkiye'
					) {
						return '2';
					} else if (
						country === 'Austria' ||
						country === 'Costa Rica' ||
						country === 'France' ||
						country === 'Ireland' ||
						country === 'Latvia' ||
						country === 'New Zealand' ||
						country === 'Slovenia' ||
						country === 'United Kingdom'
					) {
						return '3';
					} else if (
						country === 'Belgium' ||
						country === 'Czechia' ||
						country === 'Germany' ||
						country === 'Israel' ||
						country === 'Lithuania' ||
						country === 'Norway' ||
						country === 'Spain' ||
						country === 'United States'
					) {
						return '4';
					} else if (
						country === 'Canada' ||
						country === 'Denmark' ||
						country === 'Greece' ||
						country === 'Italy' ||
						country === 'Luxembourg' ||
						country === 'Poland' ||
						country === 'Sweden'
					) {
						return '5';
					} else {
						return null;
					}
				}
			)
			.calculateVariable(
				{ name: 'Small multiples row1', type: 'dimension' },
				['Country'],
				(country: string) => {
					if (
						country === 'OECD average' ||
						country === 'Australia' ||
						country === 'Austria' ||
						country === 'Belgium' ||
						country === 'Canada'
					) {
						return '1';
					} else if (
						country === 'Chile' ||
						country === 'Colombia' ||
						country === 'Costa Rica' ||
						country === 'Czechia' ||
						country === 'Denmark'
					) {
						return '2';
					} else if (
						country === 'Estonia' ||
						country === 'Finland' ||
						country === 'France' ||
						country === 'Germany' ||
						country === 'Greece'
					) {
						return '3';
					} else if (
						country === 'Hungary' ||
						country === 'Iceland' ||
						country === 'Ireland' ||
						country === 'Israel' ||
						country === 'Italy'
					) {
						return '4';
					} else if (
						country === 'Japan' ||
						country === 'Korea' ||
						country === 'Latvia' ||
						country === 'Lithuania' ||
						country === 'Luxembourg'
					) {
						return '5';
					} else if (
						country === 'Mexico' ||
						country === 'Netherlands' ||
						country === 'New Zealand' ||
						country === 'Norway' ||
						country === 'Poland'
					) {
						return '6';
					} else if (
						country === 'Portugal' ||
						country === 'Slovak Republic' ||
						country === 'Slovenia' ||
						country === 'Spain' ||
						country === 'Sweden'
					) {
						return '7';
					} else if (
						country === 'Switzerland' ||
						country === 'Türkiye' ||
						country === 'United Kingdom' ||
						country === 'United States'
					) {
						return '8';
					} else {
						return null;
					}
				}
			)
			.calculateVariable(
				{ name: 'Year Temporal', type: 'dimension', subtype: 'temporal', format: '%d-%m-%Y' },
				['Year'],
				(year: string) => year
			)
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.rows([['Small multiples row1', 'Effective labour market exit age'], ['Country name value']])
			.columns(['Small multiples column1', 'Year Temporal'])
			.layers([
				{
					mark: 'line',
					encoding: {
						y: 'Effective labour market exit age',
						x: 'Year Temporal',
						color: 'Gender'
					}
				},
				{
					mark: 'point',
					encoding: {
						y: 'Country name value',
						x: 'Year Temporal',
						text: 'Country',
						size: { value: () => 0 }
					}
				}
			])
			.config({
				rows: {
					facets: {
						show: false
					}
				},
				columns: {
					headers: {
						show: false
					},
					facets: {
						show: false
					}
				},
				legend: {
					show: false,
					color: {
						domainRangeMap: {
							Female: '#6366f1',
							Male: '#eab308'
						}
					}
				},
				axes: {
					y: { compact: true, show: false },
					x: {
						showAxisName: false,
						domain: [0, +new Date(2024, 0, 1)],
						showAxisLine: false
					}
				},
				gridLines: {
					show: false
				},
				interaction: {
					tooltip: {
						formatter: (
							{ dataModel }: { dataModel: TDataModel },
							{ context: { targetLayer } }: { context: { targetLayer: Layer } }
						) => {
							const femaleValue = dataModel
								.getField<number>('Effective labour market exit age (female)')
								.data()
								.at(0);
							const maleValue = dataModel
								.getField<number>('Effective labour market exit age (male)')
								.data()
								.at(0);
							const yearValue = dataModel.getField<number>('Year Int').data().at(0);
							const col = dataModel.getField<string>('Small multiples column1').data().at(0) ?? '0';
							const row = dataModel.getField<string>('Small multiples row1').data().at(0) ?? '0';
							const countryValue = getCountryFromCoordinates(col, row);
							const otherValue =
								targetLayer
									.data()
									.select({
										operator: 'and',
										conditions: [
											{
												field: 'Gender',
												value: typeof femaleValue !== 'number' ? 'Female' : 'Male',
												operator: 'eq'
											},
											{ field: 'Year Int', value: yearValue, operator: 'eq' },
											{ field: 'Small multiples column1', value: col, operator: 'eq' },
											{ field: 'Small multiples row1', value: row, operator: 'eq' }
										]
									})
									.getField<number>(
										`Effective labour market exit age (${typeof femaleValue !== 'number' ? 'female' : 'male'})`
									)
									.data()
									.at(0) ?? 0;

							return html`<div class="flex flex-col gap-2 pb-1 text-black">
								<div>
									<p class="font-bold">${countryValue}</p>
									<p>${yearValue}</p>
								</div>
								<div class="grid grid-cols-2 grid-rows-2">
									${typeof maleValue === 'number'
										? `<div>Male:</div>
									<div><span class="font-bold text-yellow-500">${maleValue.toFixed(1)}</span> years</div>
									<div>Female:</div>
									<div><span class="font-bold text-indigo-500">${otherValue.toFixed(1)}</span> years</div>`
										: ''}
									${typeof femaleValue === 'number'
										? `<div>Male:</div>
									<div><span class="font-bold text-yellow-500">${otherValue.toFixed(1)}</span> years</div>
									<div>Female:</div>
										<div><span class="font-bold text-indigo-500">${femaleValue.toFixed(1)}</span> years</div>`
										: ''}
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

<div class="not-prose smallmultiples w-[110%] grow" bind:this={viz}></div>

<style lang="postcss">
	div.smallmultiples :global(div.muze-grid-center-2 tr.muze-grid-tr:last-child td.muze-grid-td) {
		@apply !border-b-transparent;
	}

	div.smallmultiples
		:global(div.muze-grid-center-2 tr.muze-grid-tr:last-child td.muze-grid-td:last-child) {
		@apply !border-transparent;
	}

	div.smallmultiples :global(div.muze-grid-center-2 tr.muze-grid-tr:first-child td.muze-grid-td) {
		@apply !border-t-neutral-300;
	}

	div.smallmultiples :global(line.muze-tick-lines) {
		@apply !stroke-black;
	}

	div.smallmultiples :global(g.muze-ticks text) {
		@apply !fill-black;
		@apply !translate-y-1;
	}

	div.smallmultiples :global(div.muze-grid-bottom td.muze-grid-td) {
		@apply !border-transparent;
	}

	div.smallmultiples :global(g.muze-layer-labels-group text) {
		@apply !font-sans;
		@apply !font-bold;
		@apply !text-xs;
	}

	div.smallmultiples :global(g.muze-layer-line path) {
		@apply !stroke-[1.5px];
	}
</style>

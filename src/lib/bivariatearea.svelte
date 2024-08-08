<script lang="ts">
	import { untrack } from 'svelte';
	import type { DataModel as TDataModel } from './types';

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
	const share = $derived(muze.Operators.share);
	const html = $derived(muze.Operators.html);
	const loadedData = $derived(DataModel.loadDataSync(data, schema));
	const dm = $derived(
		new DataModel(loadedData)
			.groupBy(['Country', 'Year'])
			.calculateVariable(
				{ name: 'diffneg', type: 'measure', defAggFn: 'sum' },
				['Effective labour market exit age (male)', 'Effective labour market exit age (female)'],
				(male: number, female: number) => (male < female ? male - female : null)
			)
			.calculateVariable(
				{ name: 'diffpos', type: 'measure', defAggFn: 'sum' },
				['Effective labour market exit age (male)', 'Effective labour market exit age (female)'],
				(male: number, female: number) => (male >= female ? male - female : null)
			)
			.calculateVariable(
				{ name: 'year_temp', type: 'dimension', subtype: 'temporal', format: '%d-%m-%Y' },
				['Year'],
				(year: string) => year
			)
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
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.rows([['Small multiples row1', share('diffneg', 'diffpos')], ['Country name value']])
			.columns(['Small multiples column1', 'year_temp'])
			.layers([
				{
					mark: 'area',
					encoding: {
						y: 'diffpos',
						x: 'year_temp',
						color: { value: () => '#eab308' }
					}
				},
				{
					mark: 'line',
					interactive: false,
					encoding: {
						y: 'diffpos',
						x: 'year_temp',
						color: { value: () => '#eab308' },
						size: { value: () => 2 }
					}
				},
				{
					mark: 'area',
					encoding: {
						y: 'diffneg',
						x: 'year_temp',
						color: { value: () => '#6366f1' }
					}
				},
				{
					mark: 'line',
					interactive: false,
					encoding: {
						y: 'diffneg',
						x: 'year_temp',
						color: { value: () => '#6366f1' },
						size: { value: () => 2 }
					}
				},
				{
					mark: 'point',
					interactive: false,
					encoding: {
						y: 'Country name value',
						x: 'year_temp',
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
					headers: { show: false },
					facets: {
						show: false
					}
				},
				axes: {
					x: {
						nice: false,
						showAxisName: false,
						domain: [+new Date(1970, 0, 1), +new Date(2027, 0, 1)]
					},
					y: {
						alignZeroLine: true,
						show: false,
						domain: [-10, 10]
					}
				},
				gridLines: {
					zeroLineColor: '#000000'
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
							const yearValue = dataModel.getField<number>('year_temp').data().at(0) ?? 0;
							const col = dataModel.getField<string>('Small multiples column1').data().at(0) ?? '0';
							const row = dataModel.getField<string>('Small multiples row1').data().at(0) ?? '0';
							const countryValue = getCountryFromCoordinates(col, row);

							return html`<div class="flex flex-col gap-2 pb-1 text-black">
								<div>
									<p class="font-bold">${countryValue}</p>
									<p>${new Date(yearValue).getFullYear()}</p>
								</div>
								<div class="grid grid-cols-2 grid-rows-2">
									${typeof maleValue === 'number'
										? `<div>Male:</div>
									<div><span class="font-bold text-yellow-500">${maleValue.toFixed(1)}</span> years</div>`
										: ''}
									${typeof femaleValue === 'number'
										? `
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

	const onAfterRendered = () => {
		const emptyUnit = document.querySelector(
			'div.muze-grid-center-2 tr.muze-grid-tr:last-child td.muze-grid-td:last-child div.muze-unit'
		);

		const zeroLine = document.querySelector(
			'div.muze-grid-center-2 tr.muze-grid-tr:last-child td.muze-grid-td:last-child div.muze-unit g.muze-axis-zero-line'
		);

		if (zeroLine instanceof SVGGElement) {
			const zeroLineY = zeroLine?.getBBox().y ?? 0;

			const eqText = document.createElement('div');
			eqText.classList.add('text-black');
			eqText.textContent = 'EQUAL AGE LINE';
			eqText.style.position = 'absolute';
			eqText.style.top = `${zeroLineY}px`;
			eqText.style.left = '4px';
			eqText.style.transform = 'translateY(-110%)';

			const male = document.createElement('div');
			male.classList.add('text-black');
			const maleArrow = document.createElement('div');
			maleArrow.textContent = '↑';
			maleArrow.style.fontSize = '1.5rem';
			maleArrow.style.lineHeight = '1.3';
			const maleText = document.createElement('div');
			const maleTextLine1 = document.createElement('p');
			maleTextLine1.textContent = 'HIGHER FOR';
			const maleTextLine2 = document.createElement('p');
			maleTextLine2.textContent = 'MALE';
			maleTextLine2.classList.add('font-bold', 'text-yellow-500');
			maleText.appendChild(maleTextLine1);
			maleText.appendChild(maleTextLine2);
			male.style.position = 'absolute';
			male.style.top = `${zeroLineY}px`;
			male.style.right = '4px';
			male.style.transform = 'translateY(-110%)';
			male.appendChild(maleArrow);
			male.appendChild(maleText);

			const female = document.createElement('div');
			female.classList.add('text-black');
			const femaleArrow = document.createElement('div');
			femaleArrow.textContent = '↓';
			femaleArrow.style.fontSize = '1.5rem';
			femaleArrow.style.lineHeight = '1';
			const femaleText = document.createElement('div');
			const femaleTextLine1 = document.createElement('p');
			femaleTextLine1.textContent = 'HIGHER FOR';
			const femaleTextLine2 = document.createElement('p');
			femaleTextLine2.textContent = 'FEMALE';
			femaleTextLine2.classList.add('font-bold', 'text-indigo-500');
			femaleText.appendChild(femaleTextLine1);
			femaleText.appendChild(femaleTextLine2);
			female.style.position = 'absolute';
			female.style.top = `${zeroLineY}px`;
			female.style.right = '4px';
			female.style.transform = 'translateY(5%)';
			female.appendChild(femaleArrow);
			female.appendChild(femaleText);

			emptyUnit?.appendChild(eqText);
			emptyUnit?.appendChild(male);
			emptyUnit?.appendChild(female);
		}
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

<div class="not-prose divergingbar grow" bind:this={viz}></div>

<style lang="postcss">
	div.divergingbar :global(g.muze-layer-group g.muze-layer-area) {
		fill-opacity: 0.7;
	}

	div.divergingbar :global(g.muze-grid-lines g.muze-axis-grid-lines-y g.muze-axis-zero-line) {
		stroke-dasharray: 10, 2;
		stroke-width: 2;
	}

	div.divergingbar
		:global(g.muze-grid-lines g.muze-axis-grid-lines-y g:not(g.muze-axis-zero-line)) {
		stroke: transparent !important;
	}

	div.divergingbar :global(g.muze-layer-labels-group text) {
		@apply !fill-black;
		@apply !font-semibold;
		@apply !text-xs;
		@apply !font-sans;
	}

	div.divergingbar :global(div.muze-grid-bottom td.muze-grid-td) {
		@apply !border-transparent;
	}

	div.divergingbar :global(div.muze-grid-bottom td.muze-grid-td line.muze-tick-lines) {
		@apply !stroke-black;
	}

	div.divergingbar :global(div.muze-grid-bottom td.muze-grid-td g.muze-ticks text) {
		@apply !fill-black;
		@apply translate-y-1;
	}

	div.divergingbar :global(tr.muze-grid-tr:first-child td.muze-grid-td) {
		@apply !border-t-neutral-300;
	}

	div.divergingbar :global(tr.muze-grid-tr:last-child td.muze-grid-td) {
		@apply !border-b-neutral-300;
	}
</style>

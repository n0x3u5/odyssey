<script lang="ts">
	import { untrack } from 'svelte';
	import type { Layer, DataModel as TDataModel } from './types';

	type Muze = typeof import('@viz/muze').default;

	let {
		muze,
		schema = [],
		data = [[]],
		selectedGender = 'Female'
	}: {
		muze: Muze;
		schema: Array<{ name: string; type: 'dimension' | 'measure' }>;
		data: Array<Array<unknown>>;
		selectedGender: string;
	} = $props();

	const DataModel = $derived(muze.DataModel);
	const share = $derived(muze.Operators.share);
	const html = $derived(muze.Operators.html);
	const loadedData = $derived(DataModel.loadDataSync(data, schema));
	const rootDM = $derived(
		new DataModel(loadedData)
			.select({
				operator: 'and',
				conditions: [
					{
						operator: 'or',
						conditions: [
							{
								field: 'Year Int',
								value: 2022,
								operator: 'eq'
							},
							{
								field: 'Year Int',
								value: 1972,
								operator: 'eq'
							}
						]
					},
					{
						field: 'Country',
						value: [
							'OECD average',
							'Israel',
							'Lithuania',
							'Germany',
							'Latvia',
							'Costa Rica',
							'Belgium',
							'Austria',
							'Colombia'
						],
						operator: 'nin'
					}
				]
			})
			.calculateVariable(
				{ name: 'Effective labour market exit age - 2022', type: 'measure', defAggFn: 'avg' },
				['Year Int', 'Effective labour market exit age'],
				(yearInt: number, age: number) => {
					return yearInt === 2022 ? age : null;
				}
			)
			.calculateVariable(
				{ name: 'Effective labour market exit age - 1972', type: 'measure', defAggFn: 'avg' },
				['Year Int', 'Effective labour market exit age'],
				(yearInt: number, age: number) => {
					return yearInt === 1972 ? age : null;
				}
			)
			.calculateVariable(
				{ name: '1972 > 2022', type: 'dimension', defAggFn: 'avg' },
				['Country', 'Gender'],
				(country: string, gender: string) => {
					if (gender === 'Female') {
						return country === 'Iceland' ||
							country === 'Mexico' ||
							country === 'New Zealand' ||
							country === 'Ireland' ||
							country === 'Portugal' ||
							country === 'Switzerland' ||
							country === 'Netherlands' ||
							country === 'Denmark' ||
							country === 'Canada' ||
							country === 'United Kingdom' ||
							country === 'Norway' ||
							country === 'France' ||
							country === 'Spain' ||
							country === 'Poland' ||
							country === 'Hungary' ||
							country === 'Greece' ||
							country === 'Slovenia' ||
							country === 'Luxembourg'
							? 'True'
							: 'False';
					} else {
						return country === 'Iceland' ||
							country === 'Japan' ||
							country === 'Mexico' ||
							country === 'Portugal' ||
							country === 'Ireland' ||
							country === 'Australia' ||
							country === 'Norway' ||
							country === 'Estonia' ||
							country === 'Switzerland' ||
							country === 'Denmark' ||
							country === 'Poland' ||
							country === 'Greece' ||
							country === 'Hungary' ||
							country === 'United Kingdom' ||
							country === 'Spain' ||
							country === 'Slovenia' ||
							country === 'Slovak Republic' ||
							country === 'Türkiye' ||
							country === 'Belgium' ||
							country === 'France' ||
							country === 'Luxembourg'
							? 'True'
							: 'False';
					}
				}
			)
	);
	const dm = $derived(
		rootDM.select({
			field: 'Gender',
			value: selectedGender,
			operator: 'eq'
		})
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.rows(['Country'])
			.columns([
				[
					share(
						'Effective labour market exit age - 2022',
						'Effective labour market exit age - 1972'
					)
				],
				[
					share(
						'Effective labour market exit age - 2022',
						'Effective labour market exit age - 1972'
					)
				]
			])
			.layers([
				{
					mark: 'bar',
					transition: { disabled: true },
					encoding: {
						x: 'Effective labour market exit age - 1972',
						x0: 'Effective labour market exit age - 2022',
						size: {
							value: () => 2
						}
					}
				},
				{
					mark: 'point',
					transition: { disabled: true },
					encoding: {
						x: 'Effective labour market exit age - 1972',
						y: 'Country',
						text: {
							field: 'Year Int',
							formatter: () => '1972',
							labelPlacement: {
								anchors: selectedGender === 'Female' ? ['outside-left'] : ['outside-right']
							},
							filter: (
								{ rowData }: { rowData: Record<string, unknown> },
								{ context }: { context: Layer }
							) => {
								return rowData.Country === context.axes().y.domain().at(-1);
							}
						},
						size: {
							value: () => 0
						}
					}
				},
				{
					mark: 'point',
					encoding: {
						x: 'Effective labour market exit age - 2022',
						y: 'Country',
						shape: '1972 > 2022',
						text: {
							field: 'Year Int',
							formatter: () => '2022',
							labelPlacement: {
								anchors: selectedGender === 'Female' ? ['outside-right'] : ['outside-left']
							},
							filter: (
								{ rowData }: { rowData: Record<string, unknown> },
								{ context }: { context: Layer }
							) => {
								return rowData.Country === context.axes().y.domain().at(-1);
							}
						}
					}
				}
			])
			.color('1972 > 2022')
			.config({
				legend: {
					show: false,
					color: {
						domainRangeMap: {
							True: '#16a34a',
							False: '#ef4444'
						}
					},
					shape: {
						generator: (val: 'True' | 'False') => {
							const arrowHeadPathGroup = document.createElementNS(
								'http://www.w3.org/2000/svg',
								'g'
							);
							const arrowHeadPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
							arrowHeadPath.setAttribute(
								'd',
								val === 'True'
									? 'M 6 0 L 10 0 L 4 5 L 10 10 L 6 10 L 0 5 Z'
									: 'M 0 0 L 4 0 L 10 5 L 4 10 L 0 10 L 6 5 Z'
							);
							arrowHeadPath.classList.add(
								val === 'True' ? '-translate-x-[4px]' : '-translate-x-[6px]',
								'-translate-y-[5px]'
							);
							arrowHeadPath.style.strokeLinejoin = 'round';
							arrowHeadPath.style.strokeLinecap = 'round';
							arrowHeadPathGroup.appendChild(arrowHeadPath);
							return arrowHeadPathGroup;
						}
					}
				},
				axes: {
					y: {
						showAxisName: false,
						compact: true,
						fields: {
							Country: {
								ordering: {
									type: 'field',
									direction: 'desc',
									field: { name: 'Effective labour market exit age - 2022', aggregation: 'avg' }
								}
							}
						}
					},
					x: {
						transition: { disabled: true },
						domain: [55, 80],
						showAxisLine: false,
						name: 'AGE OF LABOUR MARKET EXIT →'
					}
				},
				rows: {
					headers: { fields: { Country: { show: false } } }
				},
				gridLines: {
					show: false
				},
				interaction: {
					tooltip: {
						formatter: ({ dataModel }: { dataModel: TDataModel }) => {
							const exitAge1972 =
								dataModel
									.getField<number>('Effective labour market exit age - 1972')
									.data()
									.at(0) ?? 0;
							const exitAge2022 =
								dataModel
									.getField<number>('Effective labour market exit age - 2022')
									.data()
									.at(0) ?? 0;
							const country = dataModel.getField('Country').data().at(0);

							return html`<div
								class="flex flex-col gap-2 py-1 pb-2 pt-1 font-sans text-xs text-black"
							>
								<div>
									<p class="font-bold">${country}</p>
								</div>
								<div>
									<p>1972: <span class="font-bold">${exitAge1972.toFixed(1)}</span> years</p>
									<p>2022: <span class="font-bold">${exitAge2022.toFixed(1)}</span> years</p>
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

<div class="not-prose arrowplot relative grow" bind:this={viz}>
	<span class="absolute bottom-1/2 right-0 text-6xl font-extrabold uppercase text-neutral-200"
		>{selectedGender}</span
	>
</div>

<style>
	div.arrowplot :global(.muze-layer-point) {
		fill-opacity: 1 !important;
	}

	div.arrowplot :global(svg.muze-axis-container-top text.muze-axis-name) {
		fill: transparent !important;
	}

	div.arrowplot :global(svg.muze-axis-container-bottom text.muze-axis-name) {
		text-anchor: end !important;
		transform: translate(225px, 40px);
	}

	div.arrowplot :global(line.muze-tick-lines) {
		stroke: #000000 !important;
	}

	div.arrowplot :global(text.muze-ticks) {
		fill: #000000 !important;
	}

	div.arrowplot :global(text.muze-axis-name) {
		fill: #000000 !important;
	}
</style>

<script lang="ts">
	import { untrack } from 'svelte';
	import type { DataModel as TDataModel } from './types';

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
			{ name: 'Exit age group', type: 'dimension' },
			['sum(Effective labour market exit age)'],
			(d: number) => {
				if (d < 60) {
					return 'under 60 years';
				} else if (d >= 60 && d <= 65) {
					return '60-65 years';
				} else {
					return 'above 65 years';
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
			.columns(['Gender', 'Year'])
			.rows(['Exit age group', 'count(DISTINCT Country)'])
			.config({
				rows: {
					facets: {
						show: false,
						fields: {
							'Exit age group': {
								ordering: {
									type: 'custom',
									values: ['above 65 years', '60-65 years', 'under 60 years']
								}
							}
						}
					}
				},
				columns: {
					headers: { show: false }
				},
				axes: {
					x: {
						showAxisName: false,
						domain: [+new Date(1970, 0, 1), +new Date(2023, 0, 1)],
						nice: false
					},
					y: {
						showAxisName: false,
						domain: [0, 35],
						nice: false
					}
				},
				legend: {
					show: false,
					color: {
						domainRangeMap: {
							'above 65 years': '#dc2626',
							'60-65 years': '#1d4ed8',
							'under 60 years': '#c084fc'
						}
					}
				},
				gridLines: {
					show: false
				},
				interaction: {
					tooltip: {
						formatter: ({ dataModel }: { dataModel: TDataModel }) => {
							const ageGroup = dataModel.getField('Exit age group').data().at(0);
							const year = dataModel.getField('avg(Year Int)').data().at(0);
							const countryCount = dataModel.getField('count(DISTINCT Country)').data().at(0);

							return html`<div class="flex flex-col gap-2 pb-2 pt-1 font-sans text-xs text-black">
								<div>
									<p class="font-bold">${year}</p>
									<p>${ageGroup}</p>
								</div>
								<p>${countryCount} countries</p>
							</div>`;
						}
					}
				}
			})
			.color('Exit age group')
			.layers([{ mark: 'area' }]);
	});

	const onAfterRendered = () => {
		const above65Units = document.querySelectorAll(
			'div.muze-grid-center-2 tr.muze-grid-tr:first-child td.muze-grid-td div.muze-unit'
		);

		above65Units.forEach((unit) => {
			const eqText = document.createElement('div');
			eqText.classList.add('text-white', 'font-sans', 'text-xs');
			eqText.textContent = 'above 65 years';
			eqText.style.position = 'absolute';
			eqText.style.bottom = '0px';
			eqText.style.right = '16px';
			unit.appendChild(eqText);
		});

		const bet6065Units = document.querySelectorAll(
			'div.muze-grid-center-2 tr.muze-grid-tr:nth-child(2) td.muze-grid-td div.muze-unit'
		);

		bet6065Units.forEach((unit) => {
			const eqText = document.createElement('div');
			eqText.classList.add('text-white', 'font-sans', 'text-xs');
			eqText.textContent = '60-65 years';
			eqText.style.position = 'absolute';
			eqText.style.bottom = '20%';
			eqText.style.right = '10%';
			unit.appendChild(eqText);
		});

		const under60Units = document.querySelectorAll(
			'div.muze-grid-center-2 tr.muze-grid-tr:last-child td.muze-grid-td div.muze-unit'
		);

		under60Units.forEach((unit) => {
			const eqText = document.createElement('div');
			eqText.classList.add('text-white', 'font-sans', 'text-xs');
			eqText.textContent = '60-65 years';
			eqText.style.position = 'absolute';
			eqText.style.bottom = '5%';
			eqText.style.right = '37%';
			unit.appendChild(eqText);
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

<div class="flex grow items-end justify-end">
	<span class="rotate-180 ps-8 text-xs" style="writing-mode: vertical-lr;">
		COUNT OF OECD COUNTRIES →
	</span>
	<div class="not-prose area h-full grow" bind:this={viz}></div>
</div>

<style lang="postcss">
	div.area :global(g.muze-layer-group g.muze-layer-area) {
		fill-opacity: 0.7;
	}

	div.area :global(g.muze-ticks text) {
		fill: #000000;
	}

	div.area :global(div.muze-grid-bottom g.muze-ticks text) {
		transform: translateY(0.25rem) !important;
	}

	div.area :global(line.muze-tick-lines) {
		stroke: #000000;
	}

	div.area :global(div.muze-grid-center g.muze-ticks:nth-child(2) text) {
		opacity: 0;
	}

	div.area :global(div.muze-grid:not(div.muze-grid-center-2) td.muze-grid-td) {
		border: transparent !important;
	}

	div.area :global(div.muze-grid-center-2 td.muze-grid-td) {
		border-top: transparent !important;
		border-left: transparent !important;
	}

	div.area :global(div.muze-grid-center-2 td.muze-grid-td:last-child) {
		border-right: transparent !important;
	}

	div.area :global(div.muze-text-cell) {
		@apply !justify-center;
		@apply !font-bold;
		@apply !text-black;
		@apply !text-lg;
		@apply !uppercase;
	}
</style>

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
		new DataModel(loadedData)
			.select({
				operator: 'and',
				conditions: [
					{
						field: 'Year Int',
						value: 2022,
						operator: 'eq'
					},
					{ field: 'Country: OECD Avg ', value: 'OECD average', operator: 'neq' }
				]
			})
			.groupBy(['Country'])
			.calculateVariable(
				{ name: 'diff', type: 'measure', defAggFn: 'sum' },
				['Effective labour market exit age (male)', 'Effective labour market exit age (female)'],
				(male: number, female: number) => male - female
			)
			.calculateVariable(
				{ name: 'equal', type: 'measure', defAggFn: 'sum' },
				['Effective labour market exit age (female)', '__id__'],
				(female: number, rowIdx: number) => (rowIdx === 0 ? 55 : rowIdx === 1 ? 76 : female)
			)
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.rows([['Effective labour market exit age (female)'], ['equal']])
			.columns([['equal'], ['Effective labour market exit age (male)']])
			.layers([
				{
					mark: 'line',
					interactive: false,
					encoding: {
						x: 'equal',
						y: 'equal',
						color: { value: () => '#000000' }
					}
				},
				{
					mark: 'point',
					encoding: {
						x: 'Effective labour market exit age (male)',
						y: 'Effective labour market exit age (female)',
						color: 'diff',
						detail: ['Country'],
						size: { value: () => 8 }
					}
				}
			])
			.config({
				autoGroupBy: { disabled: true },
				axes: {
					x: {
						domain: [55, 75],
						name: 'AGE OF LABOUR MARKET EXIT FOR MALE →'
					},
					y: {
						name: 'AGE OF LABOUR MARKET EXIT FOR FEMALE →',
						showAxisLine: true,
						domain: [55, 75]
					}
				},
				legend: {
					show: false,
					color: {
						domain: [-2, 7.1],
						step: false,
						range: ['rgb(99, 102, 241)', 'rgb(212, 212, 212)', 'rgb(234, 179, 8)'],
						stops: [-2, 0, 7.1]
					}
				},
				gridLines: {
					show: false
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

	const onAfterRendered = () => {
		document.querySelectorAll('svg.muze-axis-container-left text.muze-axis-name').forEach((el) => {
			if (el instanceof SVGTextElement) {
				const axisLength = el.ownerSVGElement?.getBoundingClientRect().height ?? 0;
				const pre = document.createTextNode('AGE OF LABOUR MARKET EXIT FOR ');
				const mid = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
				mid.classList.add('font-bold');
				mid.textContent = 'FEMALE';
				const post = document.createTextNode(' →');
				el.innerHTML = '';
				el.appendChild(pre);
				el.appendChild(mid);
				el.appendChild(post);
				el.setAttribute('transform', `translate(10, 36)`);
				el.setAttribute('transform', `translate(-30,${axisLength - 10})rotate(-90)`);
			}
		});

		document
			.querySelectorAll('svg.muze-axis-container-bottom text.muze-axis-name')
			.forEach((el) => {
				if (el instanceof SVGTextElement) {
					const pre = document.createTextNode('AGE OF LABOUR MARKET EXIT FOR ');
					const mid = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
					mid.classList.add('font-bold');
					mid.textContent = 'MALE';
					const post = document.createTextNode(' →');
					el.innerHTML = '';
					el.appendChild(pre);
					el.appendChild(mid);
					el.appendChild(post);
					el.setAttribute('transform', `translate(10, 36)`);
				}
			});

		const emptyUnit = document.querySelector('div.muze-unit');

		const eqTextContainer = document.createElement('div');
		eqTextContainer.classList.add('text-black', 'font-sans');
		eqTextContainer.style.position = 'absolute';
		eqTextContainer.style.right = '9%';
		eqTextContainer.style.top = '5%';

		const eqText = document.createElement('p');
		eqText.classList.add('font-bold', 'text-base');
		eqText.textContent = 'EQUAL AGE LINE ⎯⎯>';
		eqTextContainer.appendChild(eqText);

		const eqTextExplainer = document.createElement('div');
		eqTextExplainer.classList.add('text-xs', 'font-extralight');
		const line2 = document.createElement('p');
		line2.textContent = 'if ages of labour market';
		const line3 = document.createElement('p');
		line3.textContent = 'exit for female and';
		const line4 = document.createElement('p');
		line4.textContent = 'male were equal';

		eqTextExplainer.appendChild(line2);
		eqTextExplainer.appendChild(line3);
		eqTextExplainer.appendChild(line4);

		eqTextContainer.appendChild(eqTextExplainer);

		const femaleTextContainer = document.createElement('div');
		femaleTextContainer.style.position = 'absolute';
		femaleTextContainer.style.top = '25%';
		femaleTextContainer.style.left = '20%';
		femaleTextContainer.classList.add('text-black', 'font-sans', 'text-center');

		const femaleLine1 = document.createElement('p');
		femaleLine1.textContent = 'COUNTRIES WHERE AGE OF';
		const femaleLine2 = document.createElement('p');
		femaleLine2.textContent = 'LABOUR MARKET EXIT WAS';
		const femaleLine3 = document.createElement('p');
		femaleLine3.classList.add('text-indigo-500', 'font-bold');
		femaleLine3.textContent = 'HIGHER FOR FEMALE';

		femaleTextContainer.appendChild(femaleLine1);
		femaleTextContainer.appendChild(femaleLine2);
		femaleTextContainer.appendChild(femaleLine3);

		const maleTextContainer = document.createElement('div');
		maleTextContainer.style.position = 'absolute';
		maleTextContainer.style.bottom = '13%';
		maleTextContainer.style.right = '9%';
		maleTextContainer.classList.add('text-black', 'font-sans', 'text-center');

		const maleLine1 = document.createElement('p');
		maleLine1.textContent = 'COUNTRIES WHERE AGE OF';
		const maleLine2 = document.createElement('p');
		maleLine2.textContent = 'LABOUR MARKET EXIT WAS';
		const maleLine3 = document.createElement('p');
		maleLine3.classList.add('text-yellow-500', 'font-bold');
		maleLine3.textContent = 'HIGHER FOR MALE';

		maleTextContainer.appendChild(maleLine1);
		maleTextContainer.appendChild(maleLine2);
		maleTextContainer.appendChild(maleLine3);

		emptyUnit?.appendChild(eqTextContainer);
		emptyUnit?.appendChild(femaleTextContainer);
		emptyUnit?.appendChild(maleTextContainer);
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

<div class="not-prose scatter grow" bind:this={viz}></div>

<style>
	div.scatter
		:global(g.muze-layer-group > g.muze-layer-point:not(g.muze-layer-point:nth-child(3))) {
		opacity: 0;
	}

	div.scatter :global(g.muze-layer-group > g.muze-layer-point:nth-child(3)) {
		stroke-width: 2px;
		stroke: #a3a3a3;
	}

	div.scatter :global(g.muze-layer-group > g.muze-layer-point:nth-child(3) > g.muze-layer-point) {
		fill-opacity: 0.8;
	}

	div.scatter
		:global(
			g.muze-layer-group > g.muze-layer-point:nth-child(3) > g.muze-layer-point > g.muze-layer-point
		) {
		fill-opacity: 0.8;
	}

	div.scatter :global(svg.muze-axis-container-top) {
		opacity: 0;
		pointer-events: none;
	}

	div.scatter :global(svg.muze-axis-container-right) {
		opacity: 0;
		pointer-events: none;
	}

	div.scatter :global(div.muze-grid-center td.muze-grid-td) {
		border-top: transparent !important;
		border-right: transparent !important;
	}

	div.scatter :global(div.muze-grid-center-2 td.muze-grid-td) {
		border-bottom-width: 1px !important;
		border-bottom-color: #000000 !important;
		border-left-width: 1px !important;
		border-left-color: #000000 !important;
	}

	div.scatter :global(svg.muze-axis-container-left line.muze-tick-lines) {
		stroke: #000000 !important;
		transform: translateX(2px);
	}

	div.scatter :global(svg.muze-axis-container-bottom line.muze-tick-lines) {
		stroke: #000000 !important;
		transform: translateY(-1px);
	}

	div.scatter :global(g.muze-ticks text) {
		fill: #000000 !important;
	}

	div.scatter :global(svg.muze-axis-container-left text.muze-axis-name) {
		text-anchor: start !important;
		fill: #000000 !important;
	}

	div.scatter :global(svg.muze-axis-container-bottom text.muze-axis-name) {
		text-anchor: start !important;
		fill: #000000 !important;
	}
</style>

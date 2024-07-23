<script lang="ts">
	import { untrack } from 'svelte';
	import { zip as d3Zip } from 'd3-array';
	import { computePosition, autoPlacement, shift, offset } from '@floating-ui/dom';
	import type { Canvas, DataModel as TDataModel } from './types';

	const SVG_NS = 'http://www.w3.org/2000/svg';

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
	const [femaleDM, maleDM] = $derived(
		new DataModel(loadedData)
			.calculateVariable(
				{ name: 'Jitter', type: 'measure', defAggFn: 'avg' },
				['__id__', 'Year Int'],
				(index: number) => {
					return index % 50;
				}
			)
			.select({
				operator: 'and',
				conditions: [
					{ field: 'Every 5 years T|F', value: 'True', operator: 'eq' },
					{ field: 'Country: OECD Avg ', value: 'OECD average', operator: 'neq' }
				]
			})
			.select({ field: 'Gender', value: 'Female', operator: 'eq' }, { mode: 'all' })
	);
	const env = $derived(muze());
	const femaleCanvas = $derived(env.canvas());
	const maleCanvas = $derived(env.canvas());

	let femaleViz: HTMLDivElement | null = $state(null);
	let maleViz: HTMLDivElement | null = $state(null);

	const updateCanvas = ({
		canvas,
		dataModel,
		color,
		showYAxis,
		colorName
	}: {
		canvas: Canvas;
		dataModel: TDataModel;
		color: `#${string}`;
		showYAxis: boolean;
		colorName: string;
	}) => {
		canvas
			.data(dataModel)
			.rows(['Effective labour market exit age'])
			.columns(['Year', 'Jitter'])
			.detail(['Country'])
			.config({
				legend: { show: false },
				axes: {
					x: {
						compact: true,
						show: false
					},
					y: {
						show: showYAxis,
						name: 'AGE OF LABOUR MARKET EXIT →',
						domain: [49, 81],
						tickFormat: ({
							formattedValue,
							rawValue
						}: {
							formattedValue: string;
							rawValue: number;
						}) => {
							return rawValue % 5 === 0 ? `${formattedValue} years` : '';
						}
					}
				},
				columns: {
					facets: {
						formatter: (
							{ formattedValue }: { formattedValue: string },
							{ fieldName }: { fieldName: string }
						) => {
							if (fieldName === 'Year') {
								return formattedValue.slice(-4, formattedValue.length);
							} else {
								return formattedValue;
							}
						}
					},
					headers: { show: false }
				},
				gridLines: {
					x: { show: false },
					y: { show: true }
				},
				interaction: {
					tooltip: {
						formatter: ({ dataModel }: { dataModel: TDataModel }) => {
							const country = dataModel.getField<string>('Country').data().at(0);
							const year = new Date(
								dataModel.getField<number>('Year').data().at(0) ?? 0
							).getFullYear();
							const exitAge = dataModel.getField('Effective labour market exit age').data().at(0);
							return html`<div class="pt-1"><span class="font-bold">${country}</span>, ${year}</div>
								<div class="pb-2">
									<span class="${colorName} font-bold">${exitAge}</span> years
								</div>`;
						}
					}
				}
			})
			.layers([
				{
					mark: 'point',
					encoding: {
						color: { value: () => color },
						size: { value: () => 6 }
					}
				}
			]);
	};

	$effect(() => {
		updateCanvas({
			canvas: femaleCanvas,
			dataModel: femaleDM,
			color: '#6366f1',
			showYAxis: true,
			colorName: 'text-indogo-500'
		});
	});

	$effect(() => {
		updateCanvas({
			canvas: maleCanvas,
			dataModel: maleDM,
			color: '#eab308',
			showYAxis: false,
			colorName: 'text-yellow-500'
		});
	});

	const onRenderComplete = ({ emitter: canvas }: { emitter: Canvas }) => {
		canvas
			.composition()
			.visualGroup.placeholderInfo()
			.values.forEach((r) =>
				r.forEach((c) => {
					const visualUnit = c.source();
					const rootSVG = visualUnit._graphics.rootSvg?.node();
					if (!rootSVG) return;
					const { width: rootSVGWidth, x: rootSVGLeft } = rootSVG.getBBox();
					const visualUnitLayers = visualUnit.layers();

					visualUnitLayers.forEach((layer) => {
						const yAxis = layer.axes().y;
						const yScale = yAxis.scale();
						const pointGroups = layer._points;
						const medians = pointGroups.map((points) => points.at(0)?.data['median_age'] ?? 0);
						const yPxes = medians.map((median) => yScale(median));
						const medianGroup = document.createElementNS(SVG_NS, 'g');
						medianGroup.classList.add('median-group');
						d3Zip(yPxes, medians).forEach(([yPx, median]) => {
							const medianLine = document.createElementNS(SVG_NS, 'line');
							const medianLineTracker = document.createElementNS(SVG_NS, 'line');
							medianLine.setAttribute('x1', rootSVGLeft.toString());
							medianLineTracker.setAttribute('x1', rootSVGLeft.toString());
							medianLine.setAttribute('x2', (rootSVGLeft + rootSVGWidth).toString());
							medianLineTracker.setAttribute('x2', (rootSVGLeft + rootSVGWidth).toString());
							medianLine.setAttribute('y1', yPx.toString());
							medianLineTracker.setAttribute('y1', yPx.toString());
							medianLine.setAttribute('y2', yPx.toString());
							medianLineTracker.setAttribute('y2', yPx.toString());
							medianLine.setAttribute('stroke', 'black');
							medianLineTracker.setAttribute('stroke', 'transparent');
							medianLine.setAttribute('stroke-width', '1px');
							medianLineTracker.setAttribute('stroke-width', '6px');
							medianLine.setAttribute('data-median', `${median}`);
							medianLineTracker.setAttribute('data-median', `${median}`);
							medianLine.setAttribute('shape-rendering', 'crispEdges');
							medianLine.classList.add('median-line');
							medianLineTracker.classList.add('median-line-tracker');
							medianGroup.appendChild(medianLine);
							medianGroup.appendChild(medianLineTracker);
						});
						rootSVG.appendChild(medianGroup);
					});
				})
			);

		const rootEl = canvas.mount();
		const tooltip = document.createElement('div');

		tooltip.classList.add(
			'bg-white',
			'text-neutral-600',
			'shadow-md',
			'p-2',
			'text-xs',
			`font-['Source_Sans_Pro']`,
			'absolute',
			'top-0',
			'left-0',
			'w-max',
			'border',
			'border-neutral-200',
			'hidden'
		);

		rootEl.parentElement?.parentElement?.appendChild(tooltip);

		const onMouseOut = () => {
			tooltip.classList.remove('block');
			tooltip.classList.add('hidden');
			rootEl
				.querySelectorAll('line.median-line')
				.forEach((line) => line.setAttribute('opacity', '1'));
			tooltip.innerHTML = '';
		};

		const onMouseOver = (e: MouseEvent) => {
			const target = e.target as SVGElement;
			if (target.classList.contains('median-line-tracker')) {
				const medianValue = (+(target.getAttribute('data-median') ?? 0)).toFixed(1);
				computePosition(target, tooltip, {
					middleware: [autoPlacement(), shift({ padding: 8 }), offset(8)]
				}).then(({ x, y }) => {
					Object.assign(tooltip.style, {
						left: `${x}px`,
						top: `${y}px`
					});
				});
				tooltip.appendChild(document.createTextNode(`Median age: ${medianValue} years`));
				rootEl
					.querySelectorAll('line.median-line')
					.forEach((line) => line.setAttribute('opacity', '0.4'));
				tooltip.classList.remove('hidden');
				tooltip.classList.add('block');
			} else {
				onMouseOut();
			}
		};

		const visualUnitContainer = rootEl.querySelector(
			'div.muze-grid-center:has(svg.muze-visual-unit)'
		);

		if (visualUnitContainer instanceof HTMLDivElement) {
			visualUnitContainer?.addEventListener('mouseover', onMouseOver);
			visualUnitContainer?.addEventListener('mouseout', onMouseOut);
			canvas.once('beforeDisposed', () => {
				tooltip.remove();
				visualUnitContainer?.removeEventListener('mouseover', onMouseOver);
				visualUnitContainer?.removeEventListener('mouseout', onMouseOut);
			});
		}
	};

	const onFemaleRenderComplete = ({ emitter: canvas }: { emitter: Canvas }) => {
		onRenderComplete({ emitter: canvas });

		canvas.yAxes().forEach((yAxis) => {
			const axisSVG = yAxis.mount();
			const axisName = axisSVG.querySelector('text.muze-axis-name');

			if (axisName instanceof SVGTextElement) {
				axisName.setAttribute(
					'transform',
					`matrix(0, -1, 1, 0, -67.2, ${axisSVG.getBoundingClientRect().height - 18})`
				);
			}
		});
	};

	$effect(() => {
		femaleCanvas.on('afterRendered', onFemaleRenderComplete);

		return () => {
			femaleCanvas.off('afterRendered', onFemaleRenderComplete);
		};
	});

	$effect(() => {
		maleCanvas.on('afterRendered', onRenderComplete);

		return () => {
			maleCanvas.off('afterRendered', onRenderComplete);
		};
	});

	$effect(() => {
		maleViz;
		untrack(() => maleCanvas.mount(maleViz));

		return () => {
			maleCanvas.dispose();
		};
	});

	$effect(() => {
		femaleViz;
		untrack(() => femaleCanvas.mount(femaleViz));

		return () => {
			femaleCanvas.dispose();
		};
	});
</script>

<div class="boxplot flex grow gap-4">
	<div class="flex grow-[545] flex-col">
		<h2>FEMALE</h2>
		<div class="not-prose grow" bind:this={femaleViz}></div>
	</div>
	<div class="flex grow-[455] flex-col">
		<h2>MALE</h2>
		<div class="not-prose grow" bind:this={maleViz}></div>
	</div>
</div>

<style>
	div.boxplot :global(text.muze-axis-name) {
		text-anchor: start !important;
	}

	div.boxplot :global(div.muze-grid-center td.muze-grid-td) {
		border-top: transparent !important;
		border-bottom: transparent !important;
		border-color: #ebebeb !important;
	}

	div.boxplot :global(div.muze-grid-center td.muze-grid-td:has(div.muze-axis-cell)) {
		border: transparent !important;
	}

	div.boxplot :global(div.muze-grid-top td.muze-grid-td) {
		border-color: transparent !important;
	}

	div.boxplot :global(div.muze-text-cell) {
		justify-content: center !important;
		color: #000000 !important;
	}

	div.boxplot :global(g.muze-ticks line) {
		stroke: #000000 !important;
	}

	div.boxplot :global(g.muze-ticks text) {
		fill: #000000 !important;
	}

	div.boxplot :global(text.muze-axis-name) {
		fill: #000000 !important;
	}
</style>

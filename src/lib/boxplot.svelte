<script lang="ts">
	import { untrack } from 'svelte';
	import { median as d3Median, zip as d3Zip } from 'd3-array';
	import { computePosition, autoPlacement, shift, offset } from '@floating-ui/dom';
	import type { Canvas } from './types';

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
	const loadedData = $derived(DataModel.loadDataSync(data, schema));
	const dm = $derived(
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
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.rows(['Effective labour market exit age'])
			.columns(['Gender', 'Year', 'Jitter'])
			.detail(['Country'])
			.color('Gender')
			.config({
				legend: { show: false },
				axes: {
					x: {
						compact: true,
						show: false
					},
					y: {
						domain: [50, 80],
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
					}
				},
				gridLines: {
					show: false
				}
			})
			.layers([
				{
					mark: 'point',
					encoding: {
						size: { value: () => 6 }
					}
				}
			]);
	});

	const onRenderComplete = ({ emitter: canvas }: { emitter: Canvas }) => {
		canvas
			.composition()
			.visualGroup.placeholderInfo()
			.values.forEach((r) =>
				r.forEach((c) => {
					const visualUnit = c.source();
					const rootSVG = visualUnit._graphics.rootSvg.node();
					const { width: rootSVGWidth, x: rootSVGLeft } = rootSVG.getBBox();
					const visualUnitLayers = visualUnit.layers();

					visualUnitLayers.forEach((layer) => {
						const yAxis = layer.axes().y;
						const yScale = yAxis.scale();
						const pointGroups = layer._points;
						const medians = pointGroups.map(
							(points) =>
								d3Median(points, ({ data }) => data['Effective labour market exit age']) ?? 0
						);
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
							medianLineTracker.setAttribute('stroke-width', '4px');
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
	};

	$effect(() => {
		canvas.on('afterRendered', onRenderComplete);
		canvas.on('afterRendered', ({ emitter: canvas }: { emitter: Canvas }) => {
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

			rootEl.appendChild(tooltip);

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
					document
						.querySelectorAll('line.median-line')
						.forEach((line) => line.setAttribute('opacity', '0.4'));
					tooltip.classList.remove('hidden');
					tooltip.classList.add('block');
				} else {
					tooltip.classList.remove('block');
					tooltip.classList.add('hidden');
					document
						.querySelectorAll('line.median-line')
						.forEach((line) => line.setAttribute('opacity', '1'));
					tooltip.innerHTML = '';
				}
			};

			const visualUnitContainer = document.querySelector(
				'div.muze-grid-center:has(svg.muze-visual-unit)'
			);

			if (visualUnitContainer instanceof HTMLDivElement) {
				visualUnitContainer?.addEventListener('mouseover', onMouseOver);
				canvas.once('beforeDisposed', () => {
					console.log('Aaah!');
					visualUnitContainer?.removeEventListener('mouseover', onMouseOver);
				});
			}
		});

		return () => {
			canvas.off('afterRendered', onRenderComplete);
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

<div class="boxplot size-full" bind:this={viz}></div>

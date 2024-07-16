<script lang="ts">
	import { untrack } from 'svelte';
	import { median as d3Median } from 'd3-array';
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
						const yPxes = pointGroups.map((points) =>
							yScale(d3Median(points, ({ data }) => data['Effective labour market exit age']))
						);
						const medianGroup = document.createElementNS(SVG_NS, 'g');
						yPxes.forEach((yPx) => {
							const medianLine = document.createElementNS(SVG_NS, 'line');
							medianLine.setAttribute('x1', rootSVGLeft.toString());
							medianLine.setAttribute('x2', (rootSVGLeft + rootSVGWidth).toString());
							medianLine.setAttribute('y1', yPx.toString());
							medianLine.setAttribute('y2', yPx.toString());
							medianLine.setAttribute('stroke', 'black');
							medianLine.setAttribute('stroke-width', '1');
							medianLine.setAttribute('shape-rendering', 'crispEdges');
							medianLine.classList.add('median-line');
							medianGroup.appendChild(medianLine);
						});
						rootSVG.appendChild(medianGroup);
					});
				})
			);
	};

	$effect(() => {
		canvas.on('afterRendered', onRenderComplete);

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

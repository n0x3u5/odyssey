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
		data = [[]],
		isAdvanced = false
	}: {
		muze: Muze;
		schema: Array<{ name: string; type: 'dimension' | 'measure' }>;
		data: Array<Array<unknown>>;
		isAdvanced: boolean;
	} = $props();

	const boxOpacity = $derived(isAdvanced ? 1 : 0);
	const DataModel = $derived(muze.DataModel);
	const html = $derived(muze.Operators.html);
	const share = $derived(muze.Operators.share);
	const layerFactory = $derived(muze.layerFactory);
	const layers = [
		{
			name: 'boxPoint',
			mark: 'point',
			className: 'boxPoints',
			encoding: {
				y: 'boxMark.encoding.y',
				x: 'boxMark.encoding.x',
				color: 'boxMark.encoding.pointColor',
				size: 'boxMark.encoding.pointSize'
			},
			transition: { disabled: true }
		},
		{
			name: 'maxTick',
			mark: 'tick',
			className: 'boxTicks',
			encoding: {
				y: 'boxMark.encoding.maxValue',
				x: 'boxMark.encoding.x'
			},
			interactive: false,
			transition: { disabled: true }
		},
		{
			name: 'upperTick',
			className: 'upper-tick',
			mark: 'tick',
			encoding: {
				y: 'boxMark.encoding.quarter',
				x: 'boxMark.encoding.x',
				y0: 'boxMark.encoding.minValue'
			},
			interactive: false,
			transition: { disabled: true }
		},
		{
			name: 'upperBand',
			mark: 'bar',
			className: 'upperBand',
			encoding: {
				y: 'boxMark.encoding.thirdQuarter',
				x: 'boxMark.encoding.x',
				y0: 'boxMark.encoding.medianValue',
				color: 'boxMark.encoding.color'
			},
			transform: {
				type: 'identity'
			},
			interactive: false,
			transition: { disabled: true }
		},
		{
			name: 'meanTick',
			mark: 'tick',
			className: 'boxTicks',
			encoding: {
				y: 'boxMark.encoding.medianValue',
				x: 'boxMark.encoding.x'
			},
			interactive: false,
			transition: { disabled: true }
		},
		{
			name: 'lowerBand',
			mark: 'bar',
			className: 'lowerBand',
			encoding: {
				y0: 'boxMark.encoding.medianValue',
				x: 'boxMark.encoding.x',
				y: 'boxMark.encoding.quarter',
				color: 'boxMark.encoding.color'
			},
			transform: {
				type: 'identity'
			},
			interactive: false,
			transition: { disabled: true }
		},
		{
			name: 'lowerTick',
			mark: 'tick',
			className: 'boxTicks',
			encoding: {
				y: 'boxMark.encoding.maxValue',
				x: 'boxMark.encoding.x',
				y0: 'boxMark.encoding.thirdQuarter'
			},
			interactive: false,
			transition: { disabled: true }
		},
		{
			name: 'minTick',
			mark: 'tick',
			className: 'boxTicks',
			encoding: {
				y: 'boxMark.encoding.minValue',
				x: 'boxMark.encoding.x'
			},
			interactive: false,
			transition: { disabled: true }
		}
	];
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
		colorName,
		showBox,
		title
	}: {
		canvas: Canvas;
		dataModel: TDataModel;
		color: `#${string}`;
		showYAxis: boolean;
		colorName: string;
		showBox: boolean;
		title: string;
	}) => {
		canvas
			.data(dataModel)
			.title(title, { align: 'left' })
			.rows(
				showBox
					? [
							share(
								'min_age',
								'median_age',
								'max_age',
								'q1_age',
								'q3_age',
								'Effective labour market exit age'
							)
						]
					: ['Effective labour market exit age']
			)
			.columns([['Year', showBox ? 'Year' : 'Jitter']])
			.detail(['Country'])
			.config({
				legend: { show: false },
				axes: {
					x: {
						compact: true,
						show: false,
						transition: { disabled: true }
					},
					y: {
						show: showYAxis,
						transition: { disabled: true },
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
			.layers(
				showBox
					? [
							{
								mark: 'boxMark',
								encoding: {
									minValue: 'min_age',
									medianValue: 'median_age',
									x: 'Year',
									y: 'Effective labour market exit age',
									color: { value: () => 'transparent' },
									pointColor: { value: () => color },
									pointSize: { value: () => 6 },
									maxValue: 'max_age',
									quarter: 'q1_age',
									thirdQuarter: 'q3_age'
								}
							}
						]
					: [
							{
								mark: 'point',
								encoding: {
									x: 'Jitter',
									y: 'Effective labour market exit age',
									color: { value: () => color },
									size: { value: () => 6 }
								}
							}
						]
			);
	};

	$effect(() => {
		layerFactory.composeLayers('boxMark', layers);
	});

	$effect(() => {
		updateCanvas({
			canvas: femaleCanvas,
			dataModel: femaleDM,
			color: '#6366f1',
			showYAxis: true,
			colorName: 'text-indogo-500',
			showBox: isAdvanced,
			title: 'FEMALE'
		});
	});

	$effect(() => {
		updateCanvas({
			canvas: maleCanvas,
			dataModel: maleDM,
			color: '#eab308',
			showYAxis: false,
			colorName: 'text-yellow-500',
			showBox: isAdvanced,
			title: 'MALE'
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

		const axisSVG = canvas.yAxes()[0].mount();
		const axisName = axisSVG.querySelector('text.muze-axis-name');

		if (axisName instanceof SVGTextElement) {
			axisName.setAttribute(
				'transform',
				`matrix(0, -1, 1, 0, -67.2, ${axisSVG.getBoundingClientRect().height - 18})`
			);
		}
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
	<div
		class="not-prose grow-[545]"
		style:--boxOpacity={boxOpacity}
		style:--medianOpacity={1 - boxOpacity}
		style:--pointOpacity={isAdvanced ? 0.7 : 1}
		bind:this={femaleViz}
	></div>
	<div
		class="not-prose grow-[455]"
		style:--boxOpacity={boxOpacity}
		style:--medianOpacity={1 - boxOpacity}
		style:--pointOpacity={isAdvanced ? 0.7 : 1}
		bind:this={maleViz}
	></div>
</div>

<style lang="postcss">
	div.boxplot :global(div.muze-title-cell) {
		@apply font-sans;
		@apply text-2xl;
		@apply text-black;
		@apply !pl-0;
	}

	div.boxplot :global(text.muze-axis-name) {
		text-anchor: start !important;
	}

	div.boxplot :global(div.muze-layout-container-component:has(div.muze-axis-cell-right)) {
		display: none !important;
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

	div.boxplot :global(td.muze-grid-td div.muze-text-cell) {
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

	div.boxplot :global(.median-line) {
		opacity: var(--medianOpacity);
	}

	div.boxplot :global(.muze-layer-tick) {
		stroke: #000000 !important;
		opacity: var(--boxOpacity);
	}

	div.boxplot :global(.muze-layer-bar) {
		stroke: #000000 !important;
		opacity: var(--boxOpacity);
	}

	div.boxplot :global(.muze-layer-point) {
		opacity: var(--pointOpacity) !important;
	}
</style>

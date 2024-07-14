<script lang="ts">
	type Muze = typeof import('@viz/muze').default;

	type CanvasEventParam = {
		emitter: {
			yAxes: () => Array<{ mount: () => SVGSVGElement }>;
			composition: () => {
				visualGroup: {
					placeholderInfo: () => {
						values: Array<
							Array<{
								source: () => {
									layers: () => Array<{ mount: () => SVGGElement }>;
									_gridLines: Array<{ mount: () => SVGGElement }>;
								};
							}>
						>;
					};
				};
			};
		};
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
	const loadedData = $derived(DataModel.loadDataSync(data, schema));
	const dm = $derived(
		new DataModel(loadedData)
			.select({
				field: 'Year Int',
				value: 2022,
				operator: 'eq'
			})
			.calculateVariable(
				{ name: 'Neg Effective labour market exit age (female)', type: 'measure', defAggFn: 'avg' },
				['Effective labour market exit age (female)'],
				(obs: number | null) => (typeof obs === 'number' ? -obs : obs)
			)
	);
	const env = $derived(muze().data(dm));

	const createCanvas = $derived.by(
		() =>
			(config: {
				gender: 'female' | 'male';
				column: string;
				color: string;
				domain: [number, number];
			}) => {
				return env
					.canvas()
					.rows(['Country'])
					.columns([config.column])
					.layers([
						{
							mark: 'bar',
							encoding: {
								color: `OECD Average highlight (${config.gender})`,
								text: {
									field: config.column,
									formatter: ({
										rawValue,
										getRowData
									}: {
										rawValue: number;
										getRowData: () => Record<string, string>;
									}) => {
										return getRowData().Country === 'Iceland'
											? `${Math.abs(rawValue).toFixed(1)} years`
											: `${Math.abs(rawValue).toFixed(1)}`;
									}
								}
							}
						}
					])
					.config({
						rows: { headers: { fields: { Country: { show: false } } } },
						axes: {
							x: { show: false, domain: config.domain },
							y: {
								show: config.gender === 'male',
								showAxisName: false,
								compact: true,
								fields: {
									Country: {
										ordering: {
											type: 'field',
											direction: 'desc',
											field: { name: 'Effective labour market exit age (male)', aggregation: 'avg' }
										}
									}
								}
							}
						},
						legend: {
							show: false,
							color: {
								domainRangeMap: { False: config.color, True: '#16a34a' }
							}
						},
						interaction: {
							highlight: { sideEffects: { tooltip: { enabled: false } } },
							select: { sideEffects: { tooltip: { enabled: false } } }
						},
						gridLines: { zeroLineColor: 'transparent' }
					});
			}
	);

	let femaleViz: HTMLDivElement | null = $state(null);
	let maleViz: HTMLDivElement | null = $state(null);

	const onAnimationEnd = ({ emitter: canvas }: CanvasEventParam) => {
		canvas
			.composition()
			.visualGroup.placeholderInfo()
			.values.forEach((r) =>
				r.forEach((c) => {
					const visualUnit = c.source();
					const lastMarkLayerContainer = visualUnit.layers().at(-1)?.mount().parentElement ?? null;
					visualUnit._gridLines.forEach((gridLine) => {
						const gridLineGroup = gridLine.mount();
						[...gridLineGroup.children].forEach((child) => {
							[...child.children].forEach(
								(gridLinePathContainer: Element & { __data__?: { data: { xvalue: number } } }) => {
									const gridValue = gridLinePathContainer.__data__?.data.xvalue;
									if (gridLinePathContainer instanceof SVGGElement) {
										gridLinePathContainer.style.strokeWidth = '2px';
										if (gridValue === 0) {
											gridLinePathContainer.style.stroke = '#000000';
										} else if (
											typeof gridValue === 'number' &&
											(Math.abs(gridValue) === 20 ||
												Math.abs(gridValue) === 40 ||
												Math.abs(gridValue) === 60)
										) {
											gridLinePathContainer.style.strokeDasharray = '3, 2';
											gridLinePathContainer.style.stroke = '#ffffff';
										} else {
											gridLinePathContainer.style.stroke = 'transparent';
										}
									}
								}
							);
						});
						const gridLineContainer = gridLineGroup.parentElement?.parentElement ?? null;
						if (gridLineContainer != null) {
							lastMarkLayerContainer?.insertAdjacentElement('afterend', gridLineContainer);
						}
					});
				})
			);
	};

	$effect(() => {
		const femaleCanvas = createCanvas({
			gender: 'female',
			column: 'Neg Effective labour market exit age (female)',
			color: '#6366f1',
			domain: [-85, 0]
		});
		femaleCanvas.on('animationEnd', onAnimationEnd);
		femaleCanvas.mount(femaleViz);

		return () => {
			femaleCanvas.off('animationEnd', onAnimationEnd);
			femaleCanvas.dispose();
		};
	});

	const onAfterRendered = ({ emitter: canvas }: CanvasEventParam) => {
		const yAxes = canvas.yAxes();

		yAxes.forEach((yAxis) => {
			const yAxisEl = yAxis.mount();
			const yAxisTexts = yAxisEl.querySelectorAll('text');
			[...yAxisTexts].forEach((textElement) => {
				if (textElement.textContent === 'OECD average') {
					textElement.classList.add('!fill-green-600');
					textElement.classList.add('!font-bold');
				} else {
					textElement.classList.add('!fill-black');
					textElement.classList.add('!font-normal');
				}
			});
		});
	};

	$effect(() => {
		const maleCanvas = createCanvas({
			gender: 'male',
			column: 'Effective labour market exit age (male)',
			color: '#eab308',
			domain: [0, 85]
		});

		maleCanvas.on('afterRendered', onAfterRendered);
		maleCanvas.on('animationEnd', onAnimationEnd);
		maleCanvas.mount(maleViz);

		return () => {
			maleCanvas.off('animationEnd', onAnimationEnd);
			maleCanvas.off('afterRendered', onAfterRendered);
			maleCanvas.dispose();
		};
	});
</script>

<div class="grow-[427] md:grow-[467]" bind:this={femaleViz}></div>
<div class="male grow-[573] md:grow-[533]" bind:this={maleViz}></div>

<style lang="postcss">
	div.male :global(div.muze-axis-cell-left g.muze-discrete-axis) {
		text-anchor: middle;
		transform: translate(22px, 0);
	}

	div :global(td.muze-grid-td) {
		border-color: transparent !important;
	}
</style>

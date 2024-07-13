<script lang="ts">
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

	function createCanvas(config: {
		gender: 'female' | 'male';
		column: string;
		color: string;
		domain: [number, number];
	}) {
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

	const femaleCanvas = $derived(
		createCanvas({
			gender: 'female',
			column: 'Neg Effective labour market exit age (female)',
			color: '#6366f1',
			domain: [-85, 0]
		})
	);

	const maleCanvas = $derived(
		createCanvas({
			gender: 'male',
			column: 'Effective labour market exit age (male)',
			color: '#eab308',
			domain: [0, 85]
		})
	);

	let femaleViz: HTMLDivElement | null = $state(null);
	let maleViz: HTMLDivElement | null = $state(null);

	const onAnimationEnd = ({
		emitter: canvas
	}: {
		emitter: {
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
	}) => {
		canvas
			.composition()
			.visualGroup.placeholderInfo()
			.values.map((r) =>
				r.map((c) => {
					const visualUnit = c.source();
					const lastMarkLayerContainer = visualUnit.layers().at(-1)?.mount().parentElement ?? null;
					visualUnit._gridLines.map((gridLine) => {
						const gridLineGroup = gridLine.mount();
						[...gridLineGroup.children].map((child) => {
							[...child.children].map(
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
		femaleCanvas.on('animationEnd', onAnimationEnd);
		femaleCanvas.mount(femaleViz);

		return () => {
			femaleCanvas.off('animationEnd', onAnimationEnd);
			femaleCanvas.dispose();
		};
	});

	$effect(() => {
		maleCanvas.on('animationEnd', onAnimationEnd);
		maleCanvas.mount(maleViz);

		return () => {
			maleCanvas.off('animationEnd', onAnimationEnd);
			maleCanvas.dispose();
		};
	});
</script>

<article
	class="prose mx-auto flex h-full w-full max-w-4xl flex-col prose-h2:m-0 prose-h2:mb-4 prose-hr:mb-4 prose-hr:border-black"
>
	<header>
		<h3>Bar chart</h3>
		<hr />
		<h1>
			EFFECTIVE AGE OF LABOUR MARKET EXIT ACROSS OECD COUNTRIES, FOR <span class="text-indigo-500"
				>FEMALE</span
			>
			AND <span class="text-yellow-500">MALE</span>, 2022
		</h1>
		<div class="flex justify-between">
			<h2>FEMALE</h2>
			<h2>MALE</h2>
		</div>
	</header>
	<main class="flex w-full grow">
		<div class="not-prose grow" bind:this={femaleViz}></div>
		<div class="male not-prose grow" bind:this={maleViz}></div>
	</main>
	<footer>
		<p class="text-right text-xs">
			Data Source: OECD Data Explorer | Citations: OECD Pensions at a glance 2023 Report | Powered
			by: Muze
		</p>
	</footer>
</article>

<style lang="postcss">
	div.male :global(div.muze-axis-cell-left g.muze-discrete-axis) {
		text-anchor: middle;
		transform: translate(22px, 0);
	}

	div.male :global(div.muze-axis-cell-left g.muze-discrete-axis g.muze-ticks text) {
		fill: #000000 !important;
		font-weight: 400 !important;
	}

	div :global(td.muze-grid-td) {
		border-color: transparent !important;
	}
</style>

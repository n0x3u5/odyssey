<script lang="ts">
	type Muze = typeof import('@viz/muze').default;

	let {
		muze,
		schema,
		data
	}: {
		muze: Muze;
		schema: Array<{ name: string; type: 'dimension' | 'measure' }>;
		data: Array<Array<unknown>>;
	} = $props();

	const env = $derived(muze());
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
	const femaleCanvas = $derived(
		env
			.canvas()
			.data(dm)
			.rows(['Country'])
			.columns(['Neg Effective labour market exit age (female)'])
			.layers([
				{
					mark: 'bar',
					encoding: {
						// color: {
						// 	value: () => '#6366f1'
						// },
						color: 'OECD Average highlight (female)',
						text: 'Effective labour market exit age (female)'
					}
				}
			])
			.config({
				axes: {
					x: { show: false, domain: [-80, 0] },
					y: {
						show: false,
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
						domainRangeMap: {
							False: '#6366f1',
							True: '#16a34a'
						}
					}
				},
				interaction: {
					highlight: {
						sideEffects: {
							tooltip: {
								enabled: false
							}
						}
					},
					select: {
						sideEffects: {
							tooltip: {
								enabled: false
							}
						}
					}
				}
			})
	);

	const maleCanvas = $derived(
		env
			.canvas()
			.data(dm)
			.rows(['Country'])
			.columns(['Effective labour market exit age (male)'])
			.layers([
				{
					mark: 'bar',
					encoding: {
						// color: {
						// 	value: () => '#eab308'
						// },
						color: 'OECD Average highlight (male)',
						text: 'Effective labour market exit age (male)'
					}
				}
			])
			.config({
				rows: {
					headers: {
						show: false,
						fields: {
							Country: {
								show: false
							}
						}
					}
				},
				axes: {
					x: { show: false, domain: [0, 80] },
					y: {
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
						domainRangeMap: {
							False: '#eab308',
							True: '#16a34a'
						}
					}
				},
				interaction: {
					highlight: {
						sideEffects: {
							tooltip: {
								enabled: false
							}
						}
					},
					select: {
						sideEffects: {
							tooltip: {
								enabled: false
							}
						}
					}
				}
			})
	);

	let femaleViz: HTMLDivElement | null = $state(null);
	let maleViz: HTMLDivElement | null = $state(null);

	$effect(() => {
		if (femaleViz) {
			femaleCanvas.mount(femaleViz);
		}

		return () => {
			femaleCanvas.dispose();
		};
	});

	$effect(() => {
		if (maleViz) {
			maleCanvas.mount(maleViz);
		}

		return () => {
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
	}
</style>

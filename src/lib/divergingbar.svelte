<script lang="ts">
	import { untrack } from 'svelte';

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
		new DataModel(loadedData).calculateVariable(
			{ name: 'SUM(Male - Female Diff)', type: 'measure', defAggFn: 'sum' },
			[
				'avg(Effective labour market exit age (female))',
				'avg(Effective labour market exit age (male))'
			],
			(female: number, male: number) => male - female
		)
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.rows(['Region (group)', 'Country'])
			.columns([['SUM(Male - Female Diff)'], ['SUM(Male - Female Diff)']])
			.color('SUM(Male - Female Diff)')
			.config({
				rows: {
					headers: {
						show: false,
						fields: {
							'Region (group)': { show: false },
							Country: { show: false }
						}
					},
					facets: {
						fields: {
							'Region (group)': {
								ordering: {
									type: 'custom',
									values: [
										'Latin America',
										'Oceania',
										'N. America',
										'Europe & Middle East',
										'East Asia'
									]
								}
							}
						}
					}
				},
				axes: {
					x: {
						showAxisName: false
					},
					y: {
						showAxisName: false,
						fields: {
							Country: {
								ordering: {
									type: 'field',
									direction: 'desc',
									field: { name: 'SUM(Male - Female Diff)', aggregation: 'sum' }
								}
							}
						}
					}
				},
				legend: {
					show: false,
					color: {
						domain: [-2, 7],
						range: ['#6366f1', '#d4d4d4', '#eab308'],
						stops: [-2, 0, 7]
					}
				},
				gridLines: {
					zeroLineColor: '#000000'
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

<div class="divergingbar size-full" bind:this={viz}></div>

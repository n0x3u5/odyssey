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
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.rows(['Effective labour market exit age (female)'])
			.columns(['Effective labour market exit age (male)'])
			.color('diff')
			.detail(['Country'])
			.layers([
				{
					mark: 'point',
					encoding: {
						size: { value: () => 8 }
					}
				}
			])
			.config({
				axes: {
					x: {
						domain: [55, 75]
					},
					y: {
						showAxisLine: true,
						domain: [55, 75]
					}
				},
				legend: {
					show: false,
					color: {
						domain: [-2, 7.1],
						step: true,
						range: [
							'rgb(99, 102, 241)',
							'rgb(164, 155, 228)',
							'rgb(212, 212, 212)',
							'rgb(221, 205, 178)',
							'rgb(227, 198, 144)',
							'rgb(231, 192, 110)',
							'rgb(233, 185, 72)',
							'rgb(234, 179, 8)'
						],
						stops: [-2, -0.9, 0.3, 1.4, 2.6, 3.7, 4.9, 6, 7.1]
					}
				},
				gridLines: {
					show: false
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

<div class="scatter size-full" bind:this={viz}></div>

<style>
	div.scatter :global(g.muze-layer-point) {
		fill-opacity: 0.8;
		stroke-width: 2px;
		stroke: #a3a3a3;
	}
</style>

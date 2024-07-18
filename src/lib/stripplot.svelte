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
			.select({
				operator: 'and',
				conditions: [
					{ field: 'Every 5 years T|F', value: 'True', operator: 'eq' },
					{ field: 'Country: OECD Avg ', value: 'OECD average', operator: 'neq' }
				]
			})
			.calculateVariable(
				{ name: 'Country highlight', type: 'dimension' },
				['Country'],
				(country: string) => (country === 'Mexico' ? 'True' : 'False')
			)
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.rows(['Effective labour market exit age'])
			.columns(['Gender', 'Year'])
			.detail(['Country'])
			.color('Country highlight')
			.config({
				axes: {
					x: {
						tickFormat: ({ formattedValue }: { formattedValue: string }) =>
							formattedValue.slice(-4, formattedValue.length)
					},
					y: {
						domain: [50, 80],
						tickFormat: ({ formattedValue }: { formattedValue: string }) =>
							`${formattedValue} years`
					}
				},
				legend: {
					show: false,
					color: {
						domainRangeMap: {
							True: '#2563eb',
							False: '#d4d4d4'
						}
					}
				}
			})
			.layers([
				{
					mark: 'tick'
				}
			]);
	});

	$effect(() => {
		viz;
		untrack(() => canvas.mount(viz));

		return () => {
			canvas.dispose();
		};
	});
</script>

<div class="stripplot size-full" bind:this={viz}></div>

<style>
	div.stripplot :global(g.muze-layer-group g.muze-layer-tick path) {
		stroke-width: 3px;
	}
</style>

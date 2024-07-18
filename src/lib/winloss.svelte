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
		new DataModel(loadedData).select({
			operator: 'and',
			conditions: [
				{
					field: 'Country',
					value: ['Mexico', 'Türkiye', 'Czechia', 'Korea', 'Japan', 'Luxembourg'],
					operator: 'in'
				}
			]
		})
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.columns(['Gender', 'Year'])
			.rows(['Country', 'year_over_year_change'])
			.color('year_over_year_change')
			.config({
				legend: {
					show: false,
					color: {
						domain: [-12, 12],
						step: true,
						stops: 2,
						range: ['#16a34a', '#ef4444']
					}
				}
			})
			.layers([{ mark: 'bar' }]);
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

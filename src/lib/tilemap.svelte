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
	const dm = $derived(new DataModel(loadedData));
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.rows(['UPPER(Gender)', 'Latitude (generated)'])
			.columns([{ field: 'Year Int', as: 'discrete' }, 'Longitude (generated)'])
			.layers([
				{
					mark: 'bar',
					encoding: {
						color: 'Avg. Effective labour market exit age',
						text: 'Code'
					}
				}
			])
			.config({
				autoGroupBy: { disabled: true },
				axes: {
					x: {
						padding: 0.4
					},
					y: {
						padding: 0.4,
						fields: {
							'Latitude (generated)': {
								ordering: {
									type: 'natural',
									direction: 'desc'
								}
							}
						}
					}
				},
				legend: {
					color: {
						stops: 3,
						range: ['#d4d4d4', '#d4d4d4', '#ef4444']
					}
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

<div class="tilemap size-full" bind:this={viz}></div>

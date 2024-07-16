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
	const share = $derived(muze.Operators.share);
	const loadedData = $derived(DataModel.loadDataSync(data, schema));
	const dm = $derived(
		new DataModel(loadedData).select({
			field: 'Year Int',
			value: 2022,
			operator: 'eq'
		})
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.rows(['Country'])
			.columns([
				share(
					'Effective labour market exit age (female)',
					'Effective labour market exit age (male)'
				)
			])
			.layers([
				{
					mark: 'bar',
					encoding: {
						x: 'Effective labour market exit age (female)',
						x0: 'Effective labour market exit age (male)',
						size: { value: () => 8 },
						color: 'OECD Average highlight'
					}
				},
				{
					mark: 'point',
					encoding: {
						x: 'Effective labour market exit age (female)',
						color: { value: () => '#6366f1' },
						text: {
							field: 'Gender',
							formatter: ({ formattedValue }: { formattedValue: string }) => {
								return formattedValue.toUpperCase();
							},
							filter: ({ rowData }: { rowData: { Country: string } }) => {
								return rowData.Country === 'Iceland';
							}
						}
					}
				},
				{
					mark: 'point',
					encoding: {
						x: 'Effective labour market exit age (male)',
						color: { value: () => '#eab308' },
						text: {
							field: 'Gender',
							formatter: ({ formattedValue }: { formattedValue: string }) => {
								return formattedValue.toUpperCase();
							},
							filter: ({ rowData }: { rowData: { Country: string } }) => {
								return rowData.Country === 'Iceland';
							}
						}
					}
				}
			])
			.config({
				rows: { headers: { fields: { Country: { show: false } } } },
				axes: {
					y: {
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
						domainRangeMap: { False: '#d4d4d4', True: '#737373' }
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

<div class="dumbell size-full" bind:this={viz}></div>

<style>
	div.dumbell :global(g.muze-layer-point) {
		fill-opacity: 1;
	}

	div.dumbell :global(g.muze-layer-point) {
		fill-opacity: 1;
	}

	div.dumbell :global(g.muze-layer-labels-group .muze-layer-labels:first-child text) {
		fill: #6366f1 !important;
		font-weight: 700;
	}

	div.dumbell :global(g.muze-layer-labels-group .muze-layer-labels:last-child text) {
		fill: #eab308 !important;
		font-weight: 700;
	}
</style>

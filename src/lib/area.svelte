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
			{ name: 'Exit age group', type: 'dimension' },
			['sum(Effective labour market exit age)'],
			(d: number) => {
				if (d < 60) {
					return 'under 60 years';
				} else if (d >= 60 && d <= 65) {
					return '60-65 years';
				} else {
					return 'above 65 years';
				}
			}
		)
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.columns(['Gender', 'Year'])
			.rows(['Exit age group', 'count(DISTINCT Country)'])
			.config({
				rows: {
					facets: {
						fields: {
							'Exit age group': {
								ordering: {
									type: 'custom',
									values: ['above 65 years', '60-65 years', 'under 60 years']
								}
							}
						}
					}
				},
				axes: {
					y: {
						domain: [0, 50],
						tickFormat: (
							{ rawValue }: { rawValue: number },
							{ context }: { context: { domain: () => [number, number] } }
						) => {
							const [d0, d1] = context.domain();
							const diff = d1 - d0;
							return ((rawValue / diff) * 100).toFixed(0) + '%';
						}
					}
				},
				legend: {
					show: false,
					color: {
						domainRangeMap: {
							'above 65 years': '#dc2626',
							'60-65 years': '#1d4ed8',
							'under 60 years': '#c084fc'
						}
					}
				}
			})
			.color('Exit age group')
			.layers([{ mark: 'area' }]);
	});

	$effect(() => {
		viz;
		untrack(() => canvas.mount(viz));

		return () => {
			canvas.dispose();
		};
	});
</script>

<div class="area size-full" bind:this={viz}></div>

<style>
	div.area :global(g.muze-layer-group g.muze-layer-area) {
		fill-opacity: 0.7;
	}

	div.area :global(.muze-ticks:nth-child(odd)) {
		opacity: 0;
	}
</style>

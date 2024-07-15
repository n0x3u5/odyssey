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
			.calculateVariable(
				{ name: 'Jitter', type: 'measure', defAggFn: 'avg' },
				['__id__', 'Year Int'],
				(index: number) => {
					return index % 50;
				}
			)
			.select({
				operator: 'and',
				conditions: [
					{ field: 'Every 5 years T|F', value: 'True', operator: 'eq' },
					{ field: 'Country: OECD Avg ', value: 'OECD average', operator: 'neq' }
				]
			})
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.rows(['Effective labour market exit age'])
			.columns(['Gender', 'Year', 'Jitter'])
			.detail(['Country'])
			.color('Gender')
			.config({
				legend: { show: false },
				axes: {
					x: {
						compact: true,
						show: false
					},
					y: {
						domain: [50, 80],
						tickFormat: ({
							formattedValue,
							rawValue
						}: {
							formattedValue: string;
							rawValue: number;
						}) => {
							return rawValue % 5 === 0 ? `${formattedValue} years` : '';
						}
					}
				},
				columns: {
					facets: {
						formatter: (
							{ formattedValue }: { formattedValue: string },
							{ fieldName }: { fieldName: string }
						) => {
							if (fieldName === 'Year') {
								return formattedValue.slice(-4, formattedValue.length);
							} else {
								return formattedValue;
							}
						}
					}
				},
				gridLines: {
					show: false
				}
			})
			.layers([
				{
					mark: 'point',
					encoding: {
						size: { value: () => 6 }
					}
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

<div class="boxplot size-full" bind:this={viz}></div>

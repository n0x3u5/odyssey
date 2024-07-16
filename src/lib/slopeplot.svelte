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
			operator: 'or',
			conditions: [
				{ field: 'Year', value: '01-01-2006', operator: 'eq' },
				{ field: 'Year', value: '01-01-2022', operator: 'eq' }
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
			.columns(['Gender', 'Year'])
			.layers([
				{
					mark: 'line',
					encoding: {
						text: {
							field: 'Country',
							formatter: (
								{ formattedValue }: { formattedValue: string },
								{ dataPoint: { dataObj } }: { dataPoint: { dataObj: Record<string, number> } }
							) => `${formattedValue}, ${dataObj['Effective labour market exit age']}`,
							labelPlacement: {
								anchors: ['outside-left', 'outside-right']
							},
							filter: ({
								rowData: { Country, Gender }
							}: {
								rowData: { Country: string; Gender: string };
							}) => {
								if (Gender === 'Female') {
									if (
										Country === 'Mexico' ||
										Country === 'Japan' ||
										Country === 'Spain' ||
										Country === 'Türkiye'
									) {
										return true;
									}
								} else {
									if (
										Country === 'Mexico' ||
										Country === 'Japan' ||
										Country === 'Spain' ||
										Country === 'Luxembourg'
									) {
										return true;
									}
								}
								return false;
							}
						}
					}
				}
			])
			.color('Gender')
			.config({
				legend: { show: false },
				axes: {
					x: {
						tickFormat: ({ formattedValue }: { formattedValue: string }) =>
							formattedValue.slice(-4, formattedValue.length)
					},
					y: {
						tickFormat: () => ''
					}
				}
			})
			.detail(['Country']);
	});

	$effect(() => {
		viz;
		untrack(() => canvas.mount(viz));

		return () => {
			canvas.dispose();
		};
	});
</script>

<div class="slopeplot size-full" bind:this={viz}></div>

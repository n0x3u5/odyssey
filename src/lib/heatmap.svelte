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
					value: 'OECD average',
					operator: 'neq'
				},
				{
					field: 'Gender',
					value: 'Female',
					operator: 'eq'
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
			.rows(['Country'])
			.columns([['Year']])
			.layers([{ mark: 'bar' }])
			.color('Difference_From_OECD_Avg')
			.config({
				rows: { headers: { show: false, fields: { Country: { show: false } } } },
				columns: { headers: { show: false } },
				axes: {
					x: {
						showAxisName: false,
						padding: 0,
						compact: true
					},
					y: {
						showAxisName: false,
						padding: 0,
						fields: {
							Country: {
								ordering: {
									type: 'custom',
									values: [
										'Mexico',
										'Ireland',
										'Spain',
										'Iceland',
										'Switzerland',
										'Norway',
										'Portugal',
										'New Zealand',
										'Poland',
										'Canada',
										'France',
										'Netherlands',
										'United States',
										'Japan',
										'Sweden',
										'Denmark',
										'United Kingdom',
										'Hungary',
										'Australia',
										'Chile',
										'Korea',
										'Greece',
										'Slovenia',
										'Luxembourg',
										'Belgium',
										'Estonia',
										'Finland',
										'Czechia',
										'Italy',
										'Slovak Republic',
										'Türkiye',
										'Costa Rica',
										'Israel',
										'Latvia',
										'Lithuania',
										'Germany',
										'Austria',
										'Colombia'
									]
								}
							}
						}
					}
				},
				legend: {
					position: 'top',
					item: {
						text: {
							formatter: ({
								formattedValue,
								rawValue
							}: {
								formattedValue: string;
								rawValue: number;
							}) => (rawValue < 0 ? `${formattedValue} years` : `+${formattedValue} years`)
						}
					},
					color: {
						domain: [-8, 14],
						range: ['#2563eb', '#d4d4d4', '#dc2626'],
						stops: [-8, 0, 14]
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

<div class="hetmap size-full" bind:this={viz}></div>

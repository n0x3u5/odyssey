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
		new DataModel(loadedData)
			.select({
				operator: 'and',
				conditions: [
					{
						operator: 'or',
						conditions: [
							{
								field: 'Year Int',
								value: 2022,
								operator: 'eq'
							},
							{
								field: 'Year Int',
								value: 1972,
								operator: 'eq'
							}
						]
					},
					{
						field: 'Gender',
						value: 'Female',
						operator: 'eq'
					},
					{
						field: 'Country',
						value: [
							'OECD average',
							'Israel',
							'Lithuania',
							'Germany',
							'Latvia',
							'Costa Rica',
							'Belgium',
							'Austria',
							'Colombia'
						],
						operator: 'nin'
					}
				]
			})
			.calculateVariable(
				{ name: 'Effective labour market exit age - 2022', type: 'measure', defAggFn: 'avg' },
				['Year Int', 'Effective labour market exit age'],
				(yearInt: number, age: number) => {
					return yearInt === 2022 ? age : null;
				}
			)
			.calculateVariable(
				{ name: 'Effective labour market exit age - 1972', type: 'measure', defAggFn: 'avg' },
				['Year Int', 'Effective labour market exit age'],
				(yearInt: number, age: number) => {
					return yearInt === 1972 ? age : null;
				}
			)
			.calculateVariable(
				{ name: '1972 > 2022', type: 'dimension', defAggFn: 'avg' },
				['Country'],
				(country: string) => {
					return country === 'Iceland' ||
						country === 'Mexico' ||
						country === 'Belgium' ||
						country === 'Türkiye' ||
						country === 'New Zealand' ||
						country === 'Ireland' ||
						country === 'Portugal' ||
						country === 'Switzerland' ||
						country === 'Netherlands' ||
						country === 'Denmark' ||
						country === 'Canada' ||
						country === 'United Kingdom' ||
						country === 'Norway' ||
						country === 'France' ||
						country === 'Spain' ||
						country === 'Poland' ||
						country === 'Hungary' ||
						country === 'Greece' ||
						country === 'Slovenia' ||
						country === 'Luxembourg'
						? 'True'
						: 'False';
				}
			)
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.rows(['Country'])
			.columns([
				share('Effective labour market exit age - 2022', 'Effective labour market exit age - 1972')
			])
			.layers([
				{
					mark: 'bar',
					encoding: {
						x: 'Effective labour market exit age - 1972',
						x0: 'Effective labour market exit age - 2022',
						size: {
							value: () => 2
						}
					}
				},
				{
					mark: 'point',
					encoding: {
						x: 'Effective labour market exit age - 2022',
						y: 'Country'
					}
				}
			])
			.config({
				legend: { show: false },
				axes: {
					y: {
						fields: {
							Country: {
								ordering: {
									type: 'field',
									direction: 'desc',
									field: { name: 'Effective labour market exit age - 2022', aggregation: 'avg' }
								}
							}
						}
					}
				}
			})
			.color('1972 > 2022');
	});

	$effect(() => {
		viz;
		untrack(() => canvas.mount(viz));

		return () => {
			canvas.dispose();
		};
	});
</script>

<div class="arrowplot size-full" bind:this={viz}></div>

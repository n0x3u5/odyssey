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
				{ name: 'Small multiples column1', type: 'dimension' },
				['Country'],
				(country: string) => {
					if (
						country === 'OECD average' ||
						country === 'Chile' ||
						country === 'Estonia' ||
						country === 'Hungary' ||
						country === 'Japan' ||
						country === 'Mexico' ||
						country === 'Portugal' ||
						country === 'Switzerland'
					) {
						return '1';
					} else if (
						country === 'Australia' ||
						country === 'Colombia' ||
						country === 'Finland' ||
						country === 'Iceland' ||
						country === 'Korea' ||
						country === 'Netherlands' ||
						country === 'Slovak Republic' ||
						country === 'Türkiye'
					) {
						return '2';
					} else if (
						country === 'Austria' ||
						country === 'Costa Rica' ||
						country === 'France' ||
						country === 'Ireland' ||
						country === 'Latvia' ||
						country === 'New Zealand' ||
						country === 'Slovenia' ||
						country === 'United Kingdom'
					) {
						return '3';
					} else if (
						country === 'Belgium' ||
						country === 'Czechia' ||
						country === 'Germany' ||
						country === 'Israel' ||
						country === 'Lithuania' ||
						country === 'Norway' ||
						country === 'Spain' ||
						country === 'United States'
					) {
						return '4';
					} else if (
						country === 'Canada' ||
						country === 'Denmark' ||
						country === 'Greece' ||
						country === 'Italy' ||
						country === 'Luxembourg' ||
						country === 'Poland' ||
						country === 'Sweden'
					) {
						return '5';
					} else {
						return null;
					}
				}
			)
			.calculateVariable(
				{ name: 'Small multiples row1', type: 'dimension' },
				['Country'],
				(country: string) => {
					if (
						country === 'OECD average' ||
						country === 'Australia' ||
						country === 'Austria' ||
						country === 'Belgium' ||
						country === 'Canada'
					) {
						return '1';
					} else if (
						country === 'Chile' ||
						country === 'Colombia' ||
						country === 'Costa Rica' ||
						country === 'Czechia' ||
						country === 'Denmark'
					) {
						return '2';
					} else if (
						country === 'Estonia' ||
						country === 'Finland' ||
						country === 'France' ||
						country === 'Germany' ||
						country === 'Greece'
					) {
						return '3';
					} else if (
						country === 'Hungary' ||
						country === 'Iceland' ||
						country === 'Ireland' ||
						country === 'Israel' ||
						country === 'Italy'
					) {
						return '4';
					} else if (
						country === 'Japan' ||
						country === 'Korea' ||
						country === 'Latvia' ||
						country === 'Lithuania' ||
						country === 'Luxembourg'
					) {
						return '5';
					} else if (
						country === 'Mexico' ||
						country === 'Netherlands' ||
						country === 'New Zealand' ||
						country === 'Norway' ||
						country === 'Poland'
					) {
						return '6';
					} else if (
						country === 'Portugal' ||
						country === 'Slovak Republic' ||
						country === 'Slovenia' ||
						country === 'Spain' ||
						country === 'Sweden'
					) {
						return '7';
					} else if (
						country === 'Switzerland' ||
						country === 'Türkiye' ||
						country === 'United Kingdom' ||
						country === 'United States'
					) {
						return '8';
					} else {
						return null;
					}
				}
			)
			.calculateVariable(
				{ name: 'Year Temporal', type: 'dimension', subtype: 'temporal', format: '%d-%m-%Y' },
				['Year'],
				(year: string) => year
			)
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.rows([['Small multiples row1', 'Effective labour market exit age'], ['Country name value']])
			.columns(['Small multiples column1', 'Year Temporal'])
			.layers([
				{
					mark: 'line',
					encoding: {
						y: 'Effective labour market exit age',
						x: 'Year Temporal',
						color: 'Gender'
					}
				},
				{
					mark: 'point',
					encoding: {
						y: 'Country name value',
						x: 'Year Temporal',
						text: 'Country',
						size: { value: () => 0 }
					}
				}
			])
			.config({
				rows: {
					facets: {
						show: false
					}
				},
				columns: {
					headers: {
						show: false
					},
					facets: {
						show: false
					}
				},
				legend: {
					show: false
				},
				axes: {
					y: { compact: true, show: false },
					x: { showAxisName: false }
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

<div class="smallmultiples size-full" bind:this={viz}></div>

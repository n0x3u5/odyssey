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
			.select({
				field: 'Gender',
				value: 'Female',
				operator: 'eq'
			})
			.sort([['Table', 'desc']])
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.rows([['Smh Row', 'Effective labour market exit age'], ['Country name value']])
			.columns(['Smh Column', 'Year'])
			.color('Table')
			.detail(['Country'])
			.layers([
				{
					mark: 'line',
					encoding: {
						x: 'Year',
						y: 'Effective labour market exit age'
					}
				},
				{
					mark: 'point',
					encoding: {
						x: 'Year',
						y: 'Country name value',
						text: 'Country',
						size: { value: () => 0 }
					}
				}
			])
			.config({
				rows: { facets: { show: false } },
				columns: { facets: { show: false }, headers: { show: false } },
				axes: { y: { show: false } },
				legend: {
					show: false,
					color: {
						domainRangeMap: {
							'Table 1': '#2563eb',
							'Table 2': '#d4d4d4'
						}
					}
				}
			});
	});

	const onRenderComplete = () => {
		[...document.querySelectorAll('g.muze-layer-line')].map((el) =>
			el.insertAdjacentElement('beforeend', el.children[0])
		);
	};

	$effect(() => {
		canvas.on('afterRendered', onRenderComplete);

		return () => {
			canvas.off('afterRendered', onRenderComplete);
		};
	});

	$effect(() => {
		viz;
		untrack(() => canvas.mount(viz));

		return () => {
			canvas.dispose();
		};
	});
</script>

<div class="smh size-full" bind:this={viz}></div>

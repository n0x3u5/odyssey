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
				operator: 'and',
				conditions: [
					{ field: 'Decades only : T|F', value: 'True', operator: 'eq' },
					{ field: 'Country: OECD Avg ', value: 'OECD average', operator: 'neq' }
				]
			})
			.calculateVariable({ name: 'fiftySeven', type: 'measure', defAggFn: 'avg' }, [], () => 57)
			.calculateVariable({ name: 'twelve', type: 'measure', defAggFn: 'avg' }, [], () => 12)
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.detail(['Country'])
			.rows([['Gender', 'avg(Row (decade year) 2)', 'count(DISTINCT Country)'], ['twelve']])
			.columns([
				[
					'avg(Column (decade year) 2)',
					{ field: 'Effective labour market exit age (bins)', as: 'continuous' }
				],
				['fiftySeven']
			])
			.layers([
				{
					mark: 'bar',
					encoding: {
						x: 'Effective labour market exit age (bins)',
						y: 'count(DISTINCT Country)'
					}
				},
				{
					mark: 'point',
					encoding: {
						x: 'fiftySeven',
						y: 'twelve',
						text: 'avg(Year Int)',
						size: { value: () => 0 }
					}
				}
			])
			.color('Gender')
			.config({
				autoGroupBy: { disabled: true },
				rows: { facets: { show: false } },
				columns: { facets: { show: false }, headers: { show: false } },
				axes: {
					y: { show: false, domain: [0, 13] },
					x: { domain: [54, 80] }
				},
				legend: {
					show: false
				}
			});
	});

	const onAnimationEnd = () => {
		[...document.querySelectorAll('g.muze-layer-bars rect')].map((rect) => {
			const height = rect.getAttribute('height');
			if (height != null) {
				rect.setAttribute('height', `${Math.floor(+height) - 1}`);
			}
		});
	};

	$effect(() => {
		canvas.on('animationEnd', onAnimationEnd);

		return () => {
			canvas.off('animationEnd', onAnimationEnd);
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

<div class="not-prose dotplot size-full" bind:this={viz}></div>

<style>
	div.dotplot :global(g.muze-layer-overlay-path-group path) {
		stroke-width: 2px !important;
	}

	div.dotplot :global(g.muze-layer-point) {
		fill-opacity: 0 !important;
	}

	div.dotplot :global(g.muze-layer-point-labels text) {
		font-weight: bold !important;
		font-size: 1rem !important;
	}
</style>

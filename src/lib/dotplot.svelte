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
				{ field: 'Decades only : T|F', value: 'True', operator: 'eq' },
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
			.detail(['Country'])
			.rows([
				'Gender',
				{ field: 'avg(Row (decade year) 2)', as: 'discrete' },
				'count(DISTINCT Country)'
			])
			.columns([
				{ field: 'avg(Column (decade year) 2)', as: 'discrete' },
				{ field: 'Effective labour market exit age (bins)', as: 'continuous' }
			])
			.layers([
				{
					mark: 'bar'
				}
			])
			.color('Gender')
			.config({
				autoGroupBy: { disabled: true },
				rows: { facets: { show: false } },
				columns: { facets: { show: false }, headers: { show: false } },
				axes: { y: { show: false } },
				legend: {
					show: false
				}
			});
	});

	const onAnimationEnd = () => {
		[...document.querySelectorAll('g.muze-layer-bars rect')].map((rect) => {
			const height = rect.getAttribute('height');
			if (height != null) {
				rect.setAttribute('height', `${Math.floor(+height)}`);
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

<div class="dotplot size-full" bind:this={viz}></div>

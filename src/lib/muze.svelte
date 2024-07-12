<script lang="ts">
	type Muze = typeof import('@viz/muze').default;

	let {
		muze,
		schema,
		data
	}: {
		muze: Muze;
		schema: Array<{ name: string; type: 'dimension' | 'measure' }>;
		data: Array<Array<unknown>>;
	} = $props();

	const env = $derived(muze());
	const DataModel = $derived(muze.DataModel);
	const loadedData = $derived(DataModel.loadDataSync(data, schema));
	const dm = $derived(new DataModel(loadedData));
	const canvas = $derived(env.canvas().data(dm).rows(['Country']).columns(['Obs Value']));

	let mountElement: HTMLDivElement | null = $state(null);

	$effect(() => {
		if (mountElement) {
			canvas.mount(mountElement);
		}
	});
</script>

<div bind:this={mountElement}></div>

<style>
	div {
		width: 900px;
		height: 600px;
	}
</style>

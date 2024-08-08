<script lang="ts">
	import { Lollipop } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

<main
	class="prose m-auto flex size-full max-w-4xl flex-col px-4 pb-0 pt-4 prose-h1:mb-4 prose-p:my-0 prose-p:text-sm prose-strong:font-extrabold"
>
	<h1>
		DIFFERENCE IN EFFECTIVE AGE OF LABOUR MARKET EXIT FROM <span class="underline"
			>OECD AVERAGE</span
		>, 2022
	</h1>
	{#await import('@viz/muze') then { default: muze }}
		<Lollipop {muze} {schema} {data}></Lollipop>
	{/await}
</main>

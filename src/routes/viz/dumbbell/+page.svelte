<script lang="ts">
	import { Dumbbell } from '$lib';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();

	const schema = $derived(pageData.schema);
	const data = $derived(pageData.data);
</script>

<div class="prose m-auto flex size-full max-w-4xl flex-col pt-4">
	<header>
		<h1>
			DIFFERENCE IN THE AGE OF LABOUR MARKET EXIT BETWEEN <span class="text-indigo-500">FEMALE</span
			>
			AND <span class="text-yellow-500">MALE</span>, 2022
		</h1>
	</header>
	<main class="size-full">
		{#await import('@viz/muze') then { default: muze }}
			<Dumbbell {muze} {schema} {data}></Dumbbell>
		{/await}
	</main>
</div>

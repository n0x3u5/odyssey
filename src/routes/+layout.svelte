<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';
	import { IconSpriteSheet } from '$lib';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<title>One Dataset, Eight Muze Visualizations</title>
	<meta
		name="description"
		content="Discover the versatility of Muze with 8 different visualizations answering questions about labour market exits in OECD countries."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:logo" content={`${$page.url.origin}/images/og-home.jpeg`} />
	<meta property="og:url" content={$page.url.toString()} />
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="og:image" content={`${$page.url.origin}/images/og-home.jpeg`} />
	<meta property="og:site_name" content="One Dataset, Eight Muze Visualizations" />
	<meta property="og:title" content="One Dataset, Eight Muze Visualizations" />
	<meta
		property="og:description"
		content="Discover the versatility of Muze with 8 different visualizations answering questions about labour market exits in OECD countries."
	/>
</svelte:head>

<div class="bg-amber-50">
	<IconSpriteSheet />
	{@render children()}
</div>

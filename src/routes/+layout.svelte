<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';
	import { IconSpriteSheet } from '$lib';
	import { browser } from '$app/environment';

	let { children }: { children: Snippet } = $props();

	if (browser) {
		import('@viz/muze');
	}
	import('@viz/datamodel');
</script>

<svelte:head>
	<title>One Dataset, Nineteen Muze Visualizations</title>
	<meta
		name="description"
		content="Discover the versatility of Muze with 19 different visualizations answering questions about labour market exits in OECD countries."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:logo" content={`${$page.url.origin}/images/og-home.png`} />
	<meta property="og:url" content={$page.url.toString()} />
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="og:image" content={`${$page.url.origin}/images/og-home.png`} />
	<meta property="og:site_name" content="One Dataset, Nineteen Muze Visualizations" />
	<meta property="og:title" content="One Dataset, Nineteen Muze Visualizations" />
	<meta
		property="og:description"
		content="Discover the versatility of Muze with 19 different visualizations answering questions about labour market exits in OECD countries."
	/>
	<link
		rel="preload"
		href="https://fonts.gstatic.com/s/sourcesanspro/v11/6xK3dSBYKcSV-LCoeQqfX1RYOo3qOK7lujVj9w.woff2"
		as="font"
		type="font/woff2"
		crossorigin="true"
	/>
</svelte:head>

<div class="bg-amber-50">
	<IconSpriteSheet />
	{@render children()}
</div>

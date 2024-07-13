<script>
	import '../app.css';
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>One Dataset, Twenty Muze Visualizations</title>
	<meta
		property="description"
		content="Discover the versatility of Muze with 20 different visualizations answering questions about labour market exits in OECD countries."
	/>
	<meta property="og:url" content={$page.url.toString()} />
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="og:image" content="/images/og-home.jpeg" />
	<meta property="og:site_name" content="One Dataset, Twenty Muze Visualizations" />
	<meta property="og:title" content="One Dataset, Twenty Muze Visualizations" />
	<meta
		property="og:description"
		content="Discover the versatility of Muze with 20 different visualizations answering questions about labour market exits in OECD countries."
	/>
</svelte:head>
<div class="h-screen w-screen bg-amber-50 p-4">
	<slot></slot>
</div>

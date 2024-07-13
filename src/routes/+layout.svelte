<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	function getImageURL(origin: string) {
		const x = new URL(origin);
		x.pathname = '/images/og-home.jpeg';
		return x.toString();
	}

	$: imageURL = getImageURL($page.url.origin);
</script>

<svelte:head>
	<title>One Dataset, Twenty Muze Visualizations</title>
	<meta
		property="description"
		content="Discover the versatility of Muze with 20 different visualizations answering questions about labour market exits in OECD countries."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:logo" content={imageURL} />
	<meta property="og:url" content={$page.url.toString()} />
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="og:image" content={imageURL} />
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

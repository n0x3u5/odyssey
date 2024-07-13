<script>
	import '../app.css';
	import { page } from '$app/stores';
</script>

<svelte:head>
	<meta property="og:url" content={$page.url.toString()} />
</svelte:head>
<div class="h-screen w-screen bg-amber-50 p-4">
	<slot></slot>
</div>

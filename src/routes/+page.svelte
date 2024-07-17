<script lang="ts">
	const pageInfos = [
		{
			name: 'bar',
			alt: 'Bar Chart'
		},
		{
			name: 'dumbell',
			alt: 'Dumbell'
		},
		{
			name: 'dotplot',
			alt: 'Dot Plot'
		},
		{
			name: 'boxplot',
			alt: 'Box Plot'
		},
		{
			name: 'slopeplot',
			alt: 'Slope Plot'
		},
		{
			name: 'heatmap',
			alt: 'Heatmap'
		},
		{
			name: 'arrowplot',
			alt: 'Lollipop Plot'
		},
		{
			name: 'slopestrip',
			alt: 'Slope and Strip Hybrid'
		},
		{
			name: 'smallmultiples',
			alt: 'Small Multiples'
		},
		{
			name: 'scatter',
			alt: 'Scatter'
		},
		{
			name: 'divergingbar',
			alt: 'Diverging Bar Chart'
		},
		{
			name: 'bivariatearea',
			alt: 'Bivariate Area Chart'
		},
		{
			name: 'area',
			alt: 'Area Chart'
		}
	];
</script>

<main class="min-h-screen p-4">
	<section class="prose m-auto max-w-4xl prose-hr:my-4 prose-hr:border-black">
		<article>
			<div>
				<header>
					<h1>
						<span class="text-yellow-500">ONE</span>
						<br />
						DATASET,
						<br />
						<span class="text-indigo-500">THIRTEEN</span>
						<span class="font-extralight underline"><em>MUZE</em></span>
						<br />
						VISUALIZATIONS
					</h1>
				</header>
				<section>
					<p>
						Here are 13 different visualizations, powered by <strong>Muze</strong>, created from a
						single dataset on labour market exit ages in OECD countries by year. Each chart shows
						the dataset from a different perspective, answering a different question.
					</p>
					<p>
						This series of visualizations is a port of the
						<a class="hover:decoration-double" href="https://public.tableau.com/">Tableau Public</a>
						Story
						<a
							class="hover:decoration-double"
							href="https://public.tableau.com/app/profile/maryia.maziuk/viz/Onedataset20visualizationsRetirementAgesinOECDCountries/Onedataset20visualizations"
						>
							One dataset 20 visualizations | Retirement ages in OECD countries
						</a>
						created by Maryia Maziuk, which was in turn inspired by Nathan Yau’s piece on
						<a class="hover:decoration-double" href="https://flowingdata.com/">FlowingData</a>
						-
						<a
							class="hover:decoration-double"
							href="https://flowingdata.com/2017/01/24/one-dataset-visualized-25-ways/"
						>
							One Dataset, Visualized 25 Ways
						</a>
						.
					</p>
					<p>The dataset has 3 dimensions (country, sex, year) and a single measure (age).</p>
				</section>
			</div>
		</article>
		<hr />
		<nav>
			<aside>
				<p class="text-right">
					<span class="inline-block transition-transform hover:translate-x-1">
						<a href="/bar">
							Go to the first chart
							<svg class="inline size-4 rotate-180 align-text-bottom">
								<use href="#icon-chevron-double-left" />
							</svg>
						</a>
					</span>
				</p>
			</aside>
			<ul>
				{#each pageInfos as { name, alt }}
					<li>
						<a href={`/${name}`}>
							<!-- <img
							{alt}
							class="size-28 rounded border-2 border-gray-200 transition-opacity hover:opacity-80 hover:brightness-105"
							src={`/images/${name}.jpeg`}
						/> -->
							{alt}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
		<hr />
	</section>
	<footer
		class="prose prose-sm m-auto max-w-4xl prose-h2:m-0 prose-h2:text-sm prose-p:m-0 md:flex md:items-center md:gap-48"
	>
		<div>
			<h2>EFFECTIVE AGE OF LABOUR MARKET EXIT</h2>
			<p>
				The average effective age of retirement is defined as the average age of exit from the
				labour force for workers initially aged 40 and over.
			</p>
		</div>
		<div class="h-min text-end md:text-start">
			<p class="text-nowrap">
				Source: OECD Data Explorer
				<br />
				Powered by: Muze
			</p>
		</div>
	</footer>
</main>

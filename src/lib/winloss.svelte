<script lang="ts">
	import { untrack } from 'svelte';
	import type { Canvas, DataModel as TDataModel } from './types';

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
	const html = $derived(muze.Operators.html);
	const loadedData = $derived(DataModel.loadDataSync(data, schema));
	const rootDM = $derived(new DataModel(loadedData));
	const yoyExtent = $derived(rootDM.getField('year_over_year_change').minMax());
	const femaleMexicoDM = $derived(
		rootDM.select({
			operator: 'and',
			conditions: [
				{
					field: 'Country',
					value: 'Mexico',
					operator: 'eq'
				},
				{
					field: 'Gender',
					value: 'Female',
					operator: 'eq'
				}
			]
		})
	);
	const maleMexicoDM = $derived(
		rootDM.select({
			operator: 'and',
			conditions: [
				{
					field: 'Country',
					value: 'Mexico',
					operator: 'eq'
				},
				{
					field: 'Gender',
					value: 'Male',
					operator: 'eq'
				}
			]
		})
	);
	const femaleTurkeyDM = $derived(
		rootDM.select({
			operator: 'and',
			conditions: [
				{
					field: 'Country',
					value: 'Türkiye',
					operator: 'eq'
				},
				{
					field: 'Gender',
					value: 'Female',
					operator: 'eq'
				}
			]
		})
	);
	const maleCzechiaDM = $derived(
		rootDM.select({
			operator: 'and',
			conditions: [
				{
					field: 'Country',
					value: 'Czechia',
					operator: 'eq'
				},
				{
					field: 'Gender',
					value: 'Male',
					operator: 'eq'
				}
			]
		})
	);
	const femaleKoreaDM = $derived(
		rootDM.select({
			operator: 'and',
			conditions: [
				{
					field: 'Country',
					value: 'Korea',
					operator: 'eq'
				},
				{
					field: 'Gender',
					value: 'Female',
					operator: 'eq'
				}
			]
		})
	);
	const maleJapanDM = $derived(
		rootDM.select({
			operator: 'and',
			conditions: [
				{
					field: 'Country',
					value: 'Japan',
					operator: 'eq'
				},
				{
					field: 'Gender',
					value: 'Male',
					operator: 'eq'
				}
			]
		})
	);
	const femaleLuxembourgDM = $derived(
		rootDM.select({
			operator: 'and',
			conditions: [
				{
					field: 'Country',
					value: 'Luxembourg',
					operator: 'eq'
				},
				{
					field: 'Gender',
					value: 'Female',
					operator: 'eq'
				}
			]
		})
	);
	const maleLuxembourgDM = $derived(
		rootDM.select({
			operator: 'and',
			conditions: [
				{
					field: 'Country',
					value: 'Luxembourg',
					operator: 'eq'
				},
				{
					field: 'Gender',
					value: 'Male',
					operator: 'eq'
				}
			]
		})
	);

	const env = $derived(muze());

	const femaleMexicoCanvas = $derived(env.canvas());
	const maleMexicoCanvas = $derived(env.canvas());
	const femaleTurkeyCanvas = $derived(env.canvas());
	const maleCzechiaCanvas = $derived(env.canvas());
	const femaleKoreaCanvas = $derived(env.canvas());
	const maleJapanCanvas = $derived(env.canvas());
	const femaleLuxembourgCanvas = $derived(env.canvas());
	const maleLuxembourgCanvas = $derived(env.canvas());

	let femaleMexicoViz: HTMLDivElement | null = $state(null);
	let maleMexicoViz: HTMLDivElement | null = $state(null);
	let femaleTurkeyViz: HTMLDivElement | null = $state(null);
	let maleCzechiaViz: HTMLDivElement | null = $state(null);
	let femaleKoreaViz: HTMLDivElement | null = $state(null);
	let maleJapanViz: HTMLDivElement | null = $state(null);
	let femaleLuxembourgViz: HTMLDivElement | null = $state(null);
	let maleLuxembourgViz: HTMLDivElement | null = $state(null);

	const updateCanvas = (canvas: Canvas) => {
		canvas
			.columns(['Year'])
			.rows(['year_over_year_change'])
			.color('year_over_year_change')
			.layers([{ mark: 'bar', transition: { disabled: true } }])
			.detail(['Country', 'Gender'])
			.config({
				axes: {
					x: { showAxisName: false },
					y: { show: false, domain: yoyExtent, nice: true }
				},
				columns: { headers: { show: false } },
				legend: {
					show: false,
					color: {
						domain: [-12, 12],
						step: true,
						stops: 2,
						range: ['#16a34a', '#ef4444']
					}
				},
				interaction: {
					tooltip: {
						formatter: ({ dataModel }: { dataModel: TDataModel }) => {
							const year = dataModel.getField('Year Int').data().at(0);
							const yoy = dataModel.getField<number>('year_over_year_change').data().at(0) ?? 0;
							const country = dataModel.getField('Country').data().at(0);
							const gender = dataModel.getField('Gender').data().at(0);
							return html`<div class="flex flex-col gap-2 pb-2 pt-1 font-sans text-xs text-black">
								<div>
									<p class="font-bold">${country}</p>
									<p>${gender}</p>
								</div>
								<div>
									<p>${year}</p>
									<p>
										<span class="font-bold"
											>${yoy > 0 ? `+${yoy.toFixed(1)}` : `${yoy.toFixed(1)}`}</span
										>
										years
									</p>
								</div>
							</div>`;
						}
					}
				}
			});
	};

	$effect(() => {
		updateCanvas(femaleMexicoCanvas.data(femaleMexicoDM));
		updateCanvas(maleMexicoCanvas.data(maleMexicoDM));
		updateCanvas(femaleTurkeyCanvas.data(femaleTurkeyDM));
		updateCanvas(maleCzechiaCanvas.data(maleCzechiaDM));
		updateCanvas(femaleKoreaCanvas.data(femaleKoreaDM));
		updateCanvas(maleJapanCanvas.data(maleJapanDM));
		updateCanvas(femaleLuxembourgCanvas.data(femaleLuxembourgDM));
		updateCanvas(maleLuxembourgCanvas.data(maleLuxembourgDM));
	});

	const onAfterRendered = ({ emitter: canvas }: { emitter: Canvas }) => {
		const canvasEl = canvas.mount();
		const canvasData = canvas.data();
		const country =
			canvasData
				.getField<'Mexico' | 'Türkiye' | 'Czechia' | 'Korea' | 'Japan' | 'Luxembourg'>('Country')
				.data()
				.at(0) ?? 'Mexico';
		const gender = canvasData.getField<'Female' | 'Male'>('Gender').data().at(0) ?? 'Female';

		const isBottomRow = country === 'Korea' || country === 'Japan' || country === 'Luxembourg';
		const align = isBottomRow ? 'right' : 'left';

		const emptyUnit = canvasEl.querySelector(
			'div.muze-grid-center-2 td.muze-grid-td div.muze-unit'
		);

		const annotation = document.createElement('div');
		annotation.classList.add('text-black', 'text-xs', 'font-sans');
		if (align === 'right') {
			annotation.classList.add('text-right');
		}
		annotation.style.position = 'absolute';
		annotation.style.top = isBottomRow ? '25%' : '20%';
		annotation.style[align] = '8px';

		if (!isBottomRow) {
			const line1 = document.createElement('p');
			line1.textContent = 'from';
			annotation.appendChild(line1);
		}

		const line2 = document.createElement('p');
		const pre = document.createTextNode(isBottomRow ? 'to ' : '');
		const value = document.createElement('span');
		value.classList.add('font-bold');
		if (country === 'Mexico') {
			if (gender === 'Female') {
				value.textContent = '78.3';
			} else {
				value.textContent = '75.7';
			}
		} else if (country === 'Luxembourg') {
			if (gender === 'Female') {
				value.textContent = '58.4';
			} else {
				value.textContent = '60.5';
			}
		} else if (country === 'Türkiye') {
			value.textContent = '56.6';
		} else if (country === 'Czechia') {
			value.textContent = '62.1';
		} else if (country === 'Korea') {
			value.textContent = '67.4';
		} else {
			value.textContent = '68.3';
		}
		const post = document.createTextNode(' years');
		line2.appendChild(pre);
		line2.appendChild(value);
		line2.appendChild(post);

		const line3 = document.createElement('p');
		line3.textContent = 'in 1972';

		annotation.appendChild(line2);
		annotation.appendChild(line3);

		emptyUnit?.appendChild(annotation);
	};

	$effect(() => {
		femaleMexicoCanvas.on('afterRendered', onAfterRendered);
		maleMexicoCanvas.on('afterRendered', onAfterRendered);
		femaleTurkeyCanvas.on('afterRendered', onAfterRendered);
		maleCzechiaCanvas.on('afterRendered', onAfterRendered);
		femaleKoreaCanvas.on('afterRendered', onAfterRendered);
		maleJapanCanvas.on('afterRendered', onAfterRendered);
		femaleLuxembourgCanvas.on('afterRendered', onAfterRendered);
		maleLuxembourgCanvas.on('afterRendered', onAfterRendered);

		return () => {
			femaleMexicoCanvas.off('afterRendered', onAfterRendered);
			maleMexicoCanvas.off('afterRendered', onAfterRendered);
			femaleTurkeyCanvas.off('afterRendered', onAfterRendered);
			maleCzechiaCanvas.off('afterRendered', onAfterRendered);
			femaleKoreaCanvas.off('afterRendered', onAfterRendered);
			maleJapanCanvas.off('afterRendered', onAfterRendered);
			femaleLuxembourgCanvas.off('afterRendered', onAfterRendered);
			maleLuxembourgCanvas.off('afterRendered', onAfterRendered);
		};
	});

	$effect(() => {
		femaleMexicoViz;
		maleMexicoViz;
		femaleTurkeyViz;
		maleCzechiaViz;
		femaleKoreaViz;
		maleJapanViz;
		femaleLuxembourgViz;
		maleLuxembourgViz;

		untrack(() => femaleMexicoCanvas.mount(femaleMexicoViz));
		untrack(() => maleMexicoCanvas.mount(maleMexicoViz));
		untrack(() => femaleTurkeyCanvas.mount(femaleTurkeyViz));
		untrack(() => maleCzechiaCanvas.mount(maleCzechiaViz));
		untrack(() => femaleKoreaCanvas.mount(femaleKoreaViz));
		untrack(() => maleJapanCanvas.mount(maleJapanViz));
		untrack(() => femaleLuxembourgCanvas.mount(femaleLuxembourgViz));
		untrack(() => maleLuxembourgCanvas.mount(maleLuxembourgViz));

		return () => {
			femaleMexicoCanvas.dispose();
			maleMexicoCanvas.dispose();
			femaleTurkeyCanvas.dispose();
			maleCzechiaCanvas.dispose();
			femaleKoreaCanvas.dispose();
			maleJapanCanvas.dispose();
			femaleLuxembourgCanvas.dispose();
			maleLuxembourgCanvas.dispose();
		};
	});
</script>

<div class="grid grow grid-cols-2 grid-rows-2">
	<div class="flex flex-col">
		<h2>MAX IN 1972 → DECREASED BY 2022</h2>
		<div class="grid grow grid-cols-2">
			<div class="flex flex-col">
				<h3>FOR FEMALE: MEXICO</h3>
				<div class="not-prose winloss grow" bind:this={femaleMexicoViz}></div>
			</div>
			<div class="flex flex-col">
				<h3>FOR MALE: MEXICO</h3>
				<div class="not-prose winloss grow" bind:this={maleMexicoViz}></div>
			</div>
		</div>
	</div>
	<div class="flex flex-col">
		<h2>MIN IN 1972 → INCREASED BY 2022</h2>
		<div class="grid grow grid-cols-2">
			<div class="flex flex-col">
				<h3>FOR FEMALE: TÜRKIYE</h3>
				<div class="not-prose winloss grow" bind:this={femaleTurkeyViz}></div>
			</div>
			<div class="flex flex-col">
				<h3>FOR MALE: CZECHIA</h3>
				<div class="not-prose winloss grow" bind:this={maleCzechiaViz}></div>
			</div>
		</div>
	</div>
	<div class="flex flex-col">
		<h2>BECAME MAX IN 2022</h2>
		<div class="grid grow grid-cols-2">
			<div class="flex flex-col">
				<h3>FOR FEMALE: KOREA</h3>
				<div class="not-prose winloss grow" bind:this={femaleKoreaViz}></div>
			</div>
			<div class="flex flex-col">
				<h3>FOR MALE: JAPAN</h3>
				<div class="not-prose winloss grow" bind:this={maleJapanViz}></div>
			</div>
		</div>
	</div>
	<div class="flex flex-col">
		<h2>BECAME MIN IN 2022</h2>
		<div class="grid grow grid-cols-2">
			<div class="flex flex-col">
				<h3>FOR FEMALE: LUXEMBOURG</h3>
				<div class="not-prose winloss grow" bind:this={femaleLuxembourgViz}></div>
			</div>
			<div class="flex flex-col">
				<h3>FOR MALE: LUXEMBOURG</h3>
				<div class="not-prose winloss grow" bind:this={maleLuxembourgViz}></div>
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	div.winloss :global(g.muze-ticks text) {
		@apply !fill-black;
		@apply !translate-y-1;
	}

	div.winloss :global(line.muze-tick-lines) {
		@apply !stroke-black;
	}

	div.winloss :global(div.muze-grid-center-2 td.muze-grid-td) {
		@apply !border;
		@apply !border-b-black;
		@apply !border-dotted;
	}

	div.winloss :global(g.muze-axis-grid-lines-y:not(g.muze-axis-zero-line):has(> path)) {
		@apply !stroke-transparent;
	}
</style>

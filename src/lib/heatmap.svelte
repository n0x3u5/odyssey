<script lang="ts">
	import { untrack } from 'svelte';
	import type { DataModel as TDataModel } from './types';

	type Muze = typeof import('@viz/muze').default;

	let {
		muze,
		schema = [],
		data = [[]],
		selectedGender = 'Female'
	}: {
		muze: Muze;
		schema: Array<{ name: string; type: 'dimension' | 'measure' }>;
		data: Array<Array<unknown>>;
		selectedGender: string;
	} = $props();

	const DataModel = $derived(muze.DataModel);
	const html = $derived(muze.Operators.html);
	const loadedData = $derived(DataModel.loadDataSync(data, schema));
	const rootDM = $derived(
		new DataModel(loadedData).select({
			field: 'Country',
			value: 'OECD average',
			operator: 'neq'
		})
	);
	const dm = $derived(
		rootDM.select({
			field: 'Gender',
			value: selectedGender,
			operator: 'eq'
		})
	);
	const env = $derived(muze());
	const canvas = $derived(env.canvas());

	let viz: HTMLDivElement | null = $state(null);

	$effect(() => {
		canvas
			.data(dm)
			.rows(['Country'])
			.columns([['Year']])
			.detail(['Gender'])
			.layers([{ mark: 'bar', transition: { disabled: true } }])
			.color('difference_from_oecd_avg')
			.config({
				theme: {
					font: {
						fontSize: '8px'
					}
				},
				rows: { headers: { show: false, fields: { Country: { show: false } } } },
				columns: { headers: { show: false } },
				axes: {
					x: {
						showAxisName: false,
						showAxisLine: false,
						padding: 0,
						compact: true
					},
					y: {
						showAxisName: false,
						compact: true,
						padding: 0,
						fields: {
							Country: {
								ordering: {
									type: 'custom',
									values: [
										'Mexico',
										'Ireland',
										'Spain',
										'Iceland',
										'Switzerland',
										'Norway',
										'Portugal',
										'New Zealand',
										'Poland',
										'Canada',
										'France',
										'Netherlands',
										'United States',
										'Japan',
										'Sweden',
										'Denmark',
										'United Kingdom',
										'Hungary',
										'Australia',
										'Chile',
										'Korea',
										'Greece',
										'Slovenia',
										'Luxembourg',
										'Belgium',
										'Estonia',
										'Finland',
										'Czechia',
										'Italy',
										'Slovak Republic',
										'Türkiye',
										'Costa Rica',
										'Israel',
										'Latvia',
										'Lithuania',
										'Germany',
										'Austria',
										'Colombia'
									]
								}
							}
						}
					}
				},
				legend: {
					position: 'top',
					item: {
						text: {
							formatter: ({
								formattedValue,
								rawValue
							}: {
								formattedValue: string;
								rawValue: number;
							}) => (rawValue < 0 ? `${formattedValue} years` : `+${formattedValue} years`)
						}
					},
					color: {
						domain: selectedGender === 'Female' ? [-8, 14] : [-6, 12],
						range: ['#2563eb', '#d4d4d4', '#dc2626'],
						stops: selectedGender === 'Female' ? [-8, 0, 14] : [-6, 0, 12]
					}
				},
				interaction: {
					tooltip: {
						formatter: ({ dataModel }: { dataModel: TDataModel }) => {
							const gender = dataModel.getField('Gender').data().at(0);
							const country = dataModel.getField('Country').data().at(0);
							const year = new Date(
								dataModel.getField<number>('Year').data().at(0) ?? 0
							).getFullYear();
							const diff = dataModel.getField<number>('difference_from_oecd_avg').data().at(0) ?? 0;
							const exitAge = dataModel.getField<number>('avg_oecd_exit_age').data().at(0) ?? 0;

							return html`<div class="flex flex-col gap-2 px-1 pb-2 pt-1 text-black">
								<div>
									<p><span class="font-bold">${country}</span>, ${year}</p>
									<p class="uppercase">${gender}</p>
								</div>
								<div>
									<p>Diff. from OECD average:</p>
									<p>
										<span class="font-bold">
											${diff > 0
												? `+${diff.toFixed(1)}`
												: diff < 0
													? `-${diff.toFixed(1)}`
													: `${diff.toFixed(1)}`}
										</span>
										years
									</p>
								</div>
								<hr class="border-dashed border-black" />
								<div>
									<p>Labour market exit age:</p>
									<p><span class="font-bold">${(exitAge + diff).toFixed(1)}</span> years</p>
								</div>
								<div>
									<p>OECD average:</p>
									<p><span class="font-bold">${exitAge.toFixed(1)}</span> years</p>
								</div>
							</div>`;
						}
					}
				}
			});
	});

	$effect(() => {
		canvas.on('afterRendered', () => {
			const legendTitle = document.querySelector('div.muze-legend-title');

			if (legendTitle != null) {
				document
					.querySelector('div.muze-legend-body')
					?.insertAdjacentElement('afterbegin', legendTitle);
			}
			document.querySelector('svg.muze-gradient')?.setAttribute('width', '300px');
			document.querySelector('svg.muze-gradient rect')?.setAttribute('width', '300px');
		});
	});

	$effect(() => {
		viz;
		untrack(() => canvas.mount(viz));

		return () => {
			canvas.dispose();
		};
	});
</script>

<div class="not-prose heatmap grow" bind:this={viz}></div>

<style>
	div.heatmap :global(div.null) {
		height: unset !important;
		top: -1rem !important;
	}

	div.heatmap :global(div.muze-top-legend-container) {
		height: unset !important;
	}

	div.heatmap :global(div.muze-legend-box) {
		justify-content: end !important;
	}

	div.heatmap :global(div.muze-legend-title) {
		width: unset !important;
		font-weight: normal !important;
		color: #000000 !important;
	}

	div.heatmap :global(div.muze-legend-body) {
		align-items: center !important;
		padding-right: 1rem !important;
		flex: 0 1 auto !important;
		width: max-content !important;
		gap: 0.25rem;
	}

	div.heatmap :global(text.muze-ticks) {
		font-size: 0.75rem !important;
	}
</style>

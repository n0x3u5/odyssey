import type { LayoutLoad } from './$types';

const pageInfos = [
	{
		name: '',
		alt: 'Home'
	},
	{
		name: 'bar',
		alt: 'Bar Chart'
	},
	{
		name: 'dumbbell',
		alt: 'Dumbbell Chart'
	},
	{
		name: 'dotplot',
		alt: 'Dot Plot'
	},
	{
		name: 'highlightdotplot',
		alt: 'Highlight Dot Plot'
	},
	{
		name: 'boxplot',
		alt: 'Box Plot'
	},
	{
		name: 'stripplot',
		alt: 'Strip Plot'
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
		alt: 'Arrow Plot'
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
		name: 'highlightsmallmultiples',
		alt: 'Highlight Small Multiples'
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
	},
	{
		name: 'winloss',
		alt: 'Win-Loss Chart'
	},
	{
		name: 'lollipop',
		alt: 'Lollipop Plot'
	},
	{
		name: 'tilemap',
		alt: 'Tile Map'
	}
];

const load: LayoutLoad = ({ url }) => {
	const pageId = url.pathname.split('/').at(-1);
	const currentPageInfoIdx = pageInfos.findIndex((pageInfo) => pageInfo.name === pageId);
	const nextPageInfoIdx = (currentPageInfoIdx + 1) % pageInfos.length;
	const prevPageInfoIdx = (currentPageInfoIdx - 1 + pageInfos.length) % pageInfos.length;

	return {
		pageInfos: pageInfos.slice(1),
		currentPageInfo: pageInfos.at(currentPageInfoIdx) ?? pageInfos[0],
		nextPageInfo: pageInfos.at(nextPageInfoIdx) ?? pageInfos[0],
		prevPageInfo: pageInfos.at(prevPageInfoIdx) ?? pageInfos[0]
	};
};

export { load };

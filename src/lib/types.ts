type Canvas = {
	data: (data: unknown) => Canvas;
	rows: (rows: Array<string> | Array<Array<string>>) => Canvas;
	columns: (
		columns:
			| Array<string | { field: string; as: 'discrete' | 'continuous' }>
			| Array<Array<string | { field: string; as: 'discrete' | 'continuous' }>>
	) => Canvas;
	layers: (layers: Array<unknown>) => Canvas;
	config: (config: Record<string, unknown>) => Canvas;
	yAxes: () => Array<{ mount: () => SVGSVGElement }>;
	color: (color: string) => Canvas;
	detail: (detail: Array<string>) => Canvas;
	composition: () => {
		visualGroup: {
			placeholderInfo: () => {
				values: Array<
					Array<{
						source: () => {
							_graphics: { rootSvg: { node: () => SVGSVGElement } };
							layers: () => Array<{
								mount: () => SVGGElement;
								_points: Array<Array<{ data: Record<string, number> }>>;
								axes: () => {
									x: { scale: () => { range: () => [number, number] } };
									y: { scale: () => (domainValue: number | undefined) => number };
								};
							}>;
							_gridLines: Array<{ mount: () => SVGGElement }>;
						};
					}>
				>;
			};
		};
	};
};

type DataModel = {
	getField: <T>(fieldName: string) => { data: () => Array<T>; minMax: () => [number, number] };
	select: (criteria: { field: string; value: unknown; operator: 'eq' }) => DataModel;
	sort: (fields: Array<[string, 'asc' | 'desc']>) => DataModel;
	calculateVariable: (
		{
			name,
			type,
			defAggFn
		}: { name: string; type: 'measure' | 'dimension'; defAggFn?: 'sum' | 'avg' },
		fields: Array<string>,
		fn: (...args: Array<unknown>) => unknown
	) => DataModel;
};

export type { Canvas, DataModel };

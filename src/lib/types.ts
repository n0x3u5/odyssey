type SelectCriteria = { field: string; value: unknown; operator: 'eq' };

interface DataModel {
	getField<T>(fieldName: string): { data: () => Array<T>; minMax: () => [number, number] };
	select(criteria: SelectCriteria): DataModel;
	select(conditions: { conditions: Array<SelectCriteria>; operator: 'and' }): DataModel;
	sort(fields: Array<[string, 'asc' | 'desc']>): DataModel;
	calculateVariable(
		{
			name,
			type,
			defAggFn
		}: { name: string; type: 'measure' | 'dimension'; defAggFn?: 'sum' | 'avg' },
		fields: Array<string>,
		fn: (...args: Array<unknown>) => unknown
	): DataModel;
}

type Layer = {
	mount: () => SVGGElement;
	_points: Array<Array<{ data: Record<string, number> }>>;
	data: () => DataModel;
	axes: () => {
		x: { scale: () => { range: () => [number, number] } };
		y: { scale: () => (domainValue: number | undefined) => number };
	};
};

interface Canvas {
	data(data: unknown): Canvas;
	rows(rows: Array<string> | Array<Array<string>>): Canvas;
	columns(
		columns:
			| Array<string | { field: string; as: 'discrete' | 'continuous' }>
			| Array<Array<string | { field: string; as: 'discrete' | 'continuous' }>>
	): Canvas;
	layers(layers: Array<unknown>): Canvas;
	title(title: string, options: { align: 'left' }): Canvas;
	config(config: Record<string, unknown>): Canvas;
	yAxes(): Array<{ mount: () => SVGSVGElement }>;
	xAxes(): Array<{ mount: () => SVGSVGElement; domain: () => [number, number] }>;
	color(color: string): Canvas;
	detail(detail: Array<string>): Canvas;
	mount(): HTMLDivElement;
	mount(element: HTMLDivElement): Canvas;
	once(eventName: string, callback: () => void): Canvas;
	composition(): {
		visualGroup: {
			placeholderInfo: () => {
				values: Array<
					Array<{
						source: () => {
							_graphics: { rootSvg?: { node: () => SVGSVGElement } };
							layers: () => Array<Layer>;
							_gridLines: Array<{ mount: () => SVGGElement }>;
						};
					}>
				>;
			};
		};
	};
}

export type { Canvas, DataModel, Layer };

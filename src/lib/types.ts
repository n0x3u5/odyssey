type Canvas = {
	data: (data: unknown) => Canvas;
	rows: (rows: Array<string>) => Canvas;
	columns: (columns: Array<string>) => Canvas;
	layers: (layers: Array<unknown>) => Canvas;
	config: (config: Record<string, unknown>) => Canvas;
	yAxes: () => Array<{ mount: () => SVGSVGElement }>;
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

export type { Canvas };

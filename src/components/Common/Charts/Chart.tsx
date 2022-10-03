import React, { createContext, useContext, useMemo } from 'react';
import { scaleLinear, NumberLike } from '@visx/scale';
import {
  curveLinear,
  curveStep,
  curveStepAfter,
  curveStepBefore,
  curveNatural,
  curveBasis,
  curveMonotoneX,
} from '@visx/curve';
import { TickFormatter } from '@visx/axis';
import { CurveFactory } from 'd3-shape';
import { BaseDataPoint, ProvidedChartProps } from './ChartPropProvider';

export type ChartColorStyles = {
  [key: string]: {
    stroke: string; // stroke color
    fillPrimary: string; // gradient 'to' color
    fillSecondary?: string; // gradient 'from' color
    strokeWidth?: number;
  };
};

type GraphDataPoint<T extends BaseDataPoint> = {
  value: number;
};

const CURVES = {
  linear: curveLinear,
  step: curveStep,
  stepAfter: curveStepAfter,
  stepBefore: curveStepBefore,
  natural: curveNatural,
  basis: curveBasis,
  monotoneX: curveMonotoneX,
};

export type Scale = {
  xScale: ReturnType<typeof scaleLinear>;
  yScale: ReturnType<typeof scaleLinear>;
};

export type DataRegion = {
  yTop: number;
  yBottom: number;
};

export type ChartProps<T extends BaseDataPoint> = {
  series: T[][];
  curve?: CurveFactory | keyof typeof CURVES;
  isTWAP?: boolean;
  onCursor?: (d: BaseDataPoint[]) => void;
  children?: (
    props: GraphProps<T> & {
      scales: Scale[];
      dataRegion: DataRegion;
    }
  ) => React.ReactElement | null;
  yTickFormat?: TickFormatter<NumberLike>;
  stackedArea?: boolean;
};

type GraphProps<T extends BaseDataPoint> = {
  // eslint-disable-next-line react/no-unused-prop-types
  width: number;
  // eslint-disable-next-line react/no-unused-prop-types
  height: number;
} & ChartProps<T> &
  ProvidedChartProps<T>;

type BaseProviderProps<T extends BaseDataPoint> = ChartProps<T> & {
  stackedArea?: boolean;
} & GraphProps<T>;

type ChartControllerProps<T extends BaseDataPoint> = ChartProps<T> &
  ProvidedChartProps<T> &
  GraphProps<T>;

function useChartController<T extends BaseDataPoint>({
  series,
  curve: _curve,
  width,
  height,
  isTWAP,
  onCursor,
  children: _children,
  yTickFormat,
  accessors,
  utils,
  common,
  stackedArea,
}: ChartControllerProps<T>) {
  const curve = useMemo(() => {
    if (!_curve) return scaleLinear;
    if (typeof _curve === 'string') return CURVES[_curve];
    return _curve;
  }, [_curve]);

  const seriesInput = useMemo(() => series, [series]);

  const scales = useMemo(() => {
    const { generateScale } = utils;
    return generateScale(seriesInput, height, width, stackedArea, isTWAP);
  }, [height, isTWAP, seriesInput, stackedArea, utils, width]);

  return { scales, curve, series: seriesInput };
}

const ChartContext = createContext<
  ReturnType<typeof useChartController> | undefined
>(undefined);

const ChartProvider = <T extends BaseDataPoint>({
  children,
  props,
}: {
  children: React.ReactNode;
  props: ChartControllerProps<T>;
}) => (
  <ChartContext.Provider value={useChartController({ ...props })}>
    {children}
  </ChartContext.Provider>
);

const useChart = () => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error('No ChartContext.Provider found when calling useChart.');
  }
  return useMemo(() => context, [context]);
};

type ChartContainerProps<T extends BaseDataPoint> = GraphProps<T> & {
  children: React.ReactNode;
};
function ChartContainer<T extends BaseDataPoint>(
  props: ChartContainerProps<T>
) {
  return <ChartProvider props={props}>{props.children}</ChartProvider>;
}

// Graph.Axes = function GraphAxes() {};

// function Chart<T extends BaseDataPoint>({
//   chartProps,
//   children,
// }: {
//   chartProps: ChartProps<T>;
//   children: React.ReactNode;
// }) {
//   return (
//     <ChartPropProvider<T>>
//       {({ ...chartProviderProps }) => (
//         <ParentSize debounceTime={50}>
//           {({ width: _width, height: _height }) => (
//             <ChartContainer
//               height={_height}
//               width={_width}
//               {...chartProps}
//               {...chartProviderProps}
//             />
//           )}
//         </ParentSize>
//       )}
//     </ChartPropProvider>
//   );
// }

// // return (
//   <ChartPropProvider>
//     {({ ...providerProps }) => (
//       <ParentSize debounceTime={50}>
//         {({ width: _width, height: _height }) => (
//           <div>sup</div>
//         )}
//       </ParentSize>
//     )}
//   </ChartPropProvider>
// )

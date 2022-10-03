import React, { useCallback, useMemo } from 'react';
import { Series } from 'd3-shape';
import { bisector, extent, min, max } from 'd3-array';
import { SeriesPoint } from '@visx/shape/lib/types';
import { scaleLinear, scaleTime } from '@visx/scale';
import { ScaleLinear, ScaleTime } from 'd3-scale';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import { DataPoint } from './LineChart';
import { ChartMultiStyles } from './MultiStackedAreaChart';

// shared parameters across stacked area and line charts
const margin = {
  top: 10,
  bottom: 9,
  left: 0,
  right: 0,
};
const strokeBuffer = 2;
const axisHeight = 21;
const backgroundColor = '#da7cff';
const labelColor = '#340098';
const tickLabelColor = BeanstalkPalette.lightGrey;
const axisColor = BeanstalkPalette.lightGrey;
const yAxisWidth = 57;

// default strokes & styles
const defaultChartStyles: ChartMultiStyles = {
  'chart-green': {
    stroke: BeanstalkPalette.logoGreen,
    fillPrimary: BeanstalkPalette.lightGreen,
  },
  'chart-blue': {
    stroke: BeanstalkPalette.darkBlue,
    fillPrimary: BeanstalkPalette.lightBlue,
  },
  'chart-grey': {
    stroke: BeanstalkPalette.grey,
    fillPrimary: BeanstalkPalette.lightGrey,
    strokeWidth: 0.5,
  },
};

const xTickLabelProps = () =>
  ({
    fill: tickLabelColor,
    fontSize: 12,
    fontFamily: 'Futura PT',
    textAnchor: 'middle',
  } as const);

const yTickLabelProps = () =>
  ({
    fill: tickLabelColor,
    fontSize: 12,
    fontFamily: 'Futura PT',
    textAnchor: 'end',
  } as const);

// types
export type BaseDataPoint = { [key: string]: number } & Omit<
  DataPoint,
  'value'
>;
type ChartSharedValuesProps = {
  strokeBuffer: number;
  margin: { top: number; bottom: number; left: number; right: number };
  axisColor: string;
  axisHeight: number;
  backgroundColor: string;
  labelColor: string;
  tickLabelColor: string;
  yAxisWidth: number;
  defaultChartStyles: ChartMultiStyles;
  yTickLabelProps: typeof yTickLabelProps;
  xTickLabelProps: typeof xTickLabelProps;
};

type ChartAccessorProps = {
  // accessors
  getX: (d: BaseDataPoint) => number;
  getD: (d: BaseDataPoint) => Date;
  getY: (d: BaseDataPoint) => number;
  getY0: (d: SeriesPoint<BaseDataPoint>) => number;
  getY1: (d: SeriesPoint<BaseDataPoint>) => number;
  getYMin: (d: BaseDataPoint) => number;
  getYMax: (d: BaseDataPoint) => number;
  bisectSeason: (
    array: ArrayLike<BaseDataPoint>,
    x: number,
    lo?: number | undefined,
    hi?: number | undefined
  ) => number;
};

type UtilProps = {
  generatePathFromStack: <K extends keyof BaseDataPoint>(
    data: Series<BaseDataPoint, K>
  ) => BaseDataPoint[];
  generateScale: (
    seriesData: BaseDataPoint[][],
    height: number,
    width: number,
    stackedArea?: boolean,
    isTWAP?: boolean
  ) => {
    xScale: ScaleLinear<number, number, never>;
    dScale: ScaleTime<number, number, never>;
    yScale: ScaleLinear<number, number, never>;
  }[];
};

export type ProvidedChartProps = {
  common: ChartSharedValuesProps;
  accessors: ChartAccessorProps;
  utils: UtilProps;
};

type ChartPropProviderProps = {
  children: (props: ProvidedChartProps) => React.ReactNode;
};

export default function ChartPropProvider({
  children,
}: ChartPropProviderProps) {
  const common = useMemo(
    () => ({
      strokeBuffer,
      margin,
      axisHeight,
      backgroundColor,
      labelColor,
      axisColor,
      tickLabelColor,
      yAxisWidth,
      defaultChartStyles,
      xTickLabelProps,
      yTickLabelProps,
    }),
    []
  );
  // chart data acessors
  const accessors = useMemo(() => {
    const bisectSeason = bisector<BaseDataPoint, number>((d) => d.season).left;
    const getX = (d: BaseDataPoint) => d.season;
    const getY = (d: BaseDataPoint) => d.value;
    const getD = (d: BaseDataPoint) => d.date;
    const getY0 = (d: SeriesPoint<BaseDataPoint>) => {
      const d0 = d[0];
      return !d0 || Number.isNaN(d0) || !Number.isFinite(d0) ? 0 : d0;
    };
    const getY1 = (d: SeriesPoint<BaseDataPoint>) => {
      const d1 = d[1];
      return !d1 || Number.isNaN(d1) || !Number.isFinite(d1) ? 0 : d1;
    };
    const baseDataPoint = {
      season: true,
      date: true,
      timestamp: true,
    } as const;
    // get min of T for stacked area chart scales
    const getYMin = (d: BaseDataPoint) =>
      Object.entries(d).reduce((acc, [k, v]) => {
        if (k in baseDataPoint) return acc;
        return Math.min(acc, v as number);
      }, 0);
    // get max of T for stacked area chart scales
    const getYMax = (d: BaseDataPoint) =>
      Object.entries(d).reduce((acc, [k, v]) => {
        if (k in baseDataPoint) return acc;
        acc += v as number;
        return acc;
      }, 0);
    return {
      getX,
      getY,
      getD,
      getY0,
      getY1,
      bisectSeason,
      getYMin,
      getYMax,
    };
  }, []);

  const generateScale = useCallback(
    (
      seriesData: BaseDataPoint[][],
      height: number,
      width: number,
      stackedArea?: boolean,
      isTWAP?: boolean
    ) => {
      const { getYMin, getYMax, getX, getD, getY } = accessors;
      return seriesData.map((data) => {
        // generate yScale
        const xDomain = extent(data, getX) as [number, number];
        const xScale = scaleLinear<number>({ domain: xDomain });

        // generate dScale (only for non-stacked Area charts)
        const dScale = scaleTime() as ScaleTime<number, number, never>;
        if (!stackedArea) {
          dScale.domain(extent(data, getD) as [Date, Date]);
          dScale.range(xDomain);
        }

        // generate yScale
        let yScale;

        // if stacked area, get min and max of Y of T instead of T['value']
        const [y1, y2] = stackedArea ? [getYMin, getYMax] : [getY, getY];

        if (isTWAP) {
          const yMin = min(data, y1);
          const yMax = max(data, y2);
          const biggestDifference = Math.max(
            Math.abs(1 - (yMin as number)),
            Math.abs(1 - (yMax as number))
          );
          yScale = scaleLinear<number>({
            domain: [1 - biggestDifference, 1 + biggestDifference],
          });
        } else {
          yScale = scaleLinear<number>({
            clamp: !!stackedArea,
            domain: [
              0.95 * (min(data, y1) as number),
              1.05 * (max(data, y2) as number),
            ],
          });
        }

        // Set range for xScale
        xScale.range([0, width - yAxisWidth]);

        // Set range for yScale
        yScale.range([
          height - axisHeight - margin.bottom - strokeBuffer, // bottom edge
          margin.top,
        ]);

        return { xScale, dScale, yScale };
      });
    },
    [accessors]
  );

  const utils = useMemo(() => {
    const generatePathFromStack = <K extends keyof BaseDataPoint>(
      data: Series<BaseDataPoint, K>
    ) =>
      data.map((_stack: SeriesPoint<BaseDataPoint>) => ({
        season: _stack.data.season,
        date: _stack.data.date,
        value: accessors.getY1(_stack) ?? 0,
      })) as unknown as BaseDataPoint[];

    return { generatePathFromStack, generateScale };
  }, [accessors, generateScale]);

  return (
    <>
      {children({
        common,
        accessors,
        utils,
      })}
    </>
  );
}

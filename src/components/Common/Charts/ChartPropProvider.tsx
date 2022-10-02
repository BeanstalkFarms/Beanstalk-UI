import React, { useCallback, useMemo } from 'react';

import { bisector, extent, min, max } from 'd3-array';
import { SeriesPoint } from '@visx/shape/lib/types';
import { scaleLinear, scaleTime } from '@visx/scale';
import { ScaleLinear, ScaleTime } from 'd3-scale';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import { SeasonRange } from '~/hooks/beanstalk/useSeasonsQuery';
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

// default strokes
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
    strokeWidth: 0.5
  }
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
export type BaseDataPoint = { [key: string]: number } & Omit<DataPoint, 'value'>
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
type GenerateScalesParams<T extends BaseDataPoint> = {
  stackedArea: (seriesData: T[], height: number, width: number, isTWAP?: boolean) => {
    xScale: ScaleLinear<number, number, never>;
    yScale: ScaleLinear<number, number, never>;
  };
  series: (seriesData: T[][], height: number, width: number, isTWAP?: boolean) => {
    xScale: ScaleLinear<number, number, never>;
    dScale: ScaleTime<number, number, never>;
    yScale: ScaleLinear<number, number, never>;
  }[];
};
type ChartAccessorProps<T extends BaseDataPoint> = {
  // accessors
  getX: (d: T) => number;
  getD: (d: T) => Date;
  getY: (d: T) => number;
  getY0: (d: SeriesPoint<T>) => number;
  getY1: (d: SeriesPoint<T>) => number;
  getYMin: (d: T) => number;
  getYMax: (d: T) => number;
  bisectSeason: (array: ArrayLike<T>, x: number, lo?: number | undefined, hi?: number | undefined) => number;
};

export type ProvidedChartProps<T extends BaseDataPoint> = (
  ChartSharedValuesProps
  & { generateScales: GenerateScalesParams<T> } 
  & { accessors: ChartAccessorProps<T> } 
);

type ChartPropProviderProps<T extends BaseDataPoint> = {
  children: (props: ProvidedChartProps<T>) => React.ReactNode;
};

export default function ChartPropProvider<T extends BaseDataPoint>({
  children,
}: ChartPropProviderProps<T>) {
  const sharedValues = useMemo(
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

  const accessors = useMemo(() => {
    const bisectSeason = bisector<T, number>((d) => d.season).left;
    const getX = (d: T) => d.season;
    const getY = (d: T) => d.value;
    const getD = (d: T) => d.date;
    const getY0 = (d: SeriesPoint<T>) => (!d[0] || Number.isNaN(d[0]) || !Number.isFinite(d[0]) ? 0 : d[0]);
    const getY1 = (d: SeriesPoint<T>) => (!d[1] || Number.isNaN(d[1]) || !Number.isFinite(d[1]) ? 0 : d[1]);
    const baseDataPoint = { 
      season: true, 
      date: true, 
      timestamp: true 
    } as const;
    const getYMin = (d: T) =>
      Object.entries(d).reduce((acc, [k, v]) => {
        if (k in baseDataPoint) return acc;
        return Math.min(acc, v as number);
      }, 0);
    // get max to allow for stacking
    const getYMax = (d: T) =>
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

  const generateStackedAreaScale = useCallback(
    (seriesData: T[], height: number, width: number, isTWAP?: boolean) => {
      const { getYMin, getYMax, getX } = accessors;
      const xScale = scaleLinear<number>({
        domain: extent(seriesData, getX) as [number, number],
      });

      let yScale;
      if (isTWAP) {
        const biggestDifference = Math.max(
          Math.abs(1 - (min(seriesData, getYMin) as number)),
          Math.abs(1 - (max(seriesData, getYMax) as number))
        );
        yScale = scaleLinear<number>({
          domain: [1 - biggestDifference, 1 + biggestDifference],
        });
      } else {
        yScale = scaleLinear<number>({
          clamp: true,
          domain: [
            0.95 * (min(seriesData, getYMin) as number),
            1.05 * (max(seriesData, getYMax) as number),
          ],
        });
      }

      xScale.range([0, width - yAxisWidth]);
      yScale.range([
        height - axisHeight - margin.bottom - strokeBuffer, // bottom edge
        margin.top,
      ]);
      return { xScale, yScale };
    },
    [accessors]
  );
  const generateSeriesScales = useCallback(
    (seriesData: T[][], height: number, width: number, isTWAP?: boolean) => {
      const { getD, getX, getY } = accessors;
      return seriesData.map((_data) => {
        const xDomain = extent(_data, getX) as [number, number];
        const xScale = scaleLinear<number>({
          domain: xDomain,
        });
        const dScale = scaleTime({
          domain: extent(_data, getD) as [Date, Date],
          range: xDomain,
        });
        /// Used for price graphs which should always show y = 1.
        /// Sets the yScale so that 1 is always perfectly in the middle.
        let yScale;
        if (isTWAP) {
          const yMin = min(_data, getY);
          const yMax = max(_data, getY);
          const biggestDifference = Math.max(
            Math.abs(1 - (yMin as number)),
            Math.abs(1 - (yMax as number))
          );
          yScale = scaleLinear<number>({
            domain: [
              Math.max(1 - biggestDifference, 0), // TWAP can't go below zero
              1 + biggestDifference,
            ],
          });
        }
        /// Min/max y scaling
        else {
          yScale = scaleLinear<number>({
            domain: [min(_data, getY) as number, max(_data, getY) as number],
          });
        }
        /// Set ranges
        xScale.range([0, width - yAxisWidth]);
        yScale.range([
          height - axisHeight - margin.bottom - strokeBuffer, // bottom edge
          margin.top,
        ]);
        return {
          xScale,
          dScale,
          yScale,
        };
      });
    },
    [accessors]
  );
  const generateScales = useMemo(
    () => ({
      stackedArea: generateStackedAreaScale,
      series: generateSeriesScales,
    }),
    [generateSeriesScales, generateStackedAreaScale]
  );

  return (
    <>
      {children({
        ...sharedValues,
        accessors,
        generateScales,
      })}
    </>
  );
}

const useMaxSeasonsWithRange = (range: SeasonRange) =>
  useMemo(() => {
    const perDay = 24;
    const perWeek = perDay * 7;
    const perMonth = perDay * 30;
    switch (range) {
      case SeasonRange.WEEK: {
        return perWeek;
      }
      case SeasonRange.MONTH: {
        return perMonth;
      }
      default:
        return undefined;
    }
  }, [range]);

import React, { useCallback, useMemo } from 'react';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { AreaStack, Line, LinePath } from '@visx/shape';
import { Group } from '@visx/group';

import { CurveFactory , Series } from 'd3-shape';
import { LinearGradient } from '@visx/gradient';
import BigNumber from 'bignumber.js';
import { Axis, Orientation } from '@visx/axis';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';

import { localPoint } from '@visx/event';
import { Stack, Typography } from '@mui/material';
import {
  curveLinear,
} from '@visx/curve';
import { SeriesPoint } from '@visx/shape/lib/types';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import { CURVES, DataRegion, Scale } from '~/components/Common/Charts/LineChart';
import { displayBN } from '~/util';
import ChartPropProvider, { BaseDataPoint, ProvidedChartProps } from './ChartPropProvider';

export type ChartMultiStyles = {
  [key: string]: {
    stroke: string; // stroke color
    fillPrimary?: string; // gradient 'to' color
    fillSecondary?: string; // gradient 'from' color
    strokeWidth?: number;
  };
};

export type ChartMultiProps<T extends BaseDataPoint> = {
  curve?: CurveFactory | keyof typeof CURVES;
  isTWAP?: boolean;
  stylesConfig?: ChartMultiStyles;
  onCursor?: (ds?: T) => void;
  children?: (props: GraphProps<T> & {
    scales: Scale[];
    dataRegion: DataRegion;
  }) => React.ReactElement | null;
}

export type MultiStackedAreaChartProps<T extends BaseDataPoint> = {
  series: T[][];
  keys: string[];
  tooltipComponent?: ({ d }: { d: T }) => JSX.Element;
} & Omit<ChartMultiProps<T>, 'children'>;

type GraphProps<T extends BaseDataPoint> = (
  { width: number; height: number } 
  & MultiStackedAreaChartProps<T> 
  & ProvidedChartProps<T>
);

// default strokes
const strokes = [
  {
    stroke: BeanstalkPalette.logoGreen,
    strokeWidth: 1,
  },
  {
    stroke: BeanstalkPalette.darkBlue,
    strokeWidth: 1,
  },
  {
    stroke: BeanstalkPalette.lightGrey,
    strokeWidth: 0.5,
  },
];

// default gradients
const gradients = [
  {
    to: BeanstalkPalette.lightGreen,
    from: BeanstalkPalette.logoGreen,
    id: 'stacked-area-green',
  },
  {
    to: BeanstalkPalette.lightBlue,
    from: BeanstalkPalette.darkBlue,
    id: 'stacked-area-blue',
  },
  {
    to: BeanstalkPalette.lightGrey,
    from: BeanstalkPalette.grey,
    id: 'stacked-area-grey',
  },
];

function Graph<T extends BaseDataPoint>(props: GraphProps<T>) {
  const {
    // Chart sizing
    width,
    height,
    // Line Chart Props
    series,
    curve,
    keys,
    onCursor,
    isTWAP,
    stylesConfig,
    defaultChartStyles,
    accessors, // memoized accessor fns
    generateScales, // memoized fn to generate x & y scales
  } = props;
  const { getX, getY0, getY1, getY, bisectSeason } = accessors;

  const data = useMemo(() => (series.length ? series[0] : []), [series]);

  const scale = useMemo(
    () => generateScales.stackedArea(data, height, width, isTWAP),
    [generateScales, data, height, width, isTWAP]
  );

  const [tickSeasons, tickDates] = useMemo(() => {
    const interval = Math.ceil(data.length / 12);
    const shift = Math.ceil(interval / 3); // slight shift on tick labels
    return data.reduce<[number[], string[]]>(
      (prev, curr, i) => {
        if (i % interval === shift) {
          prev[0].push(curr.season);
          prev[1].push(
            curr.date
              ? `${curr.date.getMonth() + 1}/${curr.date.getDate()}`
              : curr.season.toString() // fallback to season if no date provided
          );
        }
        return prev;
      },
      [[], []]
    );
  }, [data]);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  } = useTooltip<T | undefined>();

  const { containerRef, containerBounds, TooltipInPortal } = useTooltipInPortal(
    { scroll: true, detectBounds: true }
  );

  const handleMouseLeave = useCallback(() => {
    hideTooltip();
    onCursor?.(undefined);
  }, [hideTooltip, onCursor]);

  const handlePointerMove = useCallback((event: | React.PointerEvent<SVGRectElement> | React.PointerEvent<HTMLDivElement>) => {
      // coordinates should be relative to the container in which Tooltip is rendered
      const containerX =
        ('clientX' in event ? event.clientX : 0) - containerBounds.left;
      const containerY =
        ('clientY' in event ? event.clientY : 0) - containerBounds.top;
      const { x } = localPoint(event) || { x: 0 };
      const x0 = scale.xScale.invert(x);
      const index = bisectSeason(data, x0, 1);
      const d0 = data[index - 1]; // value at x0 - 1
      const d1 = data[index]; // value at x0
      const d = (() => {
        if (d1 && getX(d1)) {
          return x0.valueOf() - getX(d0).valueOf() > getX(d1).valueOf() - x0.valueOf() ? d1 : d0;
        }
        return d0;  
      })();
      showTooltip({
        tooltipLeft: containerX,
        tooltipTop: containerY,
        tooltipData: d,
      });
      onCursor?.(d);
    },
    [
      containerBounds.left,
      containerBounds.top,
      scale.xScale,
      bisectSeason,
      data,
      getX,
      showTooltip,
      onCursor,
    ]
  );

  const xTickFormat = useCallback((_, i) => tickDates[i], [tickDates]);
  const yTickFormat = useCallback((val) => displayBN(new BigNumber(val)), []);

  const getPathFromStack = useCallback(<K extends keyof T>(stackData: Series<T, K>): T[] => {
    const converted = stackData.map((_stack: SeriesPoint<T>) => ({ 
      season: _stack.data.season, 
      date: _stack.data.date, 
      value: getY1(_stack) 
    }));
    return converted as unknown as T[];
  }, [getY1]);

  const chartStyle = useMemo(() => {
    const style = stylesConfig || defaultChartStyles;
    const styles = Object.entries((style)).map(([k, { stroke, fillPrimary, fillSecondary }]) => {
      const primary = fillPrimary || stroke;
      const secondary = fillSecondary || (fillPrimary || stroke);
      return { id: k, to: primary, from: secondary, stroke };
    });
    const getStyle = (k: string, i: number) => {
      const _style = styles.find((s) => s.id === k);
      return _style || styles[Math.floor(i % styles.length)];
    };
    return { getStyle, styles };
  }, [defaultChartStyles, stylesConfig]);

  if (!data || data.length === 0) return null;

  const dataRegion = {
    yTop: props.margin.top, // chart edge to data region first pixel
    yBottom:
      height - // chart edge to data region first pixel
      props.axisHeight - // chart edge to data region first pixel
      props.margin.bottom - // chart edge to data region first pixel
      props.strokeBuffer,
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onMouseLeave={handleMouseLeave}
      style={{ width, height }}
    >
      <svg width={width} height={height}>
        <Group
          width={width - props.yAxisWidth}
          height={dataRegion.yBottom - dataRegion.yTop}
        >
          {chartStyle.styles.map((s) => (
            <LinearGradient {...s} key={s.id} />
          ))}
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="transparent"
            rx={14}
          />
          <AreaStack<T>
            top={props.margin.top}
            left={props.margin.left}
            keys={keys}
            data={data}
            height={height}
            x={(d) => scale.xScale(getX(d.data)) ?? 0}
            y0={(d) => scale.yScale(getY0(d)) ?? 0}
            y1={(d) => scale.yScale(getY1(d)) ?? 0}
          >
            {({ stacks, path }) => 
              stacks.map((stack, i) => {
                if (i === 0) {
                  console.log(stack);
                }
                return (
                  <>
                    <path
                      key={`stack-${stack.key}`}
                      d={path(stack) || ''}
                      stroke="transparent"
                      fill={`url(#${chartStyle.getStyle(`${stack.key}`, i).id})`}
                  />
                    <LinePath<T>
                      stroke={chartStyle.getStyle(`${stack.key}`, i).stroke}
                      key={`line-${i}`}
                      curve={curveLinear}
                      data={getPathFromStack(stack)}
                      x={(d) => scale.xScale(getX(d)) ?? 0}
                      y={(d) => scale.yScale(getY(d)) ?? 0}
                    />
                  </>
                );
               })
            }
          </AreaStack>
        </Group>
        <g transform={`translate(0, ${dataRegion.yBottom})`}>
          <Axis
            key="axis"
            orientation={Orientation.bottom}
            scale={scale.xScale}
            stroke={props.axisColor}
            tickFormat={xTickFormat}
            tickStroke={props.axisColor}
            tickLabelProps={props.xTickLabelProps}
            tickValues={tickSeasons}
          />
        </g>
        <g transform={`translate(${width - 17}, 1)`}>
          <Axis
            key="axis"
            orientation={Orientation.right}
            scale={scale.yScale}
            stroke={props.axisColor}
            tickFormat={yTickFormat}
            tickStroke={props.axisColor}
            tickLabelProps={props.yTickLabelProps}
            numTicks={6}
            strokeWidth={0}
          />
        </g>
        {tooltipData && (
          <g>
            <Line
              from={{ x: tooltipLeft, y: dataRegion.yTop }}
              to={{ x: tooltipLeft, y: dataRegion.yBottom }}
              stroke={BeanstalkPalette.lightGrey}
              strokeWidth={1}
              pointerEvents="none"
            />
          </g>
        )}
        {tooltipData && (
          <div>
            <TooltipInPortal 
              key={Math.random()} 
              left={tooltipLeft}
              top={tooltipTop}
            >
              <Stack spacing={0.5}>
                {keys.map((k) => (
                  <Typography key={k}> {k}: {tooltipData[k]} </Typography>
                ))}
              </Stack>
            </TooltipInPortal>
          </div>
        )}
      </svg>
    </div>
  );
}

// ------------------------
//       Stacked Area Chart
// ------------------------

function MultiStackedAreaChart<T extends BaseDataPoint>(props: MultiStackedAreaChartProps<T>) {
  return (
    <ChartPropProvider>
      {({ ...sharedChartProps }) => (
        <ParentSize debounceTime={50}>
          {({ width: visWidth, height: visHeight }) => (
            <Graph
              width={visWidth}
              height={visHeight}
              {...sharedChartProps}
              {...props}
            />
          )}
        </ParentSize>
      )}
    </ChartPropProvider>
  );
}

export default MultiStackedAreaChart;

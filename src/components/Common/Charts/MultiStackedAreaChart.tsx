import React, { useCallback, useMemo } from 'react';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { AreaStack, Line } from '@visx/shape';
import { Group } from '@visx/group';

import { CurveFactory } from 'd3-shape';
import { LinearGradient } from '@visx/gradient';
import BigNumber from 'bignumber.js';
import { Axis, Orientation } from '@visx/axis';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { Stack, Typography } from '@mui/material';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import { CURVES, DataPoint } from '~/components/Common/Charts/LineChart';
import { displayBN } from '~/util';
import ChartPropProvider, { ProvidedChartProps } from './ChartPropProvider';

type StackedAreaDataPoint = { [key: string]: number } & Omit<
  DataPoint,
  'value'
>;

export type StackedAreaChartStyles = {
  [key: string]: {
    stroke?: {
      stroke: string;
      strokeWidth: number;
    };
    gradients?: {
      to: string;
      from: string;
      id: string;
    };
  };
};

export type MultiStackedAreaChartProps = {
  series: StackedAreaDataPoint[];
  keys: string[];
  curve?: CurveFactory | keyof typeof CURVES;
  isTWAP?: boolean;
  stylesConfig?: StackedAreaChartStyles;
  onCursor?: (ds?: StackedAreaDataPoint) => void;
  tooltipComponent?: ({ d }: { d: StackedAreaDataPoint }) => JSX.Element;
};

type GraphProps = {
  width: number;
  height: number;
} & MultiStackedAreaChartProps &
  ProvidedChartProps<StackedAreaDataPoint>;

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

function Graph(props: GraphProps) {
  const {
    // Chart sizing
    width,
    height,
    // Line Chart Props
    series,
    onCursor,
    isTWAP,
    // key of data
    keys,
    // memoized accessor fns
    accessors,
    // memoized fn to generate x & y scales
    generateScales,
  } = props;
  const { getX, getY0, getY1, bisectSeason } = accessors;

  const scale = useMemo(
    () => generateScales.stackedArea(series, height, width, isTWAP),
    [generateScales, series, height, width, isTWAP]
  );

  const [tickSeasons, tickDates] = useMemo(() => {
    const interval = Math.ceil(series.length / 12);
    const shift = Math.ceil(interval / 3); // slight shift on tick labels
    return series.reduce<[number[], string[]]>(
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
  }, [series]);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  } = useTooltip<StackedAreaDataPoint | undefined>();

  const { containerRef, containerBounds, TooltipInPortal } = useTooltipInPortal(
    { scroll: true, detectBounds: true }
  );

  const handleMouseLeave = useCallback(() => {
    hideTooltip();
    onCursor?.(undefined);
  }, [hideTooltip, onCursor]);

  const handlePointerMove = useCallback(
    (
      event:
        | React.PointerEvent<SVGRectElement>
        | React.PointerEvent<HTMLDivElement>
    ) => {
      // coordinates should be relative to the container in which Tooltip is rendered
      const containerX =
        ('clientX' in event ? event.clientX : 0) - containerBounds.left;
      const containerY =
        ('clientY' in event ? event.clientY : 0) - containerBounds.top;
      const { x } = localPoint(event) || { x: 0 };
      const x0 = scale.xScale.invert(x);
      const index = bisectSeason(series, x0, 1);
      const d0 = series[index - 1]; // value at x0 - 1
      const d1 = series[index]; // value at x0
      let d = d0;
      if (d1 && getX(d1)) {
        d =
          x0.valueOf() - getX(d0).valueOf() > getX(d1).valueOf() - x0.valueOf()
            ? d1
            : d0;
      }

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
      series,
      getX,
      showTooltip,
      onCursor,
    ]
  );

  const xTickFormat = useCallback((_, i) => tickDates[i], [tickDates]);
  const yTickFormat = useCallback((val) => displayBN(new BigNumber(val)), []);

  if (!series || series.length === 0) return null;

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
          {gradients.map((gradient) => (
            <LinearGradient {...gradient} key={gradient.id} />
          ))}
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="transparent"
            rx={14}
          />
          <AreaStack<StackedAreaDataPoint>
            top={props.margin.top}
            left={props.margin.left}
            keys={keys}
            data={series}
            height={height}
            x={(d) => scale.xScale(getX(d.data)) ?? 0}
            y0={(d) => scale.yScale(getY0(d)) ?? 0}
            y1={(d) => scale.yScale(getY1(d)) ?? 0}
          >
            {({ stacks, path }) =>
              stacks.map((stack, i) => {
                const fillIndex = Math.floor(i % gradients.length);
                return (
                  <path
                    key={`stack-${stack.key}`}
                    d={path(stack) || ''}
                    stroke={strokes[fillIndex].stroke}
                    fill={`url(#${gradients[fillIndex].id})`}
                    // onClick={() => {}}
                  />
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
                  <Typography key={k}>
                    {k}: {tooltipData[k]}
                  </Typography>
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

function MultiStackedAreaChart(props: MultiStackedAreaChartProps) {
  return (
    <ChartPropProvider>
      {({ ...chartControlProps }) => (
        <ParentSize debounceTime={50}>
          {({ width: visWidth, height: visHeight }) => (
            <Graph
              width={visWidth}
              height={visHeight}
              {...props}
              {...chartControlProps}
            />
          )}
        </ParentSize>
      )}
    </ChartPropProvider>
  );
}

export default MultiStackedAreaChart;

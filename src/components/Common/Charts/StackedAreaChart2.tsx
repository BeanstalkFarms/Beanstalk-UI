import React, { useCallback, useMemo } from 'react';
import { bisector, extent, max, min } from 'd3-array';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { AreaStack, Line } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';

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

export type BaseMultiDataPoint = { [key: string]: number } & Omit<
  DataPoint,
  'value'
>;

export type Scale = {
  xScale: ReturnType<typeof scaleLinear>;
  yScale: ReturnType<typeof scaleLinear>;
};

export type DataRegion = {
  yTop: number;
  yBottom: number;
};

export type StackedAreaChartProps<T extends BaseMultiDataPoint> = {
  series: T[];
  keys: string[];
  onCursor?: (ds?: T[]) => void;
  curve?: CurveFactory | keyof typeof CURVES;
  isTWAP?: boolean;

  children?: (
    props: GraphProps<T> & {
      scales: Scale[];
      dataRegion: DataRegion;
    }
  ) => React.ReactElement | null;
};

type GraphProps<T extends BaseMultiDataPoint> = {
  width: number;
  height: number;
} & StackedAreaChartProps<T>;

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

// data accessors
const getX = (d: BaseMultiDataPoint) => d.season;
const getY = (d: BaseMultiDataPoint, i: number) => d?.[i];
const bisectSeason = bisector<BaseMultiDataPoint, number>((d) => d.season).left;
const getMin = (d: BaseMultiDataPoint) => {
  const data: number[] = [];
  Object.entries(d).forEach(([key, value]) => {
    if (key === 'season' || key === 'date' || key === 'timestamp') {
      return;
    }
    data.push(value as number);
  });
  return Math.min(...data);
};
const getMax = (d: BaseMultiDataPoint) => {
  const data: number[] = [];
  Object.entries(d).forEach(([key, value]) => {
    if (key === 'season' || key === 'date' || key === 'timestamp') {
      return;
    }
    data.push(value as number);
  });
  return Math.max(...data);
};

const margin = {
  top: 10,
  bottom: 9,
  left: 0,
  right: 0,
};

const axisHeight = 21;

// How much padding to add to edges so that the stroke doesn't get
// partially cut off by the bottom axis
const strokeBuffer = 2;

// AXIS
export const backgroundColor = '#da7cff';
export const labelColor = '#340098';
const axisColor = BeanstalkPalette.lightGrey;
const tickLabelColor = BeanstalkPalette.lightGrey;
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

function Graph<T extends BaseMultiDataPoint>(props: GraphProps<T>) {
  const {
    // Chart sizing
    width,
    height,
    keys,
    // Line Chart Props
    series,
    onCursor,
    isTWAP,
  } = props;
  const yAxisWidth = 57;

  const scale = useMemo(() => {
    const xScale = scaleLinear<number>({
      domain: extent(series, getX) as [number, number],
    });
    let yScale;
    if (isTWAP) {
      const yMin = min(series, getY);
      const yMax = max(series, getY);

      const biggestDifference = Math.max(
        Math.abs(1 - (yMin as number)),
        Math.abs(1 - (yMax as number))
      );
      yScale = scaleLinear<number>({
        domain: [1 - biggestDifference, 1 + biggestDifference],
      });
    } else {
      yScale = scaleLinear<number>({
        range: [height - margin.top - margin.bottom, 0],
        domain: [min(series, getMin) as number, max(series, getMax) as number],
        clamp: true,
      });
    }
    xScale.range([0, width - yAxisWidth]);
    yScale.range([
      height - axisHeight - margin.bottom - strokeBuffer, // bottom edge
      margin.top,
    ]);
    return { xScale, yScale };
  }, [height, isTWAP, series, width]);

  const [tickSeasons, tickDates] = useMemo(() => {
    const interval = Math.ceil(series[0].length / 12);
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
  } = useTooltip<BaseMultiDataPoint | undefined>();

  const { containerRef, containerBounds, TooltipInPortal } = useTooltipInPortal(
    { scroll: true, detectBounds: true }
  );

  const handleMouseLeave = useCallback(() => {
    hideTooltip();
    onCursor?.(undefined);
  }, [hideTooltip, onCursor]);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
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
    },
    [containerBounds.left, containerBounds.top, scale, showTooltip, series]
  );

  const xTickFormat = useCallback((_, i) => tickDates[i], [tickDates]);
  const yTickFormat = useCallback((val) => displayBN(new BigNumber(val)), []);

  if (!series || series.length === 0) return null;

  const dataRegion = {
    yTop: margin.top, // chart edge to data region first pixel
    yBottom:
      height - // chart edge to data region first pixel
      axisHeight - // chart edge to data region first pixel
      margin.bottom - // chart edge to data region first pixel
      strokeBuffer,
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onMouseLeave={handleMouseLeave}
    >
      <svg width={width} height={height}>
        <Group
          width={width - yAxisWidth}
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
          <AreaStack<BaseMultiDataPoint>
            top={margin.top}
            left={margin.left}
            keys={keys}
            data={series}
            height={height}
            order="ascending"
            x={(d) => scale.xScale(getX(d.data)) ?? 0}
            y0={(d) => scale.yScale(d[0]) ?? 0}
            y1={(d) => scale.yScale(d[1]) ?? 0}
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
                    onClick={() => {}}
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
            stroke={axisColor}
            tickFormat={xTickFormat}
            tickStroke={axisColor}
            tickLabelProps={xTickLabelProps}
            tickValues={tickSeasons}
          />
        </g>
        <g transform={`translate(${width - 17}, 1)`}>
          <Axis
            key="axis"
            orientation={Orientation.right}
            scale={scale.yScale}
            stroke={axisColor}
            tickFormat={yTickFormat}
            tickStroke={axisColor}
            tickLabelProps={yTickLabelProps}
            numTicks={6}
            strokeWidth={0}
          />
        </g>
        {tooltipData && (
          <>
            <g>
              <Line
                from={{ x: tooltipLeft, y: dataRegion.yTop }}
                to={{ x: tooltipLeft, y: dataRegion.yBottom }}
                stroke={BeanstalkPalette.lightGrey}
                strokeWidth={1}
                pointerEvents="none"
              />
            </g>
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
          </>
        )}
      </svg>
    </div>
  );
}

// ------------------------
//       Stacked Area Chart
// ------------------------

function StackedAreaChart2<T extends BaseMultiDataPoint>(
  props: StackedAreaChartProps<T>
) {
  return (
    <ParentSize debounceTime={50}>
      {({ width: visWidth, height: visHeight }) => (
        <Graph width={visWidth} height={visHeight} {...props} />
      )}
    </ParentSize>
  );
}

export default StackedAreaChart2;

// const handleMouseLeave = useCallback(() => {
//   hideTooltip();
//   onCursor(undefined);
// }, [hideTooltip, onCursor]);

// const [
//   tickSeasons,
//   tickDates,
// ] = useMemo(
//   () => {
//     const interval = Math.ceil(series[0].length / 12);
//     const shift = Math.ceil(interval / 3); // slight shift on tick labels
//     return series[0].reduce<[number[], string[]]>((prev, curr, i) => {
//       if (i % interval === shift) {
//         prev[0].push(curr.season);
//         prev[1].push(
//           curr.date
//             ? `${(curr.date).getMonth() + 1}/${(curr.date).getDate()}`
//             : curr.season.toString() // fallback to season if no date provided
//         );
//       }
//       return prev;
//     }, [[], []]);
//   },
//   [series]
// );
// const xTickFormat = useCallback((_, i) => tickDates[i], [tickDates]);
// const yTickFormat = useCallback((val) => displayBN(new BigNumber(val)), []);

/** 
        <Group width={width - yAxisWidth} height={dataRegion.yBottom - dataRegion.yTop}>
          {children && children({ scales, dataRegion, ...props })}
          {series.map((_data, index) => (
            <LinePath
              key={index}
              curve={curveLinear}
              data={_data}
              x={(d) => scales[index].xScale(getX(d)) ?? 0}
              y={(d) => scales[index].yScale(getY(d)) ?? 0}
              {...strokes[index]}
            />
          ))}
        </Group> 
<g transform={`translate(0, ${dataRegion.yBottom})`}>
          <Axis
            key="axis"
            orientation={Orientation.bottom}
            scale={scales[0].xScale}
            stroke={axisColor}
            tickFormat={xTickFormat}
            tickStroke={axisColor}
            tickLabelProps={xTickLabelProps}
            tickValues={tickSeasons}
          />
        </g> 
       <g transform={`translate(${width - 17}, 1)`}>
          <Axis
            key="axis"
            orientation={Orientation.right}
            scale={scales[0].yScale}
            stroke={axisColor}
            tickFormat={yTickFormat}
            tickStroke={axisColor}
            tickLabelProps={yTickLabelProps}
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
            <circle
              cx={tooltipLeftAttached}
              cy={tooltipTop}
              r={4}
              fill="black"
              fillOpacity={0.1}
              stroke="black"
              strokeOpacity={0.1}
              strokeWidth={2}
              pointerEvents="none"
            />
          </g>
        )} 

          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
          rx={14}
          onTouchStart={handleTooltip}
          onTouchMove={handleTooltip}
          onMouseMove={handleTooltip}
          onMouseLeave={handleMouseLeave}
        />
*/

/**
 *
 */
// const {
//   showTooltip,
//   hideTooltip,
//   tooltipData,
//   tooltipTop = 0,
//   tooltipLeft = 0,
// } = useTooltip<DataPoint[] | undefined>();

/**
 * Build scales.
 * In both cases:
 *  "domain" = values shown on the graph (dates, numbers)
 *  "range"  = pixel values
 */

// const scalesTest = useMemo(() => {
//   const _data = series.length ? series[0] : [];
//   const xScale = scaleLinear<number>({
//     domain: extent(_data, getX) as [number, number],
//   });
//   let yScale;

//   const values = _data.map((d) => keys.map((k) => d[k]));
//   const [yMin, yMax] = [Math.min(...values.flat()), Math.max(...values.flat())];

//   if (isTWAP) {
//     // const yMin = min(_data, getY);
//     // const yMax = max(_data, getY);

//     const biggestDifference = Math.max(Math.abs(1 - (yMin as number)), Math.abs(1 - (yMax as number)));
//     yScale = scaleLinear<number>({
//       domain: [1 - biggestDifference, 1 + biggestDifference],
//     });
//   } else {
//     yScale = scaleLinear<number>({
//       domain: [
//         0.95 * yMin,
//         1.05 * yMax
//       ],
//       clamp: true
//     })
//   }
//   return { xScale, yScale }
// }, [isTWAP, keys, series]);

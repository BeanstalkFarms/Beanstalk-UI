import React, { useCallback, useMemo } from 'react';
import { extent, max, min } from 'd3-array';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { AreaStack } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';

import { CurveFactory } from 'd3-shape';
import { LinearGradient } from '@visx/gradient';
import BigNumber from 'bignumber.js';
import { Axis, Orientation } from '@visx/axis';
import { SeriesPoint } from '@visx/shape/lib/types';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import { CURVES, DataPoint } from '~/components/Common/Charts/LineChart';
import { MinimumViableSnapshot } from '~/hooks/beanstalk/useSeasonsQuery';
import { displayBN } from '~/util';

type numberish = string | number;
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

type MinMultiQuerySnapshot = Omit<MinimumViableSnapshot, 'id'>;

export type StackedAreaChartProps<T extends BaseMultiDataPoint> = {
  series: T[][];
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
const getY0 = (d: SeriesPoint<BaseMultiDataPoint>) => {
  if (d[0]) {
    return d[0];
  }
  return 0;
};
const getY1 = (d: SeriesPoint<BaseMultiDataPoint>) => {
  if (d[1]) {
    return d[1];
  }
  return 0;
};

const getMin = (d: BaseMultiDataPoint) => {
  const data = Object.entries(d).map(([key, value]) => {
    if (key === 'season' || key === 'date' || key === 'timestamp') {
      return Infinity;
    }
    return value as number;
  });

  return Math.min(...data, 0);
};

const getMax = (d: BaseMultiDataPoint) => {
  const data = Object.entries(d).map(([key, value]) => {
    if (key === 'season' || key === 'date' || key === 'timestamp') {
      return -Infinity;
    }
    return value as number;
  });

  return Math.max(...data, 0);
};

// const bisectSeason = bisector<{ season: number }, number>(
//   (d) => d.season
// ).left;

// ------------------------
//        Plot Sizing
// ------------------------

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
    children,
    isTWAP,
  } = props;
  // When positioning the circle that accompanies the cursor,
  // use this dataset to decide where it goes. (There is one
  // circle but potentially multiple series).
  const data = series[0];
  const yAxisWidth = 57;

  const scales = useMemo(
    () =>
      series.map((_data) => {
        const xScale = scaleLinear<number>({
          domain: extent(_data, getX) as [number, number],
        });

        let yScale;

        if (isTWAP) {
          const yMin = min(_data, getY);
          const yMax = max(_data, getY);

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
            domain: [
              0.95 * (min(_data, getMin) as number),
              1.05 * (max(_data, getMax) as number),
            ],
            clamp: true,
          });
        }
        xScale.range([0, width - yAxisWidth]);
        yScale.range([
          height - axisHeight - margin.bottom - strokeBuffer, // bottom edge
          margin.top,
        ]);
        return { xScale, yScale };
      }),
    [series, height, isTWAP, width]
  );

  const [tickSeasons, tickDates] = useMemo(() => {
    const interval = Math.ceil(series[0].length / 12);
    const shift = Math.ceil(interval / 3); // slight shift on tick labels
    return series[0].reduce<[number[], string[]]>(
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

  const xTickFormat = useCallback((_, i) => tickDates[i], [tickDates]);
  const yTickFormat = useCallback((val) => displayBN(new BigNumber(val)), []);

  if (!series || series.length === 0) return null;

  //
  // const tooltipLeftAttached = tooltipData ? scales[0].xScale(getX(tooltipData[0])) : undefined;

  /**
   * Height: `height` (controlled by container)
   * Width:  `width`  (controlled by container)
   *
   * ----------------------------------
   * |                                |
   * |           plot                 |
   * |                                |
   * ----------------------------------
   * |           axes                 |
   * ----------------------------------
   */
  const dataRegion = {
    yTop: margin.top, // chart edge to data region first pixel
    yBottom:
      height - // chart edge to data region first pixel
      axisHeight - // chart edge to data region first pixel
      margin.bottom - // chart edge to data region first pixel
      strokeBuffer,
  };

  return (
    <>
      <svg width={width} height={height}>
        {/**
         * Chart
         */}
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
            data={data}
            height={height}
            x={(d) => scales[0].xScale(getX(d.data)) ?? 0}
            y0={(d) => scales[0].yScale(getY0(d)) ?? 0}
            y1={(d) => scales[0].yScale(getY1(d)) ?? 0}
          >
            {({ stacks, path }) => 
              // console.log('stacks: ', stacks);
               stacks.map((stack, i) => {
                const fillIndex = Math.floor(i % gradients.length);
                // console.log('idx: ', fillIndex);
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
        {/* <Group width={width - yAxisWidth} height={dataRegion.yBottom - dataRegion.yTop}>
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
        </Group>  */}
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
      </svg>
    </>
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
        <Graph width={visWidth} height={visHeight} {...props}>
          {props.children}
        </Graph>
      )}
    </ParentSize>
  );
}

export default StackedAreaChart2;

// const handleTooltip = useCallback(
//   (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
//     const { x } = localPoint(event) || { x: 0 }; // x0 + x1 + ... + xn = width of chart (~ 1123 px on my screen) ||| ex 956

//     // for each series
//     const ds = scales.map((scale, i) => {
//       const x0 = scale.xScale.invert(x);   // get Date (season) corresponding to pixel coordinate x ||| ex: 6145.742342789
//       const index = bisectSeason(series[i], x0, 1);  // find the closest index of x0 within data

//       const d0 = series[i][index - 1];  // value at x0 - 1
//       const d1 = series[i][index];      // value at x0

//       //     |   6   |  | 3 |
//       // [(d0)-------(x0)---(d1)]
//       // default to the left endpoint
//       let d = d0;
//       if (d1 && getX(d1)) {
//         // use d1 if x0 is closer to d1
//         d = (x0.valueOf() - getX(d0).valueOf()) > (getX(d1).valueOf() - x0.valueOf())
//           ? d1
//           : d0;
//       }

//       return d;
//     });

//     showTooltip({
//       tooltipData: ds,
//       tooltipLeft: x, // in pixels
//       tooltipTop: scales[0].yScale(getY(ds[0])), // in pixels
//     });
//     onCursor(ds);
//   },
//   [showTooltip, onCursor, scales, series],
// );

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

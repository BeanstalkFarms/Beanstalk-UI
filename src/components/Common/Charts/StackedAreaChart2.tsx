import React, { useCallback, useMemo } from 'react';
import { bisector, extent, max, min } from 'd3-array';
import { NumberValue } from 'd3-scale';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { Bar, Line, LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { localPoint } from '@visx/event';
import { useTooltip } from '@visx/tooltip';
import {
  curveLinear,
} from '@visx/curve';
import { Axis, Orientation } from '@visx/axis';
import { CurveFactory } from 'd3-shape';
import BigNumber from 'bignumber.js';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import { displayBN } from '~/util';
import { CURVES } from '~/components/Common/Charts/LineChart';
import { FC } from '~/types';

// ------------------------
//    Stacked Area Chart
// ------------------------

export type Scale = {
  xScale: ReturnType<typeof scaleLinear>;
  yScale: ReturnType<typeof scaleLinear>;
}

export type DataRegion = {
  yTop: number;
  yBottom: number;
}

export type StackedAreaProps = {
  series: (DataPoint2[])[];
  onCursor: (ds?: DataPoint2[]) => void;
  curve?: CurveFactory | (keyof typeof CURVES);
  isTWAP?: boolean;
  children?: (props: GraphProps & {
    scales: Scale[];
    dataRegion: DataRegion;
  }) => React.ReactElement | null;
};

type GraphProps = {
  width: number;
  height: number;
} & StackedAreaProps;

const strokes = [
  {
    stroke: BeanstalkPalette.theme.fall.brown,
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

// ------------------------
//           Data
// ------------------------

export type DataPoint2 = {
  /** Date */
  date: Date;
  /** Season */
  season: number;
  /** Total deposited value. */
  value: number;
  // stacked areas
  bean: number;
  urBean: number;
  bean3crv: number;
  urBean3crv: number;

}
export type TokenStacks = 'bean' | 'urBean' | 'bean3crv' | 'urBean3crv';

// data accessors
const getX = (d: DataPoint2) => d?.season;
const getY = (d: DataPoint2) => d?.value;
const bisectSeason = bisector<DataPoint2, number>(
  (d) => d.season
).left;

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
const colors = [backgroundColor, labelColor, BeanstalkPalette.logoGreen, BeanstalkPalette.trueRed];

const xTickLabelProps = () => ({
  fill: tickLabelColor,
  fontSize: 12,
  fontFamily: 'Futura PT',
  textAnchor: 'middle',
} as const);
const yTickLabelProps = () => ({
  fill: tickLabelColor,
  fontSize: 12,
  fontFamily: 'Futura PT',
  textAnchor: 'end',
} as const);

const Graph: FC<GraphProps> = (props) => {
  const {
    // Chart sizing
    width,
    height,
    // Line Chart Props
    series,
    onCursor,
    children,
  } = props;
  // When positioning the circle that accompanies the cursor,
  // use this dataset to decide where it goes. (There is one
  // circle but potentially multiple series).
  const data = series[0];
  console.log('STACKED AREA DATA', data);

  // ex: ['bean', 'urBean', 'bean3crv', 'urBean3Crv'];
  const keys = Object.keys(series[0][0]).filter((a) =>
    a !== 'season' &&
    a !== 'date' &&
    a !== 'totalValue'
  );
  const yAxisWidth = 57;

  /**
   *
   */
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  } = useTooltip<DataPoint2[] | undefined>();

  /**
   * Build scales.
   * In both cases:
   *  "domain" = values shown on the graph (dates, numbers)
   *  "range"  = pixel values
   */
  const scales = useMemo(() => series.map((_data) => {
    // x-scale
    const xScale = scaleLinear<number>({
      domain: extent(_data, getX) as [number, number],
    });
    xScale.range([0, width - yAxisWidth]);

    // y-scale
    const yScale = scaleLinear<number>({
      domain: [
        0.95 * (min(_data, getY) as number),
        1.05 * (max(_data, getY) as number)
      ],
      clamp: true
    });
    yScale.range([
      height - axisHeight - margin.bottom - strokeBuffer, // bottom edge
      margin.top,
    ]);

    return { xScale, yScale };
  }), [series, height, width]);

  const handleTooltip = useCallback(
    (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
      const { x } = localPoint(event) || { x: 0 }; // x0 + x1 + ... + xn = width of chart (~ 1123 px on my screen) ||| ex 956

      // for each series
      const ds = scales.map((scale, i) => {
        const x0 = scale.xScale.invert(x);   // get Date (season) corresponding to pixel coordinate x ||| ex: 6145.742342789
        const index = bisectSeason(series[i], x0, 1);  // find the closest index of x0 within data

        const d0 = series[i][index - 1];  // value at x0 - 1
        const d1 = series[i][index];      // value at x0

        //     |   6   |  | 3 |
        // [(d0)-------(x0)---(d1)]
        // default to the left endpoint
        let d = d0;
        if (d1 && getX(d1)) {
          // use d1 if x0 is closer to d1
          d = (x0.valueOf() - getX(d0).valueOf()) > (getX(d1).valueOf() - x0.valueOf())
            ? d1
            : d0;
        }

        return d;
      });

      showTooltip({
        tooltipData: ds,
        tooltipLeft: x, // in pixels
        tooltipTop: scales[0].yScale(getY(ds[0])), // in pixels
      });
      onCursor(ds);
    },
    [showTooltip, onCursor, scales, series],
  );

  const handleMouseLeave = useCallback(() => {
    hideTooltip();
    onCursor(undefined);
  }, [hideTooltip, onCursor]);

  const [
    tickSeasons,
    tickDates,
  ] = useMemo(
    () => {
      const interval = Math.ceil(series[0].length / 12);
      const shift = Math.ceil(interval / 3); // slight shift on tick labels
      return series[0].reduce<[number[], string[]]>((prev, curr, i) => {
        if (i % interval === shift) {
          prev[0].push(curr.season);
          prev[1].push(
            curr.date
              ? `${(curr.date).getMonth() + 1}/${(curr.date).getDate()}`
              : curr.season.toString() // fallback to season if no date provided
          );
        }
        return prev;
      }, [[], []]);
    },
    [series]
  );
  const xTickFormat = useCallback((_: unknown, i: number) => tickDates[i], [tickDates]);
  const yTickFormat = useCallback((val: NumberValue) => displayBN(new BigNumber(val.valueOf())), []);

  if (!series || series.length === 0) return null;

  //
  const tooltipLeftAttached = tooltipData ? scales[0].xScale(getX(tooltipData[0])) : undefined;

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
      height // chart edge to data region first pixel
      - axisHeight // chart edge to data region first pixel
      - margin.bottom  // chart edge to data region first pixel
      - strokeBuffer
  };

  return (
    <>
      <svg width={width} height={height}>
        {/**
         * Chart
         */}
        {/* <Group width={width - yAxisWidth} height={dataRegion.yBottom - dataRegion.yTop}> */}
        {/*  <LinearGradient from={BeanstalkPalette.theme.fall.lightBrown} to={BeanstalkPalette.theme.fall.lightBrown} id="stacked-area-brown" /> */}
        {/*  <rect x={0} y={0} width={width} height={height} fill="transparent" rx={14} /> */}
        {/*  <AreaStack<DataPoint2> */}
        {/*    top={margin.top} */}
        {/*    left={margin.left} */}
        {/*    keys={keys} */}
        {/*    data={data} */}
        {/*    height={height} */}
        {/*    x={(d) => scales[0].xScale(getX(d.data)) ?? 0} */}
        {/*    y0={(d) => { */}
        {/*      console.log('DATAPOINT', d) */}
        {/*      return scales[0].yScale(d[0]) ?? 0 */}
        {/*    }} */}
        {/*    y1={(d) => scales[0].yScale(d[1]) ?? 0} */}
        {/*  > */}
        {/*    {({ stacks, path }) => */}
        {/*      stacks.map((stack, i) => ( */}
        {/*        <path */}
        {/*          key={`stack-${stack.key}`} */}
        {/*          d={path(stack) || ''} */}
        {/*          // stroke={BeanstalkPalette.logoGreen} */}
        {/*          fill="url(#stacked-area-brown)" */}
        {/*          // fill={colors[i]} */}
        {/*          onClick={() => { */}
        {/*          }} */}
        {/*        /> */}
        {/*      )) */}
        {/*    } */}
        {/*  </AreaStack> */}
        {/* </Group> */}
        <Group width={width - yAxisWidth} height={dataRegion.yBottom - dataRegion.yTop}>
          {children && children({ scales, dataRegion, ...props })}
          {series.map((_data, index) => (
            <LinePath<DataPoint2>
              key={index}
              curve={curveLinear}
              data={_data}
              x={(d) => scales[index].xScale(getX(d)) ?? 0}
              y={(d) => scales[index].yScale(getY(d)) ?? 0}
              {...strokes[index]}
              />
            ))}
        </Group>
        {/**
         * Axis
         */}
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
        {/**
         * Cursor
         */}
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
        {/* Overlay to handle tooltip.
          * Needs to be the last item to maintain mouse control. */}
        <Bar
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
      </svg>
    </>
  );
};

const StackedAreaChart2: FC<StackedAreaProps> = (props) => (
  <ParentSize debounceTime={50}>
    {({ width: visWidth, height: visHeight }) => (
      <Graph
        width={visWidth}
        height={visHeight}
        {...props}
      >
        {props.children}
      </Graph>
    )}
  </ParentSize>
);

export default StackedAreaChart2;

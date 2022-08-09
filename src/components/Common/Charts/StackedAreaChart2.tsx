import React, { useCallback, useMemo } from 'react';
import { bisector, extent, max, min } from 'd3-array';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { AreaStack, Bar, Line } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleLinear, scaleTime } from '@visx/scale';
import { localPoint } from '@visx/event';
import { useTooltip } from '@visx/tooltip';
import {
  curveLinear,
  curveStep,
  curveNatural,
  curveBasis,
  curveMonotoneX,
} from '@visx/curve';
import { Axis, Orientation } from '@visx/axis';
import { CurveFactory } from 'd3-shape';
import { LinearGradient } from '@visx/gradient';
import { SeriesPoint } from '@visx/shape/lib/types';
import { timeParse } from 'd3-time-format';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import { background } from '~/components/Common/Charts/StackedAreaChart';

const CURVES = {
  linear: curveLinear,
  step: curveStep,
  natural: curveNatural,
  basis: curveBasis,
  monotoneX: curveMonotoneX,
};

export type Scale = {
  xScale: ReturnType<typeof scaleLinear>;
  yScale: ReturnType<typeof scaleLinear>;
}

export type DataRegion = {
  yTop: number;
  yBottom: number;
}

export type LineChartProps = {
  series: (DataPoint[])[];
  onCursor: (ds?: DataPoint[]) => void;
  curve?: CurveFactory | (keyof typeof CURVES);
  children?: (props: GraphProps & {
    scales: Scale[];
    dataRegion: DataRegion;
  }) => React.ReactElement | null;
};

type GraphProps = {
  width: number;
  height: number;
} & LineChartProps;

// ------------------------
//           Data
// ------------------------

export type DataPoint = {
  season: number;
  value: number;
  date: Date;
};

export interface MockPastSiloData {
  date: string;
  // pools -> must be sorted smallest -> largest
  '0x87898263B6C5BABe34b4ec53F22d98430b91e371': string; // UNISWAP
  '0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D': string; // LUSD
  '0x3a70DfA7d2262988064A2D051dd47521E43c9BdD': string; // 3CRV
}

const mockSiloData: MockPastSiloData[] = [
  {
    date: '2022 Jun 16',
    '0x87898263B6C5BABe34b4ec53F22d98430b91e371': '1',
    '0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D': '1',
    '0x3a70DfA7d2262988064A2D051dd47521E43c9BdD': '10',
  },
  {
    date: '2022 Jun 17',
    '0x87898263B6C5BABe34b4ec53F22d98430b91e371': '1',
    '0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D': '5',
    '0x3a70DfA7d2262988064A2D051dd47521E43c9BdD': '20',
  },
  {
    date: '2022 Jun 18',
    '0x87898263B6C5BABe34b4ec53F22d98430b91e371': '5',
    '0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D': '10',
    '0x3a70DfA7d2262988064A2D051dd47521E43c9BdD': '35',
  },
  {
    date: '2022 Jun 19',
    '0x87898263B6C5BABe34b4ec53F22d98430b91e371': '10',
    '0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D': '15',
    '0x3a70DfA7d2262988064A2D051dd47521E43c9BdD': '50'
  }
];

// data accessors
const getX = (d: DataPoint) => d?.season;
const getY = (d: DataPoint) => d?.value;
const bisectSeason = bisector<DataPoint, number>(
  (d) => d.season
).left;

// const parseDate = timeParse('%Y %b %d');
const parseDate = timeParse('%Y-%m-%dT%H:%M:%S.%LZ');
// const getDate = (d: TotalLiquidityData) => {
//   const date = new Date(d.date);
//   console.log('DATEEE', (parseDate(`${date.getFullYear()} ${date.toLocaleString('default', { month: 'short' })} ${date.getDay()}`) as Date).valueOf());
//   return (parseDate(`${date.getFullYear()} ${date.toLocaleString('default', { month: 'short' })} ${date.getDay()}`) as Date).valueOf();
// };
const getDate = (d: TotalLiquidityData) => (parseDate(d.date) as Date).valueOf();
// console.log('DATEEE', (parseDate(d.date) as Date).valueOf());
const getY0 = (d: SeriesPoint<TotalLiquidityData>, maxVal: number) => (d[0] + 2000000) / (maxVal + (maxVal * 0.03)); // 3% padding on top
const getY1 = (d: SeriesPoint<TotalLiquidityData>, maxVal: number) => d[1] / (maxVal + (maxVal * 0.03));

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
const tickLabelProps = () => ({
  fill: tickLabelColor,
  fontSize: 12,
  fontFamily: 'Futura PT',
  textAnchor: 'middle',
} as const);

export interface TotalLiquidityData {
  date: string;
  totalLiquidityUSD: string;
}

// const mockStackedData: TotalLiquidityData[] = [
//   {
//     // date: 'Mon Aug  01 2022',
//     date: '2022 Aug 01',
//     totalLiquidityUSD: '12539293'
//   },
//   {
//     // date: 'Tue Aug 02 2022',
//     date: '2022 Aug 02',
//     totalLiquidityUSD: '17539293'
//   },
//   {
//     // date: 'Wed Aug 03  2022',
//     date: '2022 Aug 03',
//     totalLiquidityUSD: '19539293'
//   },
//   {
//     // date: 'Thu Aug 0 4 2022',
//     date: '2022 Aug 04',
//     totalLiquidityUSD: '26841293'
//   },
//   {
//     // date: 'Fri Aug 0 5 2022',
//     date: '2022 Aug 05',
//     totalLiquidityUSD: '24241293'
//   },
//   {
//     // date: 'Sat Aug 06  2022',
//     date: '2022 Aug 06',
//     totalLiquidityUSD: '28315494'
//   },
//   {
//     // date: 'Sun Aug 07  2022',
//     date: '2022 Aug 07',
//     totalLiquidityUSD: '23905494'
//   },
//   {
//     // date: 'Mon Aug 08  2022',
//     date: '2022 Aug 08',
//     totalLiquidityUSD: '29905494'
//   },
//   {
//     // date: 'Mon Aug 09 20 22',
//     date: '2022 Aug 09',
//     totalLiquidityUSD: '31905494'
//   },
// ];

// ------------------------
//      Graph (Inner)
// ------------------------

const Graph: React.FC<GraphProps> = (props) => {
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
  console.log('gqlDATA: ', data);
  let maxVal = 0;
  const stackedData: TotalLiquidityData[] = data.reduce((prev, curr, index) => {
    const date = new Date(data[index].date);
    if (data[index].value > maxVal) {
      maxVal = data[index].value;
    }
    console.log('DATEE', date.toISOString(),);
    if (data[index].season !== 6074) {
      prev.push({
        // formats date to: '2022 Aug 01'
        // date: `${date.getFullYear()} ${date.toLocaleString('default', { month: 'short' })} ${date.toLocaleString('default', { day: 'numeric' })}`,
        totalLiquidityUSD: data[index].value.toString(),
        date: date.toISOString(),
        // date: data[index].date.toDateString(),
      });
    }
    return prev;
  }, [] as TotalLiquidityData[]);

  console.log('STACK ASS', stackedData);

  // ['totalLiquidityUSD']
  const keys = Object.keys(stackedData[0]).filter((k) => k !== 'date') as any[];

  /**
   *
   */
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  } = useTooltip<DataPoint[] | undefined>();

  /**
   * Build scales.
   * In both cases:
   *  "domain" = values shown on the graph (dates, numbers)
   *  "range"  = pixel values
   */
  const scales = useMemo(() => series.map((_data) => {
    const xScale = scaleLinear<number>({
      domain: extent(_data, getX) as [number, number],
    });

    const yScale = scaleLinear<number>({
      domain: [min(_data, getY) as number, max(_data, getY) as number],
    });

    xScale.range([0, width]);
    yScale.range([
      height - axisHeight - margin.bottom - strokeBuffer, // bottom edge
      margin.top,
    ]);

    return { xScale, yScale };
  }), [width, height, series]);

  const handleTooltip = useCallback(
    (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
      const { x } = localPoint(event) || { x: 0 };

      // for each series
      const ds = scales.map((scale, i) => {
        const x0 = scale.xScale.invert(x);   // get Date corresponding to pixel coordinate x
        const index = bisectSeason(data, x0, 1);  // find the closest index of x0 within data

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
        // scales[0].xScale(getX(ds[0]))
        // cursorLeft:  x,
        tooltipTop: scales[0].yScale(getY(ds[0])), // in pixels
      });
      onCursor(ds);
    },
    [showTooltip, onCursor, data, scales, series],
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
          prev[1].push(`${(curr.date).getMonth() + 1}/${(curr.date).getDate()}`);
        }
        return prev;
      }, [[], []]);
    },
    [series]
  );
  const tickFormat = useCallback((_, i) => tickDates[i], [tickDates]);

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
  };

  // bounds
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;
  // scales
  const xScale = scaleTime<number>({
    range: [0, xMax],
    domain: [Math.min(...stackedData.map(getDate)), Math.max(...stackedData.map(getDate))],
  });

  const yScale = scaleLinear<number>({
    range: [yMax, 0],
  });

  return (
    <>
      <svg width={width} height={height}>
        {/**
         * Chart
         */}
        <Group width={width} height={dataRegion.yBottom - dataRegion.yTop}>
          {/* {children && children({ scales, dataRegion, ...props })} */}
          {/* <GradientOrangeRed id="stacked-area-orangered" /> */}
          <LinearGradient from={BeanstalkPalette.lightGreen} to={BeanstalkPalette.lightGreen} id="stacked-area-orangered" />
          <rect x={0} y={0} width={width} height={height} fill={background} rx={14} />
          <AreaStack<TotalLiquidityData>
            top={margin.top}
            left={margin.left}
            keys={keys}
            data={stackedData}
            x={(d) => xScale(getDate(d.data)) ?? 0}
            y0={(d) => yScale(getY0(d, maxVal)) ?? 0}
            y1={(d) => yScale(getY1(d, maxVal)) ?? 0}
          >
            {({ stacks, path }) =>
              stacks.map((stack) => (
                <>
                  {/* {console.log('StACK', stack.key)} */}
                  <path
                    key={`stack-${stack.key}`}
                    d={path(stack) || ''}
                    stroke={BeanstalkPalette.logoGreen}
                    // fill={BeanstalkPalette.logoGreen}
                    fill="url(#stacked-area-orangered)"
                    onClick={() => {}}
                  />
                </>
              ))
            }
          </AreaStack>
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
            tickFormat={tickFormat}
            tickStroke={axisColor}
            tickLabelProps={tickLabelProps}
            tickValues={tickSeasons}
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

// ------------------------
//       Stacked Area Chart
// ------------------------

const StackedAreaChart2: React.FC<LineChartProps> = (props) => (
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

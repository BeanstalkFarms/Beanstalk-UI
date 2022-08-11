import React, { useCallback, useMemo } from 'react';
import { bisector, extent, max, min } from 'd3-array';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { AreaStack, Bar, Line } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
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
  isTWAP?: boolean;
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

// data accessors
const getX = (d: DataPoint) => d?.season;
const getY = (d: DataPoint) => d?.value;
const bisectSeason = bisector<DataPoint, number>(
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
const tickLabelProps = () => ({
  fill: tickLabelColor,
  fontSize: 12,
  fontFamily: 'Futura PT',
  textAnchor: 'middle',
} as const);

const Graph: React.FC<GraphProps> = (props) => {
  const {
    // Chart sizing
    width,
    height,
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

  const keys = ['value'];

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

    let yScale;
    
    if (isTWAP) {
      const yMin = min(_data, getY);
      const yMax = max(_data, getY);
      const biggestDifference = Math.max(Math.abs(1 - (yMin as number)), Math.abs(1 - (yMax as number)));
      yScale = scaleLinear<number>({
        domain: [1 - biggestDifference, 1 + biggestDifference],
      });
    } else {
      yScale = scaleLinear<number>({
        domain: [min(_data, getY) as number, max(_data, getY) as number],
      });
    }

    // if (height - axisHeight - margin.bottom - strokeBuffer === -32) {
    //   console.log('HEIGHT', height);
    //   console.log('axisHeight', axisHeight);
    //   console.log('margin.bottom', margin.bottom);
    //   console.log('strokeBuffer', strokeBuffer);
    // }
    xScale.range([0, width]);

    yScale.range([
      height - axisHeight - margin.bottom - strokeBuffer, // bottom edge
      margin.top,
    ]);

    return { xScale, yScale };
  }), [series, height, isTWAP, width]);

  // console.log('xscale', scales, scales[0].xScale.domain(), scales[0].xScale.range());
  // console.log('yscale', scales, scales[0].yScale.domain(), scales[0].yScale.range());

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
        // scales[0].xScale(getX(ds[0])),
        // cursorLeft:  x,
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
          <AreaStack
            top={margin.top}
            left={margin.left}
            keys={keys}
            data={data}
            x={(d) => scales[0].xScale(getX(d.data)) ?? 0}
            y0={(d) => scales[0].yScale(d[0]) ?? 0}
            y1={(d) => scales[0].yScale(d[1]) ?? 0}
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

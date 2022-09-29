import React, { useCallback, useMemo } from 'react';
import { bisector, extent, max, min } from 'd3-array';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { LinePath, Bar, Line } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleLinear, scaleTime, NumberLike } from '@visx/scale';
import { localPoint } from '@visx/event';
import { useTooltip } from '@visx/tooltip';
import {
  curveLinear,
  curveStep,
  curveStepAfter,
  curveStepBefore,
  curveNatural,
  curveBasis,
  curveMonotoneX,
} from '@visx/curve';
import { Axis, Orientation, TickFormatter } from '@visx/axis';
import { CurveFactory } from 'd3-shape';
import { BeanstalkPalette } from '~/components/App/muiTheme';

export const CURVES = {
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

export type LineChartProps = {
  series: DataPoint[][];
  onCursor?: (ds?: DataPoint[]) => void;
  isTWAP?: boolean; // used to indicate if we are displaying TWAP price
  curve?: CurveFactory | keyof typeof CURVES;
  children?: (
    props: GraphProps & {
      scales: Scale[];
      dataRegion: DataRegion;
    }
  ) => React.ReactElement | null;
  yTickFormat?: TickFormatter<NumberLike>;
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
const getX = (d: DataPoint) => d.season;
const getD = (d: DataPoint) => d.date;
const getY = (d: DataPoint) => d.value;
const bisectSeason = bisector<DataPoint, number>((d) => d.season).left;

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

// ------------------------
//      Fonts & Colors
// ------------------------

const strokes = [
  {
    stroke: BeanstalkPalette.logoGreen,
    strokeWidth: 2,
  },
  {
    stroke: BeanstalkPalette.darkBlue,
    strokeWidth: 2,
  },
  {
    stroke: BeanstalkPalette.lightGrey,
    strokeWidth: 0.5,
  },
];

// AXIS
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
    isTWAP,
    curve: _curve = 'linear',
    children,
    yTickFormat,
  } = props;

  // When positioning the circle that accompanies the cursor,
  // use this dataset to decide where it goes. (There is one
  // circle but potentially multiple series).
  const data = series[0];
  const curve = typeof _curve === 'string' ? CURVES[_curve] : _curve;
  const yAxisWidth = 57;

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  } = useTooltip<DataPoint[] | undefined>();

  // Scales
  const scales = useMemo(
    () =>
      series.map((_data) => {
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
      }),
    [series, isTWAP, width, height]
  );

  // Handlers
  const handleMouseLeave = useCallback(() => {
    hideTooltip();
    onCursor?.(undefined);
  }, [hideTooltip, onCursor]);
  const handleTooltip = useCallback(
    (
      event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>
    ) => {
      const { x } = localPoint(event) || { x: 0 };

      // for each series
      const ds = scales.map((scale, i) => {
        const x0 = scale.xScale.invert(x); // get Date corresponding to pixel coordinate x
        const index = bisectSeason(data, x0, 1); // find the closest index of x0 within data

        const d0 = series[i][index - 1]; // value at x0 - 1
        const d1 = series[i][index]; // value at x0

        //     |   6   |  | 3 |
        // [(d0)-------(x0)---(d1)]
        // default to the left endpoint
        let d = d0;
        if (d1 && getX(d1)) {
          // use d1 if x0 is closer to d1
          d =
            x0.valueOf() - getX(d0).valueOf() >
            getX(d1).valueOf() - x0.valueOf()
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
      onCursor?.(ds);
    },
    [showTooltip, onCursor, data, scales, series]
  );

  // const yTickNum = height > 180 ? undefined : 5;
  const xTickNum = width > 700 ? undefined : Math.floor(width / 70);
  const xTickFormat = useCallback(
    (v) => {
      const d = scales[0].dScale.invert(v);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    },
    [scales]
  );

  // Empty state
  if (!series || series.length === 0) return null;

  // Derived
  const tooltipLeftAttached = tooltipData
    ? scales[0].xScale(getX(tooltipData[0]))
    : undefined;
  const dataRegion = {
    yTop: margin.top, // chart edge to data region first pixel
    yBottom:
      height - // chart edge to data region first pixel
      axisHeight - // chart edge to data region first pixel
      margin.bottom, // chart edge to data region first pixel
  };

  return (
    <>
      <svg width={width} height={height}>
        {/**
         * Lines
         */}
        <Group
          width={width - yAxisWidth}
          height={dataRegion.yBottom - dataRegion.yTop}
        >
          {isTWAP && (
            <Line
              from={{ x: 0, y: scales[0].yScale(1) }}
              to={{ x: width - yAxisWidth, y: scales[0].yScale(1) }}
              {...strokes[2]}
            />
          )}
          {children && children({ scales, dataRegion, ...props })}
          {series.map((_data, index) => (
            <LinePath
              key={index}
              curve={curve}
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
            numTicks={xTickNum}
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
          width={width - yAxisWidth}
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
//       Line Chart
// ------------------------

const LineChart: React.FC<LineChartProps> = (props) => (
  <ParentSize debounceTime={50}>
    {({ width: visWidth, height: visHeight }) => (
      <Graph width={visWidth} height={visHeight} {...props}>
        {props.children}
      </Graph>
    )}
  </ParentSize>
);

export default LineChart;

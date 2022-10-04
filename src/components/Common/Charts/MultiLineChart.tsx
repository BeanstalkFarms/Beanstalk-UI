import React, { useCallback, useMemo } from 'react';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { LinePath, Bar, Line } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { localPoint } from '@visx/event';
import { useTooltip } from '@visx/tooltip';

import { Axis, Orientation } from '@visx/axis';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import ChartPropProvider, {
  BaseDataPoint,
  ProvidedChartProps,
} from './ChartPropProvider';
import { ChartMultiProps } from './MultiStackedAreaChart';

export type Scale = {
  xScale: ReturnType<typeof scaleLinear>;
  yScale: ReturnType<typeof scaleLinear>;
};

export type DataRegion = {
  yTop: number;
  yBottom: number;
};

export type MultiLineChartProps = {
  series: BaseDataPoint[][];
  keys: string[];
} & ChartMultiProps;

type GraphProps = {
  width: number;
  height: number;
} & MultiLineChartProps &
  ProvidedChartProps;

// ------------------------
//           Data
// ------------------------

export type DataPoint = {
  season: number;
  value: number;
  date: Date;
};

// ------------------------
//      Graph (Inner)
// ------------------------

const Graph: React.FC<GraphProps> = (props) => {
  const {
    // Chart sizing
    stylesConfig,
    width,
    height,
    // Line Chart Props
    series,
    onCursor,
    isTWAP,
    curve: _curve,
    children,
    yTickFormat,
    common,
    accessors,
    utils,
  } = props;
  const { getX, getY, bisectSeason } = accessors;
  const { generateScale, getCurve } = utils;

  // When positioning the circle that accompanies the cursor,
  // use this dataset to decide where it goes. (There is one
  // circle but potentially multiple series).
  const data = series[0];
  const curve = useMemo(() => getCurve(_curve), [getCurve, _curve]);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  } = useTooltip<BaseDataPoint[] | undefined>();

  // Scales
  const scales = useMemo(
    () => generateScale(series, height, width, false, isTWAP),
    [generateScale, height, isTWAP, series, width]
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
    [scales, showTooltip, getY, onCursor, bisectSeason, data, series, getX]
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

  const { styles, getStyle } = useMemo(
    () => common.getChartStyles(stylesConfig),
    [common, stylesConfig]
  );

  // Empty state
  if (!series || series.length === 0) return null;

  // Derived
  const tooltipLeftAttached = tooltipData
    ? scales[0].xScale(getX(tooltipData[0]))
    : undefined;
  const dataRegion = {
    yTop: common.margin.top, // chart edge to data region first pixel
    yBottom:
      height - // chart edge to data region first pixel
      common.axisHeight - // chart edge to data region first pixel
      common.margin.bottom, // chart edge to data region first pixel
  };

  return (
    <>
      <svg width={width} height={height}>
        {/**
         * Lines
         */}
        <Group
          width={width - common.yAxisWidth}
          height={dataRegion.yBottom - dataRegion.yTop}
        >
          {isTWAP && (
            <Line
              from={{ x: 0, y: scales[0].yScale(1) }}
              to={{ x: width - common.yAxisWidth, y: scales[0].yScale(1) }}
              stroke={BeanstalkPalette.grey}
              strokeWidth={0.5}
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
              stroke={getStyle('', index).stroke}
              strokeWidth={1}
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
            stroke={common.axisColor}
            tickFormat={xTickFormat}
            tickStroke={common.axisColor}
            tickLabelProps={common.xTickLabelProps}
            numTicks={xTickNum}
          />
        </g>
        <g transform={`translate(${width - 17}, 1)`}>
          <Axis
            key="axis"
            orientation={Orientation.right}
            scale={scales[0].yScale}
            stroke={common.axisColor}
            tickFormat={yTickFormat}
            tickStroke={common.axisColor}
            tickLabelProps={common.yTickLabelProps}
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
            {tooltipData.map((td, i) => {
              const tdTop = scales[i].yScale(getY(td));
              return (
                <circle
                  cx={tooltipLeftAttached}
                  cy={tdTop}
                  r={4}
                  fill="black"
                  fillOpacity={0.1}
                  stroke="black"
                  strokeOpacity={0.1}
                  strokeWidth={2}
                  pointerEvents="none"
                />
              );
            })}
          </g>
        )}
        {/* Overlay to handle tooltip.
         * Needs to be the last item to maintain mouse control. */}
        <Bar
          x={0}
          y={0}
          width={width - common.yAxisWidth}
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

const MultiLineChart: React.FC<MultiLineChartProps> = (props) => (
  <ChartPropProvider>
    {({ ...propProviderProps }) => (
      <ParentSize debounceTime={50}>
        {({ width: visWidth, height: visHeight }) => (
          <Graph
            width={visWidth}
            height={visHeight}
            {...props}
            {...propProviderProps}
          >
            {props.children}
          </Graph>
        )}
      </ParentSize>
    )}
  </ChartPropProvider>
);

export default MultiLineChart;

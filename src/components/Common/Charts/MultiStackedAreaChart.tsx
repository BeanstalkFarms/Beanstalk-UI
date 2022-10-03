import React, { useCallback, useMemo } from 'react';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { AreaStack, Line, LinePath } from '@visx/shape';
import { Group } from '@visx/group';

import { CurveFactory } from 'd3-shape';
import { LinearGradient } from '@visx/gradient';
import BigNumber from 'bignumber.js';
import { Axis, Orientation, TickFormatter } from '@visx/axis';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { NumberLike } from '@visx/scale';
import { localPoint } from '@visx/event';
import { curveLinear } from '@visx/curve';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import {
  CURVES,
  DataRegion,
  Scale,
} from '~/components/Common/Charts/LineChart';
import { displayBN } from '~/util';
import ChartPropProvider, {
  BaseDataPoint,
  ProvidedChartProps,
} from './ChartPropProvider';

export type ChartMultiStyles = {
  [key: string]: {
    stroke: string; // stroke color
    fillPrimary: string; // gradient 'to' color
    fillSecondary?: string; // gradient 'from' color
    strokeWidth?: number;
  };
};

export type ChartMultiProps = {
  curve?: CurveFactory | keyof typeof CURVES;
  isTWAP?: boolean;
  stylesConfig?: ChartMultiStyles;
  onCursor?: (dps?: BaseDataPoint | BaseDataPoint[]) => void;
  children?: (
    props: GraphProps & {
      scales: Scale[];
      dataRegion: DataRegion;
    }
  ) => React.ReactElement | null;
  tooltip?: boolean | (({ d }: { d?: BaseDataPoint }) => JSX.Element);
  tooltipComponent?: ({ d }: { d: BaseDataPoint }) => JSX.Element;
  yTickFormat?: TickFormatter<NumberLike>;
};

export type MultiStackedAreaChartProps = {
  series: BaseDataPoint[][];
  keys: string[];
} & Omit<ChartMultiProps, 'children'>;

type GraphProps = {
  width: number;
  height: number;
} & MultiStackedAreaChartProps &
  ProvidedChartProps;

function Graph<T extends BaseDataPoint>(props: GraphProps) {
  const {
    // Chart sizing
    width,
    height,
    // Line Chart Props
    // tooltipComponent,
    series,
    curve,
    keys,
    onCursor,
    isTWAP,
    stylesConfig,
    common,
    accessors, // memoized accessor fns
    utils,
  } = props;
  const { getX, getY0, getY, getY1, bisectSeason } = accessors;
  const { generateScale, generatePathFromStack } = utils;
  const { defaultChartStyles } = common;
  // const data = series.length ? series : []

  const data = useMemo(
    () => (series.length && series[0]?.length ? series[0] : []),
    [series]
  );

  const scale = useMemo(
    () => generateScale(series, height, width, true, isTWAP)[0],
    [generateScale, series, height, width, isTWAP]
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
  } = useTooltip<BaseDataPoint | undefined>();

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
      const index = bisectSeason(data, x0, 1);
      const d0 = data[index - 1]; // value at x0 - 1
      const d1 = data[index]; // value at x0
      const d = (() => {
        if (d1 && getX(d1)) {
          return x0.valueOf() - getX(d0).valueOf() >
            getX(d1).valueOf() - x0.valueOf()
            ? d1
            : d0;
        }
        return d0;
      })();
      // console.log('d: ', d);
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
      scale,
      bisectSeason,
      data,
      showTooltip,
      onCursor,
      getX,
    ]
  );

  const xTickFormat = useCallback((_, i) => tickDates[i], [tickDates]);
  const yTickFormat = useCallback((val) => displayBN(new BigNumber(val)), []);

  const chartStyle = useMemo(() => {
    const style = stylesConfig || defaultChartStyles;
    const styles = Object.entries(style).map(
      ([k, { stroke, fillPrimary, fillSecondary }]) => {
        const primary = fillPrimary || stroke;
        const secondary = fillSecondary || fillPrimary;
        return { id: k, to: primary, from: secondary, stroke };
      }
    );
    const getStyle = (k: string, i: number) => {
      const _style = styles.find((s) => s.id === k);
      return _style || styles[Math.floor(i % styles.length)];
    };
    return { getStyle, styles };
  }, [defaultChartStyles, stylesConfig]);

  if (data.length === 0) return null;

  const dataRegion = {
    yTop: common.margin.top, // chart edge to data region first pixel
    yBottom:
      height - // chart edge to data region first pixel
      common.axisHeight - // chart edge to data region first pixel
      common.margin.bottom - // chart edge to data region first pixel
      common.strokeBuffer,
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
          width={width - common.yAxisWidth}
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
          <AreaStack<BaseDataPoint>
            top={common.margin.top}
            left={common.margin.left}
            keys={keys}
            data={data}
            height={height}
            x={(d) => scale.xScale(getX(d.data)) ?? 0}
            y0={(d) => scale.yScale(getY0(d)) ?? 0}
            y1={(d) => scale.yScale(getY1(d)) ?? 0}
          >
            {({ stacks, path }) =>
              stacks.map((stack, i) => (
                <>
                  <path
                    key={`stack-${stack.key}`}
                    d={path(stack) || ''}
                    stroke="transparent"
                    fill={`url(#${chartStyle.getStyle(`${stack.key}`, i).id})`}
                  />
                  <LinePath<BaseDataPoint>
                    stroke={chartStyle.getStyle(`${stack.key}`, i).stroke}
                    key={`line-${i}`}
                    curve={curveLinear}
                    data={generatePathFromStack(stack)}
                    x={(d) => scale.xScale(getX(d)) ?? 0}
                    y={(d) => scale.yScale(getY(d)) ?? 0}
                  />
                </>
              ))
            }
          </AreaStack>
        </Group>
        <g transform={`translate(0, ${dataRegion.yBottom})`}>
          <Axis
            key="axis"
            orientation={Orientation.bottom}
            scale={scale.xScale}
            stroke={common.axisColor}
            tickFormat={xTickFormat}
            tickStroke={common.axisColor}
            tickLabelProps={common.xTickLabelProps}
            tickValues={tickSeasons}
          />
        </g>
        <g transform={`translate(${width - 17}, 1)`}>
          <Axis
            key="axis"
            orientation={Orientation.right}
            scale={scale.yScale}
            stroke={common.axisColor}
            tickFormat={yTickFormat}
            tickStroke={common.axisColor}
            tickLabelProps={common.yTickLabelProps}
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
        {/* {tooltipData && tooltipComponent && (
          <div>
            <TooltipInPortal
              key={Math.random()}
              left={tooltipLeft}
              top={tooltipTop}
            >
              {tooltipComponent({ d: tooltipData })}
            </TooltipInPortal>
          </div>
        )} */}
      </svg>
    </div>
  );
}

// ------------------------
//       Stacked Area Chart
// ------------------------

const MultiStackedAreaChart: React.FC<MultiStackedAreaChartProps> = (props) => (
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

export default MultiStackedAreaChart;

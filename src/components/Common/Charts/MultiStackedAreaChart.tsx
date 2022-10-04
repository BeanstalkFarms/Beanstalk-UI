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
import { Stack, Typography } from '@mui/material';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import {
  CURVES,
  DataRegion,
  Scale,
} from '~/components/Common/Charts/LineChart';
import { displayBN } from '~/util';
import ChartPropProvider, {
  BaseDataPoint,
  ChartMultiStyles,
  ProvidedChartProps,
} from './ChartPropProvider';
import Row from '../Row';

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

function Graph(props: GraphProps) {
  const {
    // Chart sizing
    width,
    height,
    // props
    series,
    curve: _curve,
    keys,
    onCursor,
    isTWAP,
    stylesConfig,
    // chart prop provider
    common,
    accessors,
    utils,
  } = props;
  const { getX, getY0, getY, getY1 } = accessors;
  const { generateScale, generatePathFromStack, getPointerValue, getCurve } =
    utils;

  const curveType = useMemo(() => getCurve(_curve), [_curve, getCurve]);

  const data = useMemo(
    () => (series.length && series[0]?.length ? series[0] : []),
    [series]
  );

  const scales = useMemo(
    () => generateScale(series, height, width, true, isTWAP),
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

  const { TooltipInPortal, containerBounds, containerRef } = useTooltipInPortal(
    { scroll: true, detectBounds: true }
  );

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  } = useTooltip<BaseDataPoint | undefined>();

  const handleMouseLeave = useCallback(() => {
    hideTooltip();
    onCursor?.(undefined);
  }, [hideTooltip, onCursor]);

  const handlePointerMove = useCallback(
    (
      event: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>
    ) => {
      const { left, top } = containerBounds;
      const containerX = ('clientX' in event ? event.clientX : 0) - left;
      const containerY = ('clientY' in event ? event.clientY : 0) - top;
      const pointerData = getPointerValue(event, scales, series);

      showTooltip({
        tooltipLeft: containerX,
        tooltipTop: containerY,
        tooltipData: pointerData[0],
      });
      onCursor?.(pointerData[0]);
    },
    [containerBounds, series, getPointerValue, onCursor, scales, showTooltip]
  );

  const xTickFormat = useCallback((_, i) => tickDates[i], [tickDates]);
  const yTickFormat = useCallback((val) => displayBN(new BigNumber(val)), []);

  const { styles, getStyle } = useMemo(() => {
    const { getChartStyles } = common;
    return getChartStyles(stylesConfig);
  }, [common, stylesConfig]);

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
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          bottom: dataRegion.yTop,
          left: 0,
          width: width - common.yAxisWidth,
          height: dataRegion.yBottom - dataRegion.yTop,
          zIndex: 9,
        }}
        ref={containerRef}
        onTouchStart={handlePointerMove}
        onTouchMove={handlePointerMove}
        onMouseMove={handlePointerMove}
        onMouseLeave={handleMouseLeave}
      />
      <svg width={width} height={height}>
        <Group
          width={width - common.yAxisWidth}
          height={dataRegion.yBottom - dataRegion.yTop}
        >
          {styles.map((s) => (
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
            x={(d) => scales[0].xScale(getX(d.data)) ?? 0}
            y0={(d) => scales[0].yScale(getY0(d)) ?? 0}
            y1={(d) => scales[0].yScale(getY1(d)) ?? 0}
          >
            {({ stacks, path }) =>
              stacks.map((stack, i) => (
                <>
                  <path
                    key={`stack-${stack.key}`}
                    d={path(stack) || ''}
                    stroke="transparent"
                    fill={`url(#${getStyle(`${stack.key}`, i).id})`}
                  />
                  <LinePath<BaseDataPoint>
                    stroke={getStyle(`${stack.key}`, i).stroke}
                    key={`line-${i}`}
                    curve={curveType}
                    data={generatePathFromStack(stack)}
                    x={(d) => scales[0].xScale(getX(d)) ?? 0}
                    y={(d) => scales[0].yScale(getY(d)) ?? 0}
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
            scale={scales[0].xScale}
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
            scale={scales[0].yScale}
            stroke={common.axisColor}
            tickFormat={yTickFormat}
            tickStroke={common.axisColor}
            tickLabelProps={common.yTickLabelProps}
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
                <Stack gap={0.5} width="200px">
                  {keys.map((key) => (
                    <Row justifyContent="space-between">
                      <Typography>{key}</Typography>
                      <Typography textAlign="right">
                        {tooltipData[key]}
                      </Typography>
                    </Row>
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

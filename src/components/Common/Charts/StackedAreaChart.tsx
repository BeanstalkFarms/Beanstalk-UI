import React, { useCallback, useMemo } from 'react';
import { AreaStack, Line, LinePath } from '@visx/shape';
import { Group } from '@visx/group';

import { LinearGradient } from '@visx/gradient';
import BigNumber from 'bignumber.js';
import { Axis, Orientation } from '@visx/axis';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { Box, Stack, Typography } from '@mui/material';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { BeanstalkPalette } from '~/components/App/muiTheme';

import { displayBN } from '~/util';
import ChartPropProvider, {
  BaseChartProps,
  BaseDataPoint,
  ProviderChartProps,
} from './ChartPropProvider';
import Row from '../Row';
import { defaultValueFormatter } from './SeasonPlot';
import useTokenMap from '~/hooks/chain/useTokenMap';
import { SILO_WHITELIST } from '~/constants/tokens';

type Props = {
  width: number;
  height: number;
} & BaseChartProps &
  ProviderChartProps;

const Graph = (props: Props) => {
  const siloTokens = useTokenMap(SILO_WHITELIST);
  const {
    // Chart sizing
    width,
    height,
    // props
    series,
    curve: _curve,
    keys,
    tooltip = false,
    isTWAP,
    stylesConfig,
    children,
    onCursor,
    getDisplayValue,
    formatValue = defaultValueFormatter,
    // chart prop provider
    common,
    accessors,
    utils,
  } = props;
  const { getX, getY0, getY, getY1, getYByAsset } = accessors;
  const { generateScale, generatePathFromStack, getPointerValue, getCurve } =
    utils;

  // get curve type
  const curveType = useMemo(() => getCurve(_curve), [_curve, getCurve]);

  // data for stacked area chart will always be T[];
  const data = useMemo(
    () => (series.length && series[0]?.length ? series[0] : []),
    [series]
  );

  // generate scales
  const scales = useMemo(
    () => generateScale(series, height, width, keys, true, isTWAP),
    [generateScale, series, height, width, isTWAP, keys]
  );

  // generate ticks
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

  // tooltip
  const { containerRef, containerBounds, TooltipInPortal } = useTooltipInPortal(
    {
      scroll: true,
      detectBounds: true
    }
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
      const containerX = ('clientX' in event ? event.clientX : 0) - containerBounds.left;
      const containerY = ('clientY' in event ? event.clientY : 0) - containerBounds.top - 10;
      const pointerData = getPointerValue(event, scales, series)[0];

      showTooltip({
        tooltipLeft: containerX,
        tooltipTop: containerY,
        tooltipData: pointerData,
      });
      onCursor?.(pointerData.season, getDisplayValue([pointerData]));
    },
    [containerBounds, getPointerValue, scales, series, showTooltip, onCursor, getDisplayValue]
  );

  const tooltipLeftAttached = tooltipData ? scales[0].xScale(getX(tooltipData)) : undefined;

  // tick format + styles
  const xTickFormat = useCallback((_: any, i: number) => tickDates[i], [tickDates]);
  const yTickFormat = useCallback((val: any) => displayBN(new BigNumber(val)), []);

  // styles are defined in ChartPropProvider as defaultChartStyles
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

  /**
   * Gets the Y value for the line that borders
   * the top of each stacked area.
   */
  const getLineHeight = (d: BaseDataPoint, tokenAddr: string) => {
    if (d[tokenAddr] === 0) return 0;
    const indexOfToken = keys.indexOf(tokenAddr);
    return keys.reduce<number>((prev, curr, currentIndex) => {
      if (currentIndex <= indexOfToken) {
        prev += d[curr];
        return prev;
      }
      return prev;
    }, 0);
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
          <>
            {/* <LinearGradient */}
            {/*  to={styles[index]?.to} */}
            {/*  from={styles[index]?.from} */}
            {/*  toOpacity={1} */}
            {/*  fromOpacity={1} */}
            {/*  id={key} */}
            {/* /> */}
            <rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="transparent"
              rx={14}
            />
            {children && children({ scales, dataRegion, ...props })}
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
                stacks.map((stack, _index) => (
                  <>
                    <LinearGradient
                      to={styles[stack.index]?.to}
                      from={styles[stack.index]?.from}
                      toOpacity={1}
                      fromOpacity={1}
                      id={stack.key.toString()}
                        />
                    <path
                      key={`stack-${stack.key}`}
                      d={path(stack) || ''}
                      stroke="transparent"
                      fill={`url(#${stack.key.toString()})`}
                        />
                    <LinePath<BaseDataPoint>
                      stroke={styles[stack.index]?.stroke}
                      strokeWidth={1}
                      key={`${stack.key.toString()}`}
                      curve={curveType}
                      data={data}
                      x={(d) => scales[0].xScale(getX(d)) ?? 0}
                      y={(d) => scales[0].yScale(getLineHeight(d, stack.key.toString())) ?? 0}
                        />
                    {/* {keys.length > 1 && tooltipData && ( */}
                    {/*  <circle */}
                    {/*    cx={tooltipLeftAttached} */}
                    {/*    cy={(d) => scales[0].yScale(getYByAsset(d, stack.key.toString())) ?? 0} */}
                    {/*    r={2} */}
                    {/*    fill="black" */}
                    {/*    fillOpacity={0.1} */}
                    {/*    stroke="black" */}
                    {/*    strokeOpacity={0.1} */}
                    {/*    strokeWidth={1} */}
                    {/*    pointerEvents="none" */}
                    {/*  /> */}
                    {/* )} */}
                  </>
                    )
                )
              }
            </AreaStack>
          </>
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
            {/* only show vertical cursor line if there is one stack */}
            {/* {keys.length === 1 && ( */}
            <g>
              <Line
                from={{ x: tooltipLeft, y: dataRegion.yTop }}
                to={{ x: tooltipLeft, y: dataRegion.yBottom }}
                stroke={BeanstalkPalette.lightGrey}
                strokeWidth={1}
                pointerEvents="none"
              />
            </g>
            {/* )} */}
            {tooltip ? (
              <div>
                <TooltipInPortal
                  key={Math.random()}
                  left={tooltipLeft}
                  top={tooltipTop}
                >
                  {typeof tooltip === 'boolean' ? (
                    <Stack gap={0.5}>
                      {keys.map((key, index) => (
                        <Row justifyContent="space-between" gap={2}>
                          <Row gap={1}>
                            <Box
                              sx={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: getStyle(key, index).to,
                                border: 1,
                                borderColor: getStyle(key, index).stroke
                              }}
                            />
                            <Typography>{siloTokens[key]?.symbol}</Typography>
                          </Row>
                          <Typography textAlign="right">
                            {formatValue(tooltipData[key])}
                          </Typography>
                        </Row>
                      ))}
                    </Stack>
                  ) : (
                    tooltip({ d: [tooltipData] })
                  )}
                </TooltipInPortal>
              </div>
            ) : null}
          </>
        )}
      </svg>
    </div>
  );
};

// For reference on how to use this chart, refer to BeanVs3Crv.tsx
const StackedAreaChart: React.FC<BaseChartProps> = (props) => (
  <ChartPropProvider>
    {({ ...providerProps }) => (
      <ParentSize debounceTime={50}>
        {({ width: visWidth, height: visHeight }) => (
          <Graph
            width={visWidth}
            height={visHeight}
            {...providerProps}
            {...props}
          />
        )}
      </ParentSize>
    )}
  </ChartPropProvider>
);

export default StackedAreaChart;

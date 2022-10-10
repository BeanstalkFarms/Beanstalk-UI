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

type Props = {
  width: number;
  height: number;
} & BaseChartProps &
  ProviderChartProps;

const Graph = (props: Props) => {
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
  const { getX, getY0, getY, getY1 } = accessors;
  const { generateScale, generatePathFromStack, getPointerValue, getCurve } =
    utils;

  // get curve type
  const curveType = useMemo(() => getCurve(_curve), [_curve, getCurve]);

  // data for stacked area chart will always be T[];
  const data = useMemo(
    () => (series.length && series[0]?.length ? series[0] : []),
    [series]
  );

  console.log('data: ', data);

  // generate scales
  const scales = useMemo(
    () => generateScale(series, height, width, true, isTWAP),
    [generateScale, series, height, width, isTWAP]
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
      const pointerData = getPointerValue(event, scales, series)[0];

      showTooltip({
        tooltipLeft: containerX,
        tooltipTop: containerY,
        tooltipData: pointerData,
      });
      onCursor?.(pointerData.season, getDisplayValue([pointerData]));
    },
    [
      containerBounds,
      getPointerValue,
      scales,
      series,
      showTooltip,
      onCursor,
      getDisplayValue,
    ]
  );

  // tick format + styles
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
            {tooltip ? (
              <div>
                <TooltipInPortal
                  key={Math.random()}
                  left={tooltipLeft}
                  top={tooltipTop}
                >
                  {typeof tooltip === 'boolean' ? (
                    <Stack gap={0.5}>
                      {keys.map((key, i) => (
                        <Row justifyContent="space-between" gap={2}>
                          <Row gap={1}>
                            <Box
                              sx={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: getStyle(key, i).stroke,
                              }}
                            />
                            <Typography>{key}</Typography>
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

const StackedAreaGraph: React.FC<BaseChartProps> = (props) => (
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

export default StackedAreaGraph;

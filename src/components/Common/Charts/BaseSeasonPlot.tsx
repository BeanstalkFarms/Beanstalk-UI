import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { TimeTabStateParams } from '~/hooks/app/useTimeTabState';
import useGenerateChartSeries, {
  SeasonsQueryItem,
} from '~/hooks/beanstalk/useGenerateChartSeries';
import { MinimumViableSnapshotQuery } from '~/hooks/beanstalk/useSeasonsQuery';

import Row from '../Row';
import Stat, { StatProps } from '../Stat';
import { defaultValueFormatter } from './SeasonPlot';
import TimeTabs from './TimeTabs';
import { BaseChartProps, BaseDataPoint } from './ChartPropProvider';
import MultiLineGraph, {
  LineChartGetDisplayValue,
  LineChartTooltip,
} from './MultiLineChart';
import StackedAreaGraph, {
  StackedAreaDisplayValue,
  StackedAreaTooltip,
} from './StackedAreaGraph';

type BaseSeasonPlotProps = {
  /**
   * The value displayed when the chart isn't being hovered.
   * If not provided, uses the `value` of the last data point if available,
   * otherwise returns 0.
   */
  defaultValue?: number;
  /**
   * The season displayed when the chart isn't being hovered.
   * If not provided, uses the `season` of the last data point if available,
   * otherwise returns 0.
   */
  defaultSeason?: number;
  /**
   * Height applied to the chart range. Can be a fixed
   * pixel number or a percent if the parent element has a constrained height.
   */
  height?: number | string;
  /**
   * True if this plot should be a StackedAreaChart
   */
  stackedArea?: boolean;
  /**
   *
   */
  timeTabParams: TimeTabStateParams;
};

type Props<T extends MinimumViableSnapshotQuery> = BaseSeasonPlotProps & {
  queryData: SeasonsQueryItem<T>[];
  formatValue?: (value: number) => string | JSX.Element;
  StatProps?: Omit<StatProps, 'amount' | 'subtitle'>;
  ChartProps: Omit<BaseChartProps, 'series' | 'keys'>;
};

function BaseSeasonPlot<T extends MinimumViableSnapshotQuery>(props: Props<T>) {
  const {
    //
    queryData,
    // season plot base props
    defaultValue: _defaultValue,
    defaultSeason: _defaultSeason,
    height = '175px',
    stackedArea = false,
    formatValue = defaultValueFormatter,
    // stat props
    StatProps: statProps, // renamed to prevent type collision
    ChartProps: chartProps,
    timeTabParams,
  } = props;
  /// Display values
  const [displayValue, setDisplayValue] = useState<number | undefined>(
    undefined
  );
  const [displaySeason, setDisplaySeason] = useState<number | undefined>(
    undefined
  );

  const {
    data: series,
    loading,
    error,
    keys,
  } = useGenerateChartSeries(queryData, timeTabParams[0], stackedArea);

  const handleCursor = useCallback(
    (season: number | undefined, v?: number | undefined) => {
      if (!season || !v) {
        setDisplaySeason(undefined);
        setDisplayValue(undefined);
        return;
      }
      setDisplaySeason(season);
      setDisplayValue(v);
    },
    []
  );

  const seriesInput = useMemo(() => series, [series]);

  /// If one of the defaults is missing, use the last data point.
  const defaults = useMemo(() => {
    let defaultValue = _defaultValue ?? 0;
    let defaultSeason = _defaultSeason ?? 0;
    let getVal = chartProps.getDisplayValue;
    if ((!defaultValue || !defaultSeason) && seriesInput.length) {
      if (stackedArea) {
        getVal = getVal as (v: BaseDataPoint) => number;
        const _seriesInput = seriesInput[seriesInput.length - 1];
        if (_seriesInput.length) {
          defaultValue = getVal(_seriesInput[_seriesInput.length - 1]);
          defaultSeason = _seriesInput[seriesInput.length - 1].season;
        }
      } else {
        getVal = getVal as (v: BaseDataPoint[]) => number;
        if (seriesInput.every((s) => 'season' in s)) {
          const lineSeriesInput = seriesInput.map((s) => s[s.length - 1]);
          defaultValue = getVal(lineSeriesInput);
          defaultSeason = lineSeriesInput[lineSeriesInput.length - 1].season;
        }
      }
    }

    return { defaultValue, defaultSeason };
  }, [_defaultSeason, _defaultValue, chartProps, seriesInput, stackedArea]);

  return (
    <>
      <Row justifyContent="space-between" sx={{ px: 2 }}>
        {statProps ? (
          <Stat
            {...statProps}
            amount={
              loading ? (
                <CircularProgress
                  variant="indeterminate"
                  size="1.18em"
                  thickness={5}
                />
              ) : (
                formatValue(displayValue ?? defaults.defaultValue)
              )
            }
            subtitle={`Season ${(displaySeason !== undefined
              ? displaySeason
              : defaults.defaultSeason
            ).toFixed()}`}
          />
        ) : null}
        <Stack
          alignItems="flex-end"
          alignSelf="flex-start"
          sx={{ py: statProps ? undefined : 2 }}
        >
          <TimeTabs state={timeTabParams[0]} setState={timeTabParams[1]} />
        </Stack>
      </Row>
      <Box width="100%" sx={{ height, position: 'relative' }}>
        {loading || seriesInput?.length === 0 || error ? (
          <Stack height="100%" alignItems="center" justifyContent="center">
            {error ? (
              <Typography>
                An error occurred while loading this data.
              </Typography>
            ) : (
              <CircularProgress variant="indeterminate" />
            )}
          </Stack>
        ) : stackedArea ? (
          <StackedAreaGraph
            series={seriesInput}
            keys={keys}
            onCursor={handleCursor}
            {...chartProps}
            getDisplayValue={
              chartProps.getDisplayValue as StackedAreaDisplayValue
            }
            tooltip={chartProps.tooltip as StackedAreaTooltip}
          />
        ) : (
          <MultiLineGraph
            series={seriesInput}
            keys={keys}
            onCursor={handleCursor}
            {...chartProps}
            tooltip={chartProps.tooltip as LineChartTooltip}
            getDisplayValue={
              chartProps.getDisplayValue as LineChartGetDisplayValue
            }
          />
        )}
      </Box>
    </>
  );
}
export default BaseSeasonPlot;

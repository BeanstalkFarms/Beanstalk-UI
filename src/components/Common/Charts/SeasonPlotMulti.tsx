import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { TimeTabStateParams } from '~/hooks/app/useTimeTabState';
import {
  MergeSeasonsQueryProps,
  useMergeSeasonsQueries,
} from '~/hooks/beanstalk/useMergeSeasonsQueries';
import { MinimumViableSnapshotQuery } from '~/hooks/beanstalk/useSeasonsQuery';

import Row from '../Row';
import Stat, { StatProps } from '../Stat';
import { defaultValueFormatter, SeasonPlotBaseProps } from './SeasonPlot';
import MultiStackedAreaChart, {
  ChartMultiProps,
} from './MultiStackedAreaChart';
import TimeTabs from './TimeTabs';
import { BaseDataPoint } from './ChartPropProvider';

type SeasonPlotMultiBaseProps<
  T extends BaseDataPoint,
  K extends MinimumViableSnapshotQuery
> = Omit<SeasonPlotBaseProps, 'document'> & {
  queryData: MergeSeasonsQueryProps<K>[];
} & { timeTabParams: TimeTabStateParams } & {
  ChartProps?: ChartMultiProps<T>;
} & {
  formatStat?: (value: number) => string | JSX.Element;
  StatProps?: Omit<StatProps, 'amount' | 'subtitle'>;
  updateDisplayValue?: (d?: T) => number;
};

export default function SeasonPlotMulti<
  T extends BaseDataPoint,
  K extends MinimumViableSnapshotQuery
>({
  // use mergeSeasonsQueries
  queryData,
  // season plot base props
  defaultValue: _defaultValue,
  defaultSeason: _defaultSeason,
  height = '175px',
  stackedArea,
  // stat props
  formatStat = defaultValueFormatter,
  updateDisplayValue,
  StatProps: statProps, // renamed to prevent type collision
  ChartProps: chartProps,
  timeTabParams,
}: SeasonPlotMultiBaseProps<T, K>) {
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
  } = useMergeSeasonsQueries(queryData, timeTabParams[0], stackedArea);

  const handleCursor = useCallback(
    (dps?: T) => {
      setDisplaySeason(dps ? dps.season : undefined);
      if (updateDisplayValue) {
        setDisplayValue(updateDisplayValue(dps));
      } else {
        setDisplayValue(dps ? dps.value : undefined);
      }
    },
    [updateDisplayValue]
  );

  /// If one of the defaults is missing, use the last data point.
  const defaultValue = _defaultValue || 0;
  const defaultSeason = _defaultSeason || 0;

  const seriesInput = useMemo(() => {
    if (stackedArea) return (series.length ? series[0] : []) as T[];
    return series as T[][];
  }, [series, stackedArea]);

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
                formatStat(displayValue ?? defaultValue)
              )
            }
            subtitle={`Season ${(displaySeason !== undefined
              ? displaySeason
              : defaultSeason
            ).toFixed()}`}
          />
        ) : null}
        <Stack
          alignItems="flex-end"
          alignSelf="flex-start"
          width="100%"
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
          <MultiStackedAreaChart
            series={seriesInput as T[]}
            keys={keys}
            onCursor={handleCursor}
            {...chartProps}
          />
        ) : null}
      </Box>
    </>
  );
}

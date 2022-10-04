import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { Line } from '@visx/shape';
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
import MultiLineChart from './MultiLineChart';
import { BeanstalkPalette } from '~/components/App/muiTheme';

type StatPropsMulti = {
  StatProps?: Omit<StatProps, 'amount' | 'subtitle'>;
  getStatValue: (d: BaseDataPoint | BaseDataPoint[]) => number;
  formatStat?: (value: number) => string | JSX.Element;
};

type SeasonPlotMultiBaseProps<K extends MinimumViableSnapshotQuery> = Omit<
  SeasonPlotBaseProps,
  'document'
> &
  StatPropsMulti & {
    queryData: MergeSeasonsQueryProps<K>[];
    ChartProps?: ChartMultiProps;
    timeTabParams: TimeTabStateParams;
    // formatStat?: (value: number) => string | JSX.Element;
    // updateDisplayValue?: (d?: BaseDataPoint) => number;
  };

export default function SeasonPlotMulti<T extends MinimumViableSnapshotQuery>({
  // use mergeSeasonsQueries
  queryData,
  // season plot base props
  defaultValue: _defaultValue,
  defaultSeason: _defaultSeason,
  height = '175px',
  stackedArea,
  // stat props
  getStatValue,
  formatStat = defaultValueFormatter,
  StatProps: statProps, // renamed to prevent type collision
  ChartProps: chartProps,
  timeTabParams,
}: SeasonPlotMultiBaseProps<T>) {
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
    (dps?: BaseDataPoint | BaseDataPoint[]) => {
      if (!dps) {
        setDisplaySeason(undefined);
        setDisplayValue(undefined);
        return;
      }
      if (Array.isArray(dps)) {
        // dps.length && setDisplaySeason(dps[0].season);
      } else if (dps.season) {
        // dps.season && setDisplaySeason(dps.season);
      }
      setDisplayValue(getStatValue(dps));
    },
    [getStatValue]
  );

  const seriesInput = useMemo(() => series, [series]);

  /// If one of the defaults is missing, use the last data point.
  const defaults = (() => {
    const defaultValue = _defaultValue || 0;
    const defaultSeason = _defaultSeason || 0;

    if (!defaultValue || !defaultSeason) {
      if (stackedArea && seriesInput.length) {
        const _seriesInput = seriesInput[0];
        // defaultValue = getStatValue(_seriesInput[seriesInput.length - 1]);
        // defaultSeason = _seriesInput[seriesInput.length - 1].season;
      } else if (seriesInput.length > 0) {
        if (seriesInput.every((s) => 'season' in s)) {
          // const lineSeriesInput = seriesInput.map((s) => s[s.length - 1]);
          // console.log('lineseriesinput: ', lineSeriesInput);
          // defaultValue = getStatValue(lineSeriesInput);
          // defaultSeason = lineSeriesInput[lineSeriesInput.length - 1].season;
        }
      }
    }

    return { defaultValue, defaultSeason };
  })();

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
                formatStat(displayValue ?? defaults.defaultValue)
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
          <MultiStackedAreaChart
            series={seriesInput}
            keys={keys}
            onCursor={handleCursor}
            {...chartProps}
          />
        ) : (
          <MultiLineChart
            series={seriesInput}
            keys={keys}
            onCursor={handleCursor}
            {...chartProps}
          >
            {(props) => {
              if (!props.scales.length) return null;
              const x = props.scales[0].xScale(6074) as number;
              return x ? (
                <Line
                  from={{ x, y: props.dataRegion.yTop }}
                  to={{ x, y: props.dataRegion.yBottom }}
                  stroke={BeanstalkPalette.logoGreen}
                  strokeDasharray={4}
                  strokeDashoffset={2}
                  strokeWidth={1}
                />
              ) : null;
            }}
          </MultiLineChart>
        )}
      </Box>
    </>
  );
}

import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { TimeTabStateParams } from '~/hooks/app/useTimeTabState';
import { useMergeSeasonsQueries } from '~/hooks/beanstalk/useMergeSeasonsQueries';
import { SeasonRange } from '~/hooks/beanstalk/useSeasonsQuery';

import { secondsToDate } from '~/util';
import Row from '../Row';
import Stat, { StatProps } from '../Stat';
import { defaultValueFormatter, SeasonPlotBaseProps } from './SeasonPlot';
import MultiStackedAreaChart, { ChartMultiProps } from './MultiStackedAreaChart';
import TimeTabs from './TimeTabs';
import { BaseDataPoint } from './ChartPropProvider';

type SeasonPlotMultiBaseProps<T extends BaseDataPoint> = (
  Omit<SeasonPlotBaseProps, 'document'> 
  & ReturnType<typeof useMergeSeasonsQueries> 
  & {
    formatStat?: (value: number) => string | JSX.Element;
    StatProps?: Omit<StatProps, 'amount' | 'subtitle'>; 
  }
  & { timeTabState: TimeTabStateParams }
  & { ChartProps?: ChartMultiProps<T> }
);

const useMaxSeasonsWithRange = (range: SeasonRange) =>
  useMemo(() => {
    const perDay = 24;
    const perWeek = perDay * 7;
    const perMonth = perDay * 30;
    switch (range) {
      case SeasonRange.WEEK: {
        return perWeek;
      }
      case SeasonRange.MONTH: {
        return perMonth;
      }
      default:
        return undefined;
    }
  }, [range]);

export default function SeasonPlotMulti<T extends BaseDataPoint>({
  // use mergeSeasonsQueries
  data: _data,
  loading,
  error,
  keys,
  // season plot base props
  defaultValue: _defaultValue,
  defaultSeason: _defaultSeason,
  height = '175px',
  stackedArea,
  // stat props
  formatStat = defaultValueFormatter,
  StatProps: statProps, // renamed to prevent type collision
  ChartProps: chartProps,
  timeTabState,
}: SeasonPlotMultiBaseProps<T>) {
  /// Display values
  const [displayValue, setDisplayValue] = useState<number | undefined>(
    undefined
  );
  const [displaySeason, setDisplaySeason] = useState<number | undefined>(
    undefined
  );
  const maxSeasons = useMaxSeasonsWithRange(timeTabState[0][1]);

  const series = useMemo(() => {
    const data = _data && _data.length ? _data[0] : undefined;

    console.debug(
      `[SeasonPlot] Building series with ${data?.length || 0} data points`,
      data
    );
    const points: T[] = [];
    if (!data || !data.length) return [points];
    
    const currSeason = data[data.length - 1].season;
    const minSeason =
      currSeason && maxSeasons ? currSeason - maxSeasons : undefined;
    const lastIndex = data.length - 1;
    // if (timeTabState[0][0] === SeasonAggregation.DAY) {
    //   let v = 0; // value aggregator
    //   let i = 0; // total iterations
    //   let j = 0; // points averaged into this day
    //   let d : Date | undefined; // current date for this avg
    //   let s : number | undefined; // current season for this avg
    //   for (let k = lastIndex; k >= 0; k -= 1) {
    //     const season = data[k];
    //     if (!season) continue; // skip empty points
    //     v += getValue(season);
    //     if (j === 0) {
    //       d = secondsToDate(season.timestamp);
    //       s = season.season as number;
    //       j += 1;
    //     } else if (
    //       i === lastIndex // last iteration
    //       || j === 24 // full day of data ready
    //     ) {
    //       points.push({
    //         season: s as number,
    //         date:   d as Date,
    //         value:  new BigNumber(v).div(j + 1).toNumber()
    //       });
    //       v = 0;
    //       j = 0;
    //     } else {
    //       j += 1;
    //     }
    //     i += 1;
    //   }
    // }

    for (const season of data) {
      if (!season) continue;
      // if data.season is less than minimum season, ignore data
      if (minSeason && season.season < minSeason) continue;
      points.push({
        ...season,
        season: season.season as number,
        date: secondsToDate(season.timestamp),
      });
    }
    return [points];
  }, [_data, maxSeasons]);

  const handleCursor = useCallback((dps?: T) => {
    setDisplaySeason(dps ? dps.season : undefined);
    setDisplayValue(dps ? dps.value : undefined);
  }, []);

  /// If one of the defaults is missing, use the last data point.
  const defaultValue = _defaultValue || 0;
  const defaultSeason = _defaultSeason || 0;

  const seriesInput = useMemo(() => series, [series]);

  return (
    <>
      <Row justifyContent="space-between" sx={{ px: 2 }}>
        {statProps ? (
          <Stat
            {...statProps}
            title="sup"
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
          <TimeTabs state={timeTabState[0]} setState={timeTabState[1]} />
        </Stack>
      </Row>
      <Box width="100%" sx={{ height, position: 'relative' }}>
        {loading || series?.length === 0 || error ? (
          <Stack height="100%" alignItems="center" justifyContent="center">
            {error ? (
              <Typography>
                An error occurred while loading this data.
              </Typography>
            ) : (
              <CircularProgress variant="indeterminate" />
            )}
          </Stack>
        ) : (
          <MultiStackedAreaChart
            series={seriesInput}
            keys={keys}
            onCursor={handleCursor}
            // {...lineChartProps}
          />
        )}
      </Box>
    </>
  );
}
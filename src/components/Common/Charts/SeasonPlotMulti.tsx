import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { TimeTabStateParams } from '~/hooks/app/useTimeTabState';
import { useMergeSeasonsQueries } from '~/hooks/beanstalk/useMergeSeasonsQueries';

import { secondsToDate } from '~/util';
import Row from '../Row';
import Stat, { StatProps } from '../Stat';
import { LineChartProps } from './LineChart';
import { SeasonDataPoint, SeasonPlotBaseProps } from './SeasonPlot';
import StackedAreaChart2, { BaseMultiDataPoint } from './StackedAreaChart2';
import TimeTabs from './TimeTabs';

type MultiDataPoint = Required<Omit<SeasonDataPoint, 'value'>>;

export type SeasonMultiDataPoint<T extends MultiDataPoint> = T;

type PlotStatProps =
  | (Omit<StatProps, 'amount' | 'subtitle'> & {
      formatStat: (value: number) => string | JSX.Element;
    })
  | { formatStat: never };

type SeasonPlotMultiBaseProps = Omit<SeasonPlotBaseProps, 'document'> &
  ReturnType<typeof useMergeSeasonsQueries> & {
    formatValue?: (value: number) => string | JSX.Element;
    timeTabState: TimeTabStateParams;
    StatProps?: PlotStatProps;
    LineChartProps?: Pick<LineChartProps, 'curve' | 'isTWAP'>;
  };

export default function SeasonPlotMulti<T extends BaseMultiDataPoint>({
  data,
  loading,
  error,
  keys,
  defaultValue: _defaultValue,
  defaultSeason: _defaultSeason,
  formatValue,
  height = '175px',
  StatProps: statProps, // renamed to prevent type collision
  LineChartProps: lineChartProps, // renamed to prevent type collision,
  stackedArea,
  timeTabState,
}: SeasonPlotMultiBaseProps) {
  /// Display values
  const [displayValue, setDisplayValue] = useState<number | undefined>(
    undefined
  );
  const [displaySeason, setDisplaySeason] = useState<number | undefined>(
    undefined
  );

  const series = useMemo(() => {
    const points: T[] = [];
    if (!data) return points;
    const lastIndex = data?.length;

    // if (timeTabState[0][0] === SeasonAggregation.DAY) {

    // } else {
    for (const season of data) {
      if (!season) continue;
      points.push({
        ...season,
        season: season.season as number,
        date: secondsToDate(season.timestamp),
      });
    }
    return points;
  }, [data]);

  /// If one of the defaults is missing, use the last data point.
  const defaultValue = _defaultValue || 0;
  const defaultSeason = _defaultSeason || 0;

  const seriesInput = useMemo(() => [series], [series]);

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
                statProps.formatStat(displayValue ?? defaultValue)
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
        {loading || series.length === 0 || error ? (
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
          <StackedAreaChart2
            series={seriesInput}
            keys={keys}
            {...lineChartProps}
          />
        )}
      </Box>
    </>
  );
}

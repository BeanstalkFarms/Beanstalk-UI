import { CircularProgress, Stack } from '@mui/material';
import React, { useState } from 'react';
import { TimeTabStateParams } from '~/hooks/app/useTimeTabState';
import { useMergeSeasonsQueries } from '~/hooks/beanstalk/useMergeSeasonsQueries';
import {
  MinimumViableSnapshotQuery,
} from '~/hooks/beanstalk/useSeasonsQuery';
import Row from '../Row';
import Stat, { StatProps } from '../Stat';
import { LineChartProps } from './LineChart';
import { SeasonDataPoint, SeasonPlotBaseProps, SeasonPlotValueProps } from './SeasonPlot';
import TimeTabs, { TimeTabState } from './TimeTabs';

export interface SeasonMultiDataPoint extends Omit<SeasonDataPoint, 'value'> {
  value: number[]
}

type PlotStatProps = 
  | { StatProps?: Omit<StatProps, 'amount' | 'subtitle'>; formatStat: (value: number) => string | JSX.Element }
  | { statProps: undefined; formatStat: never }

type SeasonPlotMultiBaseProps<T extends MinimumViableSnapshotQuery> = (
  Omit<SeasonPlotBaseProps, 'document'> 
  & ReturnType<typeof useMergeSeasonsQueries<T>>
  & { functions: SeasonPlotValueProps<T>[] }
  & { StatProps?: PlotStatProps }
  & { LineChartProps?: Pick<LineChartProps, 'curve' | 'isTWAP'> }
  & { plotToggles: TimeTabStateParams }
)

export type SeasonMultiBaseProps = {
  merged: any[];
  timeTabState: TimeTabState;
};

export default function SeasonMultiPlot<T extends MinimumViableSnapshotQuery>({
  data,
  loading, 
  error,
  defaultValue: _defaultValue,
  defaultSeason: _defaultSeason,
  functions,
  height = '175px',
  StatProps: statProps, // renamed to prevent type collision
  LineChartProps: lineChartProps, // renamed to prevent type collision,
  stackedArea,
  plotToggles,
}: SeasonPlotMultiBaseProps<T>) {
    /// Display values
    const [displayValue, setDisplayValue] = useState<number | undefined>(
      undefined
    );
    const [displaySeason, setDisplaySeason] = useState<number | undefined>(
      undefined
    );

  /// If one of the defaults is missing, use the last data point.
  const defaultValue = _defaultValue || 0;
  const defaultSeason = _defaultSeason || 0;

  return (
    <Row justifyContent="space-between" sx={{ px: 2 }}>
      {statProps ?
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
      /> : null}
      <Stack alignItems="right" alignSelf="flex-start">
        <TimeTabs state={plotToggles[0]} setState={plotToggles[1]} />
      </Stack>
    </Row>
  );
}

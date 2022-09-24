import React from 'react';
import { MergedSeasonsQueryData } from '~/hooks/beanstalk/useMergeSeasonsQueries';
import { MinimumViableSnapshotQuery, SnapshotData } from '~/hooks/beanstalk/useSeasonsQuery';
import { DataPoint } from './LineChart';
import { TimeTabState } from './TimeTabs';

export interface MultiDataPoint extends Omit<DataPoint, 'value'> {
  value: { [index: number]: number }[];
}

export interface SeasonMultiDataPoint<T extends MinimumViableSnapshotQuery> extends Omit<DataPoint, 'value'> {
  value: { [index: number]: SnapshotData<T>}[];
}

type SeasonMultiDataParams<T extends MinimumViableSnapshotQuery> = {
    values: MergedSeasonsQueryData<T>
    defaultSeason?: number;
    formatValue?: ((value: number, index?: number) => string | JSX.Element);
}

export type SeasonMultiBaseProps = {
  merged: any[],
  timeTabState: TimeTabState;
}

export default function SeasonMultiPlot({ merged, timeTabState }: SeasonMultiBaseProps) {
  return (
    <div>SeasonMultiPlot</div>
  );
}

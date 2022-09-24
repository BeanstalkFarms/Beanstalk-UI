import React from 'react';
import { QueryResultParams, useMergeSeasonsQueries } from '~/hooks/beanstalk/useMergeSeasonsQueries';
import { MinimumViableSnapshotQuery, SnapshotData } from '~/hooks/beanstalk/useSeasonsQuery';
import { DataPoint } from './LineChart';
import { TimeTabState } from './TimeTabs';

export interface MultiDataPoint extends Omit<DataPoint, 'value'> {
  value: { [index: number]: number }[];
}

export interface SeasonMultiDataPoint<T extends MinimumViableSnapshotQuery> extends Omit<DataPoint, 'value'> {
  value: { [index: number]: SnapshotData<T>}[];
}

type SeasonMultiDataParams<T extends MinimumViableSnapshotQuery> = (
  {
    data: ReturnType<typeof useMergeSeasonsQueries<T>>;
    defaultSeason?: number;
    params: QueryResultParams<T>[]
  }
  
)

export type SeasonMultiBaseProps = {
  merged: any[],
  timeTabState: TimeTabState;
}

const test = {
  value: [
    { 
      season: 7060,
      timestamp: '1663347600',
      values: [
        {
          id : '1zcnmdfnj354u8901x',
          totalDepositedAmount: '987512222943510401297736' 
        },
        {
          id : '21234124xc349990fd',
          totalDepositedAmount: '987512222943510401297736'
        }
      ]
    },
    { 
      season: 7061,
      timestamp: '1663347600',
      values: [
        {
          id : '1zcnmdfnj354u89012',
          totalDepositedAmount: '987512222943510401291233' 
        },
        {
          id : '21234124xc349990ff',
          totalDepositedAmount: '887512222943510401297736'
        }
      ]
    },
  ],
  season: 0,
  date: new Date()
};

export default function SeasonMultiPlot({ merged, timeTabState }: SeasonMultiBaseProps) {
  return (
    <div>SeasonMultiPlot</div>
  );
}

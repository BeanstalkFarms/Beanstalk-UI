import { useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import BigNumber from 'bignumber.js';
import { BaseDataPoint } from '../../components/Common/Charts/ChartPropProvider';
import { TimeTabState } from '../../components/Common/Charts/TimeTabs';
import {
  MinimumViableSnapshot,
  MinimumViableSnapshotQuery,
  SeasonAggregation,
} from './useSeasonsQuery';
import { secondsToDate, sortSeasons } from '~/util';

type SeasonData = Omit<MinimumViableSnapshot, 'id'> & any;
interface MergedSeasonsQueryData {
  [season: number]: SeasonData;
}

export type MinimumViableQueryType<T extends MinimumViableSnapshotQuery> = {
  data?: T;
  loading: boolean;
  error?: ApolloError | ApolloError[];
};

export type MergeSeasonsQueryProps<T extends MinimumViableSnapshotQuery> = {
  /*
   *
   */
  query: MinimumViableQueryType<T>;
  /*
   * fn used to get value from query
   */
  getValue: (season: T['seasons'][number]) => number;
  /**
   * key of data
   */
  key: string;
};

const generateStackedAreaSeriesData = <
  T extends MinimumViableSnapshotQuery,
  K extends BaseDataPoint
>(
  params: MergeSeasonsQueryProps<T>[],
  seasonAggregation: SeasonAggregation,
  keys: string[]
) => {
  const points: K[] = [];
  // merge
  const queryData: MergedSeasonsQueryData = {};
  params.forEach(({ query, getValue, key }) => {
    // if no seasons data, skip
    if (!query?.data?.seasons) return;
    query.data.seasons.forEach((s) => {
      // if no season data, skip
      if (!s) return;
      const prev = queryData[s.season];
      if (!prev) {
        queryData[s.season] = {
          season: s.season,
          timestamp: s.timestamp,
          [key]: getValue(s),
        };
      } else {
        queryData[s.season] = {
          ...queryData[s.season],
          [key]: getValue(s),
        };
      }
    });
  });

  const seasonsData = Object.values(queryData);

  if (seasonAggregation === SeasonAggregation.DAY) {
    const data = seasonsData.reverse();
    const lastIndex = data.length - 1;
    let agg = keys.reduce((acc, _key) => {
      acc[_key] = 0;
      return acc;
    }, {} as { [k: string]: number }); // value aggregator
    let i = 0; // total iterations
    let j = 0; // points averaged into this day
    let d: Date | undefined; // current date for this avg
    let s: number | undefined; // current season for this avg

    const copy = { ...agg }; // copy of agg to reset values in agg

    for (let k = lastIndex; k >= 0; k -= 1) {
      const season = data[k];
      if (!season) continue;
      for (const _k of keys) {
        const sd = season[_k];
        if (sd) agg[_k] += sd;
      }
      if (j === 0) {
        d = secondsToDate(season.timestamp);
        s = season.season as number;
        j += 1;
      } else if (i === lastIndex || j === 24) {
        for (const _k of keys) {
          agg[_k] = new BigNumber(agg[_k]).div(j + 1).toNumber();
        }
        points.push({
          season: s as number,
          date: d as Date,
          ...agg,
        } as K);
        agg = { ...copy };
        j = 0;
      } else {
        j += 1;
      }
      i += 1;
    }
  } else {
    for (const seasonData of seasonsData) {
      points.push({
        ...seasonData,
        season: seasonData.season as number,
        date: secondsToDate(seasonData.timestamp),
      } as unknown as K);
    }
  }

  return [points.sort(sortSeasons)];
};

const generateSeriesData = <
  T extends MinimumViableSnapshotQuery,
  K extends BaseDataPoint
>(
  params: MergeSeasonsQueryProps<T>[],
  seasonAggregation: SeasonAggregation
) => {
  const points: K[][] = params.map(({ query, getValue }) => {
    const _points: K[] = [];
    const data = query.data;
    if (!data || !data.seasons.length) return [];
    const lastIndex = data.seasons.length - 1;
    if (seasonAggregation === SeasonAggregation.DAY) {
      let v = 0; // value aggregator
      let i = 0; // total iterations
      let j = 0; // points averaged into this day
      let d: Date | undefined; // current date for this avg
      let s: number | undefined; // current season for this avg
      for (let k = lastIndex; k >= 0; k -= 1) {
        const season = data.seasons[k];
        if (!season) continue; // skip empty points
        v += getValue(season);
        if (j === 0) {
          d = secondsToDate(season.timestamp);
          s = season.season as number;
          j += 1;
        } else if (
          i === lastIndex || // last iteration
          j === 24 // full day of data ready
        ) {
          _points.push({
            season: s as number,
            date: d as Date,
            value: new BigNumber(v).div(j + 1).toNumber(),
          } as unknown as K);
          v = 0;
          j = 0;
        } else {
          j += 1;
        }
        i += 1;
      }
    } else {
      for (const season of data.seasons) {
        if (!season) continue;
        _points.push({
          season: season.season as number,
          date: secondsToDate(season.timestamp),
          value: getValue(season),
        } as unknown as K);
      }
    }
    return _points.sort(sortSeasons);
  });
  return points;
};

export const useMergeSeasonsQueries = <
  T extends MinimumViableSnapshotQuery,
  K extends BaseDataPoint
>(
  params: MergeSeasonsQueryProps<T>[],
  timeTabState: TimeTabState,
  stackedArea?: boolean
): {
  data: K[][];
  error: ApolloError[] | undefined;
  keys: string[];
  loading: boolean;
  stackedArea?: boolean;
} => {
  const loading = !!params.find((p) => p.query.loading);

  const error = useMemo(() => {
    const errs = params
      .filter(({ query: q }) => q.error !== undefined)
      .map(({ query: q }) => q.error) as ApolloError[];
    return errs.length ? errs : undefined;
  }, [params]);

  const [mergedData, dataKeys] = useMemo(() => {
    const _keys = params.map(({ key }) => key);
    const series = stackedArea
      ? generateStackedAreaSeriesData(params, timeTabState[0], _keys)
      : generateSeriesData(params, timeTabState[0]);

    return [series, _keys] as [K[][], string[]];
  }, [params, stackedArea, timeTabState]);

  return { data: mergedData, error, loading, keys: dataKeys, stackedArea };
};

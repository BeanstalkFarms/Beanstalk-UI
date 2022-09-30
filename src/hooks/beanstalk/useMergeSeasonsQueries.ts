import { useCallback, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import useSeasonsQuery, {  MinimumViableSnapshot, MinimumViableSnapshotQuery, SnapshotData } from './useSeasonsQuery';

type SeasonData = (Omit<MinimumViableSnapshot, 'id'> & any);
interface MergedSeasonsQueryData {
  [season: number]: SeasonData;
}

export type MergeSeasonsQueryProps<T extends MinimumViableSnapshotQuery> = {
  /*
   * non-destructured value returned by useSeasonsQuery<T>
   */
  query: ReturnType<typeof useSeasonsQuery<T>>
  /*
   * fn used to get value from query
   */
  getValue: (season: T['seasons'][number]) => number;
  /**
   * key of data
   */
  key: string;
}

/**
 * lns: last season where data[season][key] is not null
 * nns: next season where data[season][key] is not null
 * lnv: value of data[lns][key]
 * nnv: value of data[lnv][key]
 */
type InterpolateCache = { lns: number; nns: number; lnv: number; nnv: number  };

const interpolateIsStackedArea = (_data: MergedSeasonsQueryData, keys: string[]) => {
  const data = { ..._data };
  const arrData = Object.values(data);

  // sort seasons in ascending order
  if (!arrData || !arrData.length) return [];
  const sorted = arrData.sort((a, b) => a.season - b.season);
  const [firstSeason, lastSeason] = [
    sorted[0].season,
    sorted[sorted.length - 1].season
  ] as [number, number];

  const getNextNonNullValueWithSeason = (startSeason: number, key: string) => {
    let i = startSeason + 1;
    let mayNull = data[i];
    while (!mayNull || !(key in mayNull)) {
      i += 1;
      mayNull = data[i];
    }
    return [i, mayNull[key]];
  };

  const _interpolate = ({ nnv, lnv, nns, lns }: Required<InterpolateCache>, season: number) => {
    const m = (nnv - lnv) / (nns - lns);
    const cObj = _data[season];
    const mTimestamp = (parseFloat(data[nns].timestamp) - parseFloat(data[lns].timestamp)) / (nns - lns);
    const value = (m * (season - lns) + lnv);
    const timestamp = cObj && ('timestamp' in cObj)
      ? cObj.timestamp 
      : (mTimestamp * (season - lns) + parseFloat(data[lns].timestamp)).toFixed();

    return { value, timestamp };
  };

  const addData = (season: number, value: number, timestamp: string, key: string) => {
    const sData = data[season];
    if (sData) { data[season] = { ...sData, timestamp, [key]: value }; } 
    else { data[season] = { season, timestamp, [key]: value }; }
  };

  keys.forEach((k) => {
    let cache: InterpolateCache = { lns: 0, nns: 0, lnv: 0, nnv: 0 };
    for (let season = firstSeason; season <= lastSeason; season += 1) {
      const seasonData = data[season];
      // if season value of data[season][key] exists, update cache & continue
      if (seasonData && k in seasonData) {
        cache = { ...cache, lns: season, lnv: seasonData[k] };
        continue;
      }
      
      if (cache.lns && cache.lnv) {
        if (cache.nns && cache.nns < season) {
          const { value, timestamp } = _interpolate(cache, season);
          addData(season, value, timestamp, k);
        } else {
          const [nns, nnv] = getNextNonNullValueWithSeason(cache.lns, k);
          cache = { ...cache, nnv, nns };
          const { value, timestamp } = _interpolate(cache, season);
          addData(season, value, timestamp, k);
        }
      }
    }
  }, []);

  return Object.values(data);
};

export const useMergeSeasonsQueries = <T extends MinimumViableSnapshotQuery>(
  params: MergeSeasonsQueryProps<T>[],
  isStackedArea?: boolean,
): {
  data: SnapshotData<T>[][] | undefined;
  error: ApolloError[] | undefined;
  keys: string[];
  loading: boolean;
  isStackedArea: boolean;
} => {
  const loading = !!(params.find((p) => p.query.loading));

  const error = useMemo(() => {
    const errs = params
      .filter(({ query: q }) => q.error !== undefined)
      .map(({ query: q }) => q.error) as ApolloError[]; 
    return errs.length ? errs : undefined;
  }, [params]);

  const [merged, keys] = useMemo(() => {
    const base: SnapshotData<T>[][] = [[]];
    if (!params.length || loading || error) return [base, []];
    console.debug(
      `[useMergeSeasonsQueries] merging data from ${params.length} queries`,
      params.map((p) => p.query.observable.queryName)
    );
    const _keys = params.map(({ key }) => key);
    const queryData: MergedSeasonsQueryData = {};

    // // merge query data
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
            [key]: getValue(s)
          };
        } else {
          queryData[s.season] = {
            ...queryData[s.season],
            [key]: getValue(s)
          };
        }
      });
    });

    return [[interpolateIsStackedArea(queryData, _keys)], _keys];
  }, [error, loading, params]);

  console.log('merged: ', merged);

  const mergeSeriesData = useCallback((_params: MergeSeasonsQueryProps<T>[]) => {
    
  }, []);

  return { data: merged, error, loading, keys, isStackedArea: !!isStackedArea };
};

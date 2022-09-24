import { useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import useSeasonsQuery, {  MinimumViableSnapshotQuery, SnapshotData } from '~/hooks/beanstalk/useSeasonsQuery';

export type MergedSeasonsQueryData<T extends MinimumViableSnapshotQuery> = { 
  [season: number]: {
    season: number;
    timestamp: string;
    value: SnapshotData<T>[];
  }
} 

export const useMergeSeasonsQueries = <T extends MinimumViableSnapshotQuery>(
  params: ReturnType<typeof useSeasonsQuery<T>>[]
): {
  data: MergedSeasonsQueryData<T>;
  error: ApolloError[] | undefined;
  loading: boolean;
} => {
  const loading = !!(params.find((p) => p.loading));

  const error = useMemo(() => {
    const errs = params
      .filter(({ error: e }) => e !== undefined)
      .map(({ error: e }) => e) as ApolloError[]; 
    return errs.length ? errs : undefined;
  }, [params]);

  const merged = useMemo(() => {
    console.debug(
      `[useMergeSeasonsQueries] merging data from ${params.length} queries`,
      params.map(({ observable }) => observable.queryName)
    );

    const queryData: MergedSeasonsQueryData<T> = {};
    if (!params.length || loading || error) return queryData;
    
    // merge query data
    params.forEach((query) => {
      // if no seasons data, skip
      if (!query?.data?.seasons) return;
      query.data.seasons.forEach((s) => {
        if (!s || !s.season) return;        
        const prev = queryData[s.season];
        // const curr = { [key]: s };
        if (!prev) {
          queryData[s.season] = {
            season: s.season,
            timestamp: s.timestamp,
            value: [s]
          };
        } else {
          queryData[s.season].value = prev.value.concat(s);
        }
      });
    });

    console.log(queryData);

    return queryData;
  }, [error, loading, params]);

  return { data: merged, error, loading };
};

import { useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import useSeasonsQuery, {  MinimumViableSnapshotQuery, SnapshotData } from '~/hooks/beanstalk/useSeasonsQuery';

export type QueryResultParams<T extends MinimumViableSnapshotQuery> = { 
  /**
   * return value of useSeasonsQuery
   */
  query: ReturnType<typeof useSeasonsQuery<T>> 
  /**
   * Which value to obtain from query data
   */
  getValue: (snapshot: SnapshotData<T>) => number;
}

export type MergedSeasonsQueries = { 
  [season: number]: {
    season: number;
    timestamp: string;
    value: number[];
  }
} 

export const useMergeSeasonsQueries = <T extends MinimumViableSnapshotQuery>(
  params: QueryResultParams<T>[]
): {
  data: MergedSeasonsQueries;
  error: ApolloError[] | undefined;
  loading: boolean;
} => {
  const loading = !!params.find((q) => q.query.loading);

  const error = useMemo(() => {
    const errs = params
      .filter(({ query }) => query.error !== undefined)
      .map(({ query }) => query.error) as ApolloError[]; 
    return errs.length ? errs : undefined;
  }, [params]);

  const merged = useMemo(() => {
    console.debug(
      `[useMergeSeasonsQueries] merging data from ${params.length} queries`,
      params.map((p) => p.query.observable.queryName)
    );

    const queryData: MergedSeasonsQueries = {};
    if (!params.length || loading || error) return queryData;
    
    // merge query data
    params.forEach(({ query, getValue }) => {
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
            value: [getValue(s)]
          };
        } else {
          queryData[s.season].value = prev.value.concat(getValue(s));
        }
      });
    });

    console.log(queryData);

    return queryData;
  }, [error, loading, params]);

  return { data: merged, error, loading };
};

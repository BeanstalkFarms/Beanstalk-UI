import { ApolloQueryResult } from '@apollo/client';
import { useMemo } from 'react';

/* <
  Q extends ApolloQueryResult<any>,
  K extends keyof Q['data'],
  O
> */

export default function useCastApolloQuery<T>(
  query: ApolloQueryResult<any>,
  key: string,
  cast: (elem: any) => T
) {
  return useMemo<T[]>(() => {
    if (query.loading || !query.data?.[key]) return [];
    return query.data[key].map(cast);
  }, [
    query.data, 
    query.loading,
    cast,
    key
  ]);
}

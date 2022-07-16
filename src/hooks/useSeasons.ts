import { useEffect, useState } from 'react';
import { Season } from 'generated/graphql';
import { apolloClient } from 'graph/client';
import { DocumentNode, useLazyQuery } from '@apollo/client';

const PAGE_SIZE = 1000;
const WINDOWS = ['hr', 'day'] as const;
const RANGES  = ['week', 'month', 'all'] as const;
type Range = typeof RANGES[number];

export enum SeasonAggregation {
  HOUR = 0,
  DAY,
}

export enum SeasonRange {
  WEEK = 0,
  MONTH = 1,
  ALL = 2,
}

const SEASON_RANGE_TO_COUNT : { [key in SeasonRange]: number | undefined } = {
  [SeasonRange.WEEK]:  168, // 7*24
  [SeasonRange.MONTH]: 672, // 28*24
  [SeasonRange.ALL]:   undefined,
};

type MinimumViableSeason = Partial<Season> & Pick<Season, 'id' | 'seasonInt' | 'timestamp'>;

const useSeasons = <T extends { seasons: MinimumViableSeason[] }>(document: DocumentNode, range : SeasonRange) => {
  const [loading, setLoading] = useState(false);
  const [get, query] = useLazyQuery<T>(document, { variables: {} });

  useEffect(() => {
    (async () => {
      console.debug(`[useRecentSeasonsData] initializing with range = ${range}`);
      try {
        if (range !== SeasonRange.ALL) {
          // data.seasons is sorted by season, descending.
          await get({
            variables: { 
              first: SEASON_RANGE_TO_COUNT[range], 
              season_lte: 999999999
            },
            fetchPolicy: 'cache-first',
          }); 
        } else {
          // Initialize Season data with a call to the first 
          // set of Seasons.
          const init = await get({
            variables: { 
              first: undefined, 
              season_lte: 999999999
            },
          }); 

          console.debug('[useRecentSeasonsData] init: data = ', init.data);
          
          if (!init.data) {
            console.error(init);
            throw new Error('missing data');
          }
          
          /**
           * the newest season indexed by the subgraph 
           * data is returned sorted from oldest to newest
           * so season 0 is the oldest season and length-1 is newest.
           */
          const latestSubgraphSeason = init.data.seasons[0].seasonInt;

          console.debug(`[useRecentSeasonsData] requested all seasons. current season is ${latestSubgraphSeason}. oldest loaded season ${null}`, init.data.seasons);

          /**
           * 3000 / 1000 = 3 queries
           * Season    1 - 1000
           *        1001 - 2000
           *        2001 - 3000
           */
          const numQueries = Math.ceil(latestSubgraphSeason / PAGE_SIZE);
          const promises = [];
          console.debug(`[useRecentSeasonsData] needs ${numQueries} calls to get ${latestSubgraphSeason} more seasons`);
          setLoading(true);
          for (let i = 0; i < numQueries; i += 1) {
            const season = Math.max(
              0, // always at least 0
              latestSubgraphSeason - i * PAGE_SIZE,
            );
            console.debug(`[useRecentSeasonsData] get: ${season} -> ${Math.max(season - 1000, 2)}`);
            promises.push(
              apolloClient.query({
                query: document,
                variables: {
                  first: season < 1000 ? (season - 1) : 1000,
                  season_lte: season,
                },
                notifyOnNetworkStatusChange: true,
              })
            );
          }

          /**
           * Wait for queries to complete
           */
          await Promise.all(promises);
          setLoading(false);
        }
      } catch (e) {
        console.debug('[useRecentSeasonsData] failed');
        console.error(e);
      }
    })();
  }, [range, get, document]);

  return {
    ...query,
    loading: loading || query.loading,
  }; 
};

export default useSeasons;

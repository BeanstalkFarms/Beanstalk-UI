import { BigNumber } from 'bignumber.js';
import { ApolloError, QueryOptions, useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import {
  SeasonalFertilizerTokensQuery,
  SeasonalFertilizerTokensDocument,
  SeasonalFertilizerRewardsDocument,
  SeasonalFertilizerRewardsQuery,
} from '../../generated/graphql';

import useSeasonsQuery, {
  SeasonRange,
  SEASON_RANGE_TO_COUNT,
} from '~/hooks/beanstalk/useSeasonsQuery';
import { MinimumViableQueryType } from './useMergeSeasonsQueries';
import { NEW_BN, ZERO_BN } from '~/constants';
import { sortSeasons } from '~/util';
import useSeason from './useSeason';

type RinsableSproutsBySeason = {
  season: number;
  rinsableSprouts: BigNumber;
  timestamp: string;
};

type UnfertilizedSproutsBySeason = {
  season: number;
  timestamp: string;
  unfertilizedSprouts: BigNumber;
};

export type UnfertilizedSproutsBySeasonQuery = {
  seasons: (UnfertilizedSproutsBySeason & any)[];
};

const useUnfertilizedSprouts = (
  range: SeasonRange
): MinimumViableQueryType<UnfertilizedSproutsBySeasonQuery> => {
  const queryConfig = useMemo(() => {
    const tokens = {
      variables: {
        first: 1000,
        season_gt: 6073,
        season_lte: 9999999,
      },
      fetchPolicy: 'cache-first',
    };
    const rewards = {
      variables: {
        season_gt: 6073,
      },
    };
    return { tokens, rewards };
  }, []);

  // useQuery fits use-case since there are less than 1000 items returned from query
  const tokensQuery = useQuery<SeasonalFertilizerTokensQuery>(
    SeasonalFertilizerTokensDocument,
    queryConfig.tokens as Partial<QueryOptions>
  );
  const rewardsQuery = useSeasonsQuery<SeasonalFertilizerRewardsQuery>(
    SeasonalFertilizerRewardsDocument,
    SeasonRange.ALL,
    queryConfig.rewards
  );

  const currSeason = useSeason();

  const loading = useMemo(() => {
    const queriesLoading = !![tokensQuery.loading, rewardsQuery.loading].find(
      (_loading) => _loading
    );
    const seasonLoading = currSeason.eq(NEW_BN);
    return !!(queriesLoading || seasonLoading);
  }, [rewardsQuery, tokensQuery, currSeason]);

  const errors = useMemo(() => {
    const errs = [tokensQuery.error, rewardsQuery.error]
      .filter((e) => e !== undefined)
      .map((e) => e as ApolloError);
    return errs.length ? errs : undefined;
  }, [tokensQuery, rewardsQuery]);

  // returns mapping of cumulative rinsable sprouts by season
  const getRinsableSproutsBySeason = useCallback(() => {
    const sd = rewardsQuery.data?.seasons;
    if (!sd || sd.length === 0) return undefined;

    const data: { [season: number]: RinsableSproutsBySeason } = {};
    let k: BigNumber = ZERO_BN; // cumulative rinsable sprouts
    const sorted = [...sd].filter((datum) => datum !== null).sort(sortSeasons);

    sorted.forEach((s) => {
      k = k.plus(s.toFertilizer);
      data[s.season] = {
        season: s.season,
        rinsableSprouts: k,
        timestamp: s.timestamp,
      };
    });

    return { earliest: sorted[0].season, data };
  }, [rewardsQuery]);

  // returns mapping of cumulative sprouts by season
  const getCumulativeSproutsBySeason = useCallback(() => {
    const fertTokens = tokensQuery.data?.seasons;
    if (!fertTokens || fertTokens.length === 0) return undefined;

    const data: { [season: number]: BigNumber } = {};
    let s: BigNumber = ZERO_BN; // cumulative sprouts
    let earliestSeason: number;

    const sorted = [...fertTokens]
      .filter((datum) => datum !== null)
      .sort(sortSeasons);

    sorted.forEach(({ endBpf, supply, season }) => {
      if (!earliestSeason && season && season < earliestSeason) {
        earliestSeason = season;
      }
      const numSproutsForSeason = new BigNumber(endBpf).times(supply);
      s = s.plus(numSproutsForSeason);
      data[season] = s;
    });

    return { earliest: sorted[0].season, data };
  }, [tokensQuery]);

  const queryResult = useMemo(() => {
    const ft = tokensQuery.data?.seasons;
    const fr = rewardsQuery.data?.seasons;

    if (!ft?.length || !fr?.length || currSeason.eq(NEW_BN)) return undefined;

    const cumSprouts = getCumulativeSproutsBySeason();
    if (!cumSprouts?.data) return undefined;

    const rinsable = getRinsableSproutsBySeason();
    if (!rinsable?.data) return undefined;

    const earliestSeason = Math.min(cumSprouts.earliest, rinsable.earliest);

    const unfertilizedSproutsBySeason: UnfertilizedSproutsBySeason[] = [];
    let k = earliestSeason; // last season in which cumulative sprouts by season is not null
    let j = earliestSeason; // last season in which seasonalRinsableSprouts is not null
    let n; // cumulative number of sprouts for season i
    let r; // object containing rinsable sprouts for season i
    let u; // unfertilized sprouts for season i

    for (let i = earliestSeason; i <= currSeason.toNumber(); i += 1) {
      if (cumSprouts.data[i]) k = i;
      if (rinsable.data[i]) j = i;
      n = cumSprouts.data[k];
      r = rinsable.data[j];
      u = n.minus(r?.rinsableSprouts || ZERO_BN) || ZERO_BN;
      unfertilizedSproutsBySeason.push({
        season: i,
        unfertilizedSprouts: u,
        timestamp: r?.timestamp,
      });
    }

    return unfertilizedSproutsBySeason;
  }, [
    currSeason,
    getCumulativeSproutsBySeason,
    getRinsableSproutsBySeason,
    rewardsQuery.data?.seasons,
    tokensQuery.data?.seasons,
  ]);

  const data = useMemo(() => {
    if (!queryResult) return { seasons: [] };
    const reversed = queryResult?.reverse();
    switch (range) {
      case SeasonRange.ALL: {
        return { seasons: reversed };
      }
      default: {
        return {
          seasons: reversed?.slice(0, SEASON_RANGE_TO_COUNT[range] as number),
        };
      }
    }
  }, [queryResult, range]);

  return { data, loading: loading, error: errors };
};

export default useUnfertilizedSprouts;

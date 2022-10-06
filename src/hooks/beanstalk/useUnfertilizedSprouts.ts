import { BigNumber } from 'bignumber.js';
import { ApolloError, QueryOptions, useQuery } from '@apollo/client';
import { useMemo, useCallback } from 'react';
import {
  SeasonalFertilizerTokensQuery,
  SeasonalFertilizerTokensDocument,
  SeasonalFertilizerRewardsDocument,
  SeasonalFertilizerRewardsQuery,
} from '../../generated/graphql';
import { ZERO_BN } from '~/constants';

import {
  SeasonRange,
  SEASON_RANGE_TO_COUNT,
} from '~/hooks/beanstalk/useSeasonsQuery';

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

const useUnfertilizedSprouts = (
  range: SeasonRange,
  _queryConfig?: Partial<QueryOptions>
) => {
  const queryConfig = useMemo(
    () => ({
      ..._queryConfig,
      variables: {
        ..._queryConfig?.variables,
        season_gt: 6073,
      },
    }),
    [_queryConfig]
  );

  const { data: tokensData, ...tokensQueryOther } =
    useQuery<SeasonalFertilizerTokensQuery>(SeasonalFertilizerTokensDocument, {
      variables: {
        season_lte: 9999999,
        season_gt: 6073,
        first: 1000,
      },
    });

  const { data: rewardsData, ...rewardsQueryOther } =
    useQuery<SeasonalFertilizerRewardsQuery>(
      SeasonalFertilizerRewardsDocument,
      {
        variables: {
          season_lte: 9999999,
          season_gt: 6073,
          first: 1000,
        },
      }
    );

  const loading = useMemo(
    () =>
      !![tokensQueryOther.loading, rewardsQueryOther.loading].find(
        (isLoading) => isLoading
      ),
    [rewardsQueryOther, tokensQueryOther]
  );
  const errors = useMemo(
    () =>
      [tokensQueryOther.error, rewardsQueryOther.error]
        .filter((e) => e !== undefined)
        .map((e) => e as ApolloError),
    [tokensQueryOther, rewardsQueryOther]
  );

  // returns mapping of cumulative rinsable sprouts by season
  const getRinsableSproutsBySeason = useCallback(() => {
    const sd = rewardsData?.seasons;
    if (!sd) return undefined;

    const data: { [s: number]: RinsableSproutsBySeason } = {};
    let cumRinsable: BigNumber = ZERO_BN;

    [...sd]
      .sort((a, b) => a.season - b.season)
      .forEach((s) => {
        cumRinsable = cumRinsable.plus(s.toFertilizer);
        data[s.season] = {
          season: s.season,
          rinsableSprouts: cumRinsable,
          timestamp: s.timestamp,
        };
      });
    return data;
  }, [rewardsData]);

  // returns mapping of cumulative sprouts by season
  const getCumulativeSproutsBySeason = useCallback(() => {
    const fertTokens = tokensData?.seasons;
    if (!fertTokens?.length) return undefined;

    const cumulativeSproutsBySeason: { [season: number]: BigNumber } = {};
    let cumSprouts: BigNumber = ZERO_BN;

    [...fertTokens]
      .sort((a, b) => a.season - b.season)
      .forEach(({ endBpf, supply, season }) => {
        const numSproutsForSeason = new BigNumber(endBpf).times(supply);
        cumSprouts = cumSprouts.plus(numSproutsForSeason);
        cumulativeSproutsBySeason[season] = cumSprouts;
      });

    return cumulativeSproutsBySeason;
  }, [tokensData]);

  const queryResult = useMemo(() => {
    const ft = tokensData?.seasons;
    const fr = rewardsData?.seasons;

    if (!ft?.length || !fr?.length) return undefined;

    const cumulativeSproutsBySeason = getCumulativeSproutsBySeason();
    if (!cumulativeSproutsBySeason) return undefined;

    const seasonalRinsableSprouts = getRinsableSproutsBySeason();
    if (!seasonalRinsableSprouts) return undefined;

    const firstAndLast = [
      ft[ft.length - 1].season,
      ft[0].season,
      fr[fr.length - 1].season,
      fr[0].season,
    ];
    const earliestSeason = Math.min(...firstAndLast);
    const latestSeason = Math.max(...firstAndLast);

    const unfertilizedSproutsBySeason: UnfertilizedSproutsBySeason[] = [];
    let k = earliestSeason; // last season in which cumulative sprouts by season is not null
    let j = earliestSeason; // last season in which seasonalRinsableSprouts is not null
    let n; // cumulative number of sprouts for season i
    let r; // object containing rinsable sprouts for season i
    let u; // unfertilized sprouts for season i

    for (let i = earliestSeason; i <= latestSeason; i += 1) {
      if (cumulativeSproutsBySeason[i]) k = i;
      if (seasonalRinsableSprouts[i]) j = i;
      n = cumulativeSproutsBySeason[k];
      r = seasonalRinsableSprouts[j];
      u = n.minus(r?.rinsableSprouts || ZERO_BN) || ZERO_BN;
      unfertilizedSproutsBySeason.push({
        season: i,
        unfertilizedSprouts: u,
        timestamp: r?.timestamp,
      });
    }

    return unfertilizedSproutsBySeason;
  }, [
    getCumulativeSproutsBySeason,
    getRinsableSproutsBySeason,
    rewardsData?.seasons,
    tokensData?.seasons,
  ]);

  const data = useMemo(() => {
    if (!queryResult) return [];
    const reversed = queryResult.reverse();
    switch (range) {
      case SeasonRange.ALL: {
        return reversed;
      }
      default: {
        return reversed.slice(0, SEASON_RANGE_TO_COUNT[range] as number);
      }
    }
  }, [queryResult, range]);

  return { data, loading: loading, error: errors };
};

export default useUnfertilizedSprouts;

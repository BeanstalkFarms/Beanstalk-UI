import { BigNumber } from 'bignumber.js';
import { ApolloError, QueryOptions } from '@apollo/client';
import { useMemo } from 'react';
import { ZERO_BN } from '~/constants';
import {
  SeasonalFertilizerRewardsDocument,
  SeasonalFertilizerRewardsQuery,
  SeasonalFertilizerTokensDocument,
  SeasonalFertilizerTokensQuery,
} from '~/generated/graphql';

import useSeasonsQuery, {
  SeasonRange,
} from '~/hooks/beanstalk/useSeasonsQuery';

type RinsableSproutsBySeason = {
  season: number;
  rinsableSprouts: number;
};

const useUnfertilizedSprouts = (
  range: SeasonRange,
  _queryConfig?: Partial<QueryOptions>
) => {
  const queryConfig = useMemo(
    () => ({
      ..._queryConfig,
      variables: {
        season_gt: 6073,
        ..._queryConfig?.variables,
      },
    }),
    [_queryConfig]
  );
  /**
   * id
    season
    supply
    humidity
    startBpf
    endBpf
   */
  const fertilizerTokensQuery = useSeasonsQuery<SeasonalFertilizerTokensQuery>(
    SeasonalFertilizerTokensDocument,
    range,
    queryConfig
  );

  /**
    season
    toFertilizer
   */
  const fertilizerRewardsQuery =
    useSeasonsQuery<SeasonalFertilizerRewardsQuery>(
      SeasonalFertilizerRewardsDocument,
      range,
      queryConfig
    );

  const isLoading = useMemo(
    () =>
      !![fertilizerTokensQuery, fertilizerRewardsQuery].find((q) => q.loading),
    [fertilizerTokensQuery, fertilizerRewardsQuery]
  );

  const errors = useMemo(
    () =>
      [fertilizerTokensQuery, fertilizerRewardsQuery]
        .filter((q) => q.error !== undefined)
        .map((q) => q.error as ApolloError),
    [fertilizerTokensQuery, fertilizerRewardsQuery]
  );

  const queryResult = useMemo(() => {
    const fertRewards = fertilizerRewardsQuery.data?.seasons;
    const fertTokens = fertilizerTokensQuery.data?.seasons;
    if (!fertRewards?.length || !fertTokens?.length) return undefined;
    console.log('fert: ', fertRewards);
    console.log('sprouts: ', fertTokens);

    const sproutsRinsableBySeason = fertRewards.reduce(
      (acc, { season, toFertilizer }) => {
        acc.cum = acc.cum.plus(new BigNumber(toFertilizer));
        acc.sd.push({
          season,
          rinsableSprouts: acc.cum,
        });
        return acc;
      },
      { sd: [], cum: ZERO_BN } as {
        sd: { season: number; rinsableSprouts: BigNumber }[];
        cum: BigNumber;
      }
    );

    const data: { [season: string]: any } = {};
  }, [fertilizerTokensQuery, fertilizerRewardsQuery]);
};

export default useUnfertilizedSprouts;

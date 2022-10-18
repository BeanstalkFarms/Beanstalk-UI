import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { TokenMap, ZERO_BN } from '~/constants';
import useSeason from '~/hooks/beanstalk/useSeason';
import useFarmerSiloBalances from '~/hooks/farmer/useFarmerSiloBalances';

const STALK_GROWN_PER_SEED = new BigNumber(1 / 10_000);

type BaseToGrownStalk = {
  base: BigNumber;
  grown: BigNumber;
};

export default function useFarmerStalkByToken() {
  const balances = useFarmerSiloBalances();
  const season = useSeason();

  return useMemo(
    () =>
      Object.entries(balances).reduce<TokenMap<BaseToGrownStalk>>(
        (prev, [tokenAddress, tokenBalances]) => {
          if (!season) return prev;
          prev[tokenAddress] =
            tokenBalances.deposited.crates.reduce<BaseToGrownStalk>(
              (acc, crate) => {
                const elapsedSeasons = season.minus(crate.season);
                // add base stalk added from deposits
                acc.base = acc.base.plus(crate.stalk);
                // add grown stalk from deposits
                acc.grown = acc.grown.plus(
                  crate.seeds.times(elapsedSeasons).times(STALK_GROWN_PER_SEED)
                );
                return acc;
              },
              { base: ZERO_BN, grown: ZERO_BN }
            );
          return prev;
        },
        {}
      ),
    [balances, season]
  );
}

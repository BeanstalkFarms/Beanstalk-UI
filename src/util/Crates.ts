import BigNumber from 'bignumber.js';
import Token from 'classes/Token';
import { TokenMap } from 'constants/index';
import { BeanstalkReplanted } from 'generated';
import { Withdrawals } from 'hooks/useEventProcessor';
import { Crate, FarmerSiloBalance, WithdrawalCrate } from 'state/farmer/silo';

/**
 * Split Withdrawals into
 *    "withdrawn" (aka "transit")
 *    "claimable" (aka "receivable")
 *
 * @param withdrawals
 * @param currentSeason
 * @returns
 */
export function parseWithdrawals(
  withdrawals: Withdrawals,
  currentSeason: BigNumber
): {
  withdrawn: FarmerSiloBalance['withdrawn'];
  claimable: FarmerSiloBalance['claimable'];
} {
  let transitBalance = new BigNumber(0);
  let receivableBalance = new BigNumber(0);
  const transitWithdrawals: WithdrawalCrate[] = [];
  const receivableWithdrawals: WithdrawalCrate[] = [];

  // Split each withdrawal between `receivable` and `transit`.
  Object.keys(withdrawals).forEach((season: string) => {
    const v = withdrawals[season];
    const s = new BigNumber(season);
    if (s.isLessThanOrEqualTo(currentSeason)) {
      receivableBalance = receivableBalance.plus(v);
      receivableWithdrawals.push({
        amount: v,
        season: s,
      });
    } else {
      transitBalance = transitBalance.plus(v);
      transitWithdrawals.push({
        amount: v,
        season: s,
      });
    }
  });

  return {
    withdrawn: {
      amount: transitBalance,
      bdv: new BigNumber(0),
      crates: transitWithdrawals,
    },
    claimable: {
      amount: receivableBalance,
      crates: receivableWithdrawals,
    },
  };
}

export const encodeCratesForEnroot = (
  beanstalk: BeanstalkReplanted,
  unripeTokens: TokenMap<Token>,
  siloBalances: TokenMap<FarmerSiloBalance>
) =>
  Object.keys(unripeTokens).reduce<{ [addr: string]: string }>((prev, addr) => {
    const crates = siloBalances[addr]?.deposited.crates;
    if (crates && crates.length > 0) {
      if (crates.length === 1) {
        prev[addr] = beanstalk.interface.encodeFunctionData(
          'updateUnripeDeposit',
          [
            addr,
            crates[0].toString(),
            unripeTokens[addr].stringify(crates[0].amount),
          ]
        );
      } else {
        prev[addr] = beanstalk.interface.encodeFunctionData(
          'updateUnripeDeposits',
          [
            addr,
            // fixme: not sure why TS doesn't pick up the type of `crates` here
            crates.map((crate: Crate) => crate.season.toString()), // seasons
            crates.map((crate: Crate) =>
              unripeTokens[addr].stringify(crate.amount)
            ), // amounts
          ]
        );
      }
    }
    return prev;
  }, {});

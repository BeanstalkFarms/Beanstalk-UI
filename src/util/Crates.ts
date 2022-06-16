import BigNumber from 'bignumber.js';
import { Withdrawals } from 'hooks/useEventProcessor';
import { FarmerSiloBalance, Withdrawal } from 'state/farmer/silo';

export function parseWithdrawals(
  withdrawals: Withdrawals, 
  currentSeason: BigNumber
) : {
  withdrawn: FarmerSiloBalance['withdrawn'];
  claimable: FarmerSiloBalance['claimable'];
} {
  let transitBalance    = new BigNumber(0);
  let receivableBalance = new BigNumber(0);
  // const transitWithdrawals    : Withdrawals = {};
  // const receivableWithdrawals : Withdrawals = {};
  const transitWithdrawals    : Withdrawal[] = [];
  const receivableWithdrawals : Withdrawal[] = [];

  // Split each withdrawal between `receivable` and `transit`.
  Object.keys(withdrawals).forEach((season: string) => {
    const v = withdrawals[season];
    const s = new BigNumber(season);
    if (s.isLessThanOrEqualTo(currentSeason)) {
      receivableBalance = receivableBalance.plus(v);
      // receivableWithdrawals[season] = v;
      receivableWithdrawals.push({
        amount: v,
        season: s,
      });
    } else {
      transitBalance = transitBalance.plus(v);
      // transitWithdrawals[season] = v;
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
      crates: receivableWithdrawals
    },
    claimable: {
      amount: receivableBalance,
      crates: receivableWithdrawals,
    }
  };
}

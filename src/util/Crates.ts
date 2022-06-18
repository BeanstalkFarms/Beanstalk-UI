import BigNumber from 'bignumber.js';
import { Withdrawals } from 'hooks/useEventProcessor';
import { FarmerSiloBalance, WithdrawalCrate } from 'state/farmer/silo';

export function parseWithdrawals(
  withdrawals: Withdrawals, 
  currentSeason: BigNumber
) : {
  withdrawn: FarmerSiloBalance['withdrawn'];
  claimable: FarmerSiloBalance['claimable'];
} {
  let transitBalance    = new BigNumber(0);
  let receivableBalance = new BigNumber(0);
  const transitWithdrawals    : WithdrawalCrate[] = [];
  const receivableWithdrawals : WithdrawalCrate[] = [];

  // Split each withdrawal between `receivable` and `transit`.
  Object.keys(withdrawals).forEach((season: string) => {
    const v = withdrawals[season];
    const s = new BigNumber(season);
    if (s.isLessThanOrEqualTo(currentSeason)) {
      // console.debug(`[util/Crates] Withdrawal of ${v.toNumber()} in Season ${s.toString()} is Receivable`)
      receivableBalance = receivableBalance.plus(v);
      receivableWithdrawals.push({
        amount: v,
        season: s,
      });
    } else {
      // console.debug(`[util/Crates] Withdrawal of ${v.toNumber()} in Season ${s.toString()} is Transit`)
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
    }
  };
}

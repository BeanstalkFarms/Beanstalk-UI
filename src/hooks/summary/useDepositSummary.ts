import { Token } from 'classes';
import { ZERO_BN } from 'constants/index';
import { FormTokenState } from 'components/Common/Form';
import { Action, ActionType } from 'util/actions';

/**
 * Summarize the Actions that will occur when making a Deposit.
 * This includes pre-deposit Swaps, the Deposit itself, and resulting
 * rewards provided by Beanstalk depending on the destination of Deposit.
 * 
 * @param to A whitelisted Silo Token which the Farmer is depositing to.
 * @param tokens Token form state.
 */
export default function useDepositSummary(
  to: Token,
  tokens: FormTokenState[]
) {
  const summary = tokens.reduce((agg, curr) => {
    const amount = (
      curr.token === to
        ? curr.amount
        : curr.amountOut
    );
    if (amount) {
      // BDV
      agg.bdv   = agg.bdv.plus(amount);
      // REWARDS
      // NOTE: this is a function of `to.rewards.stalk` for the destination token.
      // we could pull it outside the reduce function.
      // however I expect we may need to adjust this when doing withdrawals/complex swaps
      // when bdv does not always go up during an Action. -SC
      agg.stalk = agg.stalk.plus(amount.times(to.rewards?.stalk || 0));
      agg.seeds = agg.seeds.plus(amount.times(to.rewards?.seeds || 0));
      // INSTRUCTIONS
      if (curr.amount && curr.amountOut) {
        agg.actions.push({
          type: ActionType.SWAP,
          tokenIn: curr.token,
          tokenOut: to,
          amountIn: curr.amount,
          amountOut: curr.amountOut,
        });
      }
    }
    return agg;
  }, {  
    bdv: ZERO_BN,    // The aggregate BDV to be Deposited.
    stalk: ZERO_BN,  // The Stalk earned for the Deposit.
    seeds: ZERO_BN,  // The Seeds earned for the Deposit.
    actions: [] as Action[],
  });

  // DEPOSIT and RECEIVE_REWARDS always come last
  summary.actions.push({
    type: ActionType.DEPOSIT,
    amountIn: summary.bdv,
    // from the perspective of the deposit,
    // the token is "coming in".
    tokenIn: to, 
  });
  summary.actions.push({
    type: ActionType.RECEIVE_SILO_REWARDS,
    stalk: summary.stalk,
    seeds: summary.seeds,
  });

  return summary;
}

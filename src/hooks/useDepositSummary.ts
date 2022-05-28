import { Token } from 'classes';
import BigNumber from 'bignumber.js';
import { displayFullBN, displayTokenAmount } from 'util/TokenUtilities';
import { zeroBN } from 'constants/index';
import { FormTokenState } from 'components/v2/Common/Form';

// -----------------------------------------------------------------------

export enum ActionType {
  SWAP,
  DEPOSIT,
  RECEIVE_REWARDS,
}

export type SwapAction = {
  type: ActionType.SWAP;
  tokenIn: Token;
  amountIn: BigNumber;
  tokenOut: Token;
  amountOut: BigNumber;
}

export type RewardsAction = {
  type: ActionType.RECEIVE_REWARDS;
  stalk: BigNumber;
  seeds: BigNumber;
}

export type DepositAction = {
  type: ActionType.DEPOSIT;
  amountIn: BigNumber;
  tokenIn: Token;
}

export type Action = (
  SwapAction
  | DepositAction
  | RewardsAction
);

const ACTION_MESSAGES = {
  [ActionType.SWAP]: (a: SwapAction) => 
    `Swap ${displayTokenAmount(a.amountIn, a.tokenIn)} for ${displayTokenAmount(a.amountOut, a.tokenOut)}.`,
  [ActionType.DEPOSIT]: (a: DepositAction) =>
    `Deposit ${displayTokenAmount(a.amountIn, a.tokenIn)} into the Silo.`,
  [ActionType.RECEIVE_REWARDS]: (a: RewardsAction) =>
    `Receive ${displayFullBN(a.stalk, 2)} Stalk and ${displayFullBN(a.seeds, 2)} Seeds.`,
};

// -----------------------------------------------------------------------

export const parseActionMessage = (i: Action) => ACTION_MESSAGES[i.type as keyof typeof ACTION_MESSAGES](i);

/**
 * Summarize the Actions that will occur when making a Deposit.
 * This includes pre-deposit Swaps, the Deposit itself, and resulting
 * rewards provided by Beanstalk depending on the destination of Deposit.
 * 
 * @param to A whitelisted Silo Token which the Farmer is depositing to.
 * @param tokens Token form state.
 */
const useDepositSummary = (to: Token, tokens: FormTokenState[]) => {
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
    bdv: zeroBN,
    stalk: zeroBN,
    seeds: zeroBN,
    actions: [] as Action[],
  });

  // DEPOSIAT and RECEIVE_REWARDS always come last
  summary.actions.push({
    type: ActionType.DEPOSIT,
    amountIn: summary.bdv,
    // from the perspective of the deposit,
    // the token is "coming in".
    tokenIn: to, 
  });
  summary.actions.push({
    type: ActionType.RECEIVE_REWARDS,
    stalk: summary.stalk,
    seeds: summary.seeds,
  });

  return summary;
};

export default useDepositSummary;
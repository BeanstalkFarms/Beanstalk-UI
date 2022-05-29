import BigNumber from 'bignumber.js';
import { FormTokenState } from 'components/v2/Common/Form';
import { USDC } from 'constants/v2/tokens';
import useChainConstant from 'hooks/useChainConstant';
import useHumidity from 'hooks/useHumidity';
import { Action, ActionType } from 'util/actions';

/**
 * Summarize the Actions that will occur when making a Deposit.
 * This includes pre-deposit Swaps, the Deposit itself, and resulting
 * rewards provided by Beanstalk depending on the destination of Deposit.
 * 
 * @param to A whitelisted Silo Token which the Farmer is depositing to.
 * @param tokens Token form state.
 */
const useFertilizerSummary = (tokens: FormTokenState[]) => {
  const Usdc = useChainConstant(USDC);
  const [humidity] = useHumidity();
  const summary = tokens.reduce((agg, curr) => {
    const amount = (
      curr.token === Usdc
        ? curr.amount
        : curr.amountOut
    );
    if (amount) {
      agg.usdc = agg.usdc.plus(amount);
      if (curr.amount && curr.amountOut) {
        agg.actions.push({
          type: ActionType.SWAP,
          tokenIn: curr.token,
          tokenOut: Usdc,
          amountIn: curr.amount,
          amountOut: curr.amountOut,
        });
      }
    }
    return agg;
  }, {
    usdc:     new BigNumber(0),  // The amount of USDC to be swapped for FERT.
    humidity: humidity,          //
    actions:  [] as Action[],    // 
  });

  // 
  summary.usdc = summary.usdc.dp(0, BigNumber.ROUND_DOWN);

  summary.actions.push({
    type: ActionType.BUY_FERTILIZER,
    amountIn: summary.usdc,
    humidity,
  });
  summary.actions.push({
    type: ActionType.RECEIVE_FERT_REWARDS,
    amountOut: humidity.plus(1).times(summary.usdc),
  });

  return summary;
};

export default useFertilizerSummary;

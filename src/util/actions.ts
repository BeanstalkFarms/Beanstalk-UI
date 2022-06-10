import BigNumber from 'bignumber.js';
import Token from 'classes/Token';
import { displayFullBN, displayTokenAmount } from 'util/Tokens';

export enum ActionType {
  // Generic: Swap
  SWAP,
  // Silo
  DEPOSIT,
  RECEIVE_SILO_REWARDS,
  // Fertilizer
  BUY_FERTILIZER,
  RECEIVE_FERT_REWARDS,
}

export type SwapAction = {
  type: ActionType.SWAP;
  tokenIn: Token;
  amountIn: BigNumber;
  tokenOut: Token;
  amountOut: BigNumber;
}

export type SiloRewardsAction = {
  type: ActionType.RECEIVE_SILO_REWARDS;
  stalk: BigNumber;
  seeds: BigNumber;
}

export type SiloDepositAction = {
  type: ActionType.DEPOSIT;
  amountIn: BigNumber;
  tokenIn: Token;
}

export type FertilizerBuyAction = {
  type: ActionType.BUY_FERTILIZER;
  amountIn: BigNumber;
  humidity: BigNumber;
}

export type FertilizerRewardsAction = {
  type: ActionType.RECEIVE_FERT_REWARDS;
  amountOut: BigNumber;
}

export type Action = (
  SwapAction
  | SiloDepositAction
  | SiloRewardsAction
  | FertilizerBuyAction
  | FertilizerRewardsAction
);

const ACTION_MESSAGES = {
  [ActionType.SWAP]: (a: SwapAction) => 
    `Swap ${displayTokenAmount(a.amountIn, a.tokenIn)} for ${displayTokenAmount(a.amountOut, a.tokenOut)}.`,
  [ActionType.DEPOSIT]: (a: SiloDepositAction) =>
    `Deposit ${displayTokenAmount(a.amountIn, a.tokenIn)} into the Silo.`,
  [ActionType.RECEIVE_SILO_REWARDS]: (a: SiloRewardsAction) =>
    `Receive ${displayFullBN(a.stalk, 2)} Stalk and ${displayFullBN(a.seeds, 2)} Seeds.`,
  [ActionType.BUY_FERTILIZER]: (a: FertilizerBuyAction) =>
    `Purchase ${displayFullBN(a.amountIn, 2)} Fertilizer at ${displayFullBN(a.humidity.multipliedBy(100), 1)}% Humidity.`,
  [ActionType.RECEIVE_FERT_REWARDS]: (a: FertilizerRewardsAction) =>
    `Receive a pro rata share of ⅓ of new Bean mints until ${displayFullBN(a.amountOut, 2)} Beans are recouped.`
};

// -----------------------------------------------------------------------

export const parseActionMessage = (i: Action) => ACTION_MESSAGES[i.type as keyof typeof ACTION_MESSAGES](i);

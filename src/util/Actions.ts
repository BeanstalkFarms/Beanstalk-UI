import BigNumber from 'bignumber.js';
import Token from 'classes/Token';
import { displayFullBN, displayTokenAmount } from 'util/Tokens';

export enum ActionType {
  BASE,
  // Generic: Swap
  SWAP,
  // Silo
  DEPOSIT,
  RECEIVE_SILO_REWARDS,
  CLAIM_WITHDRAWAL,
  // Fertilizer
  BUY_FERTILIZER,
  RECEIVE_FERT_REWARDS,
}

export type BaseAction = {
  type: ActionType.BASE;
  message?: string;
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

export type ClaimWithdrawalAction = {
  type: ActionType.CLAIM_WITHDRAWAL;
  amountIn: BigNumber;
  tokenIn: Token;
}

export type Action = (
  BaseAction
  | SwapAction
  | SiloDepositAction
  | SiloRewardsAction
  | ClaimWithdrawalAction
  | FertilizerBuyAction
  | FertilizerRewardsAction
);

// -----------------------------------------------------------------------

export const parseActionMessage = (a: Action) => {
  switch (a.type) {
    case ActionType.SWAP:
      return `Swap ${displayTokenAmount(a.amountIn, a.tokenIn)} for ${displayTokenAmount(a.amountOut, a.tokenOut)}.`;
    case ActionType.DEPOSIT:
      return `Deposit ${displayTokenAmount(a.amountIn, a.tokenIn)} into the Silo.`;
    case ActionType.RECEIVE_SILO_REWARDS:
      return `Receive ${displayFullBN(a.stalk, 2)} Stalk and ${displayFullBN(a.seeds, 2)} Seeds.`;
    case ActionType.BUY_FERTILIZER:
      return `Purchase ${displayFullBN(a.amountIn, 2)} Fertilizer at ${displayFullBN(a.humidity.multipliedBy(100), 1)}% Humidity.`;
    case ActionType.RECEIVE_FERT_REWARDS:
      return `Receive a pro rata share of ⅓ of new Bean mints until ${displayFullBN(a.amountOut, 2)} Beans are earned.`;
    case ActionType.CLAIM_WITHDRAWAL:
      return `Claim ${displayFullBN(a.amountIn, 2)} ${a.tokenIn.symbol}.`;
    default: 
      return a.message || 'Unknown action';
  }
};

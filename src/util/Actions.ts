import BigNumber from 'bignumber.js';
import Token from 'classes/Token';
import { displayFullBN, displayTokenAmount } from 'util/Tokens';

export enum ActionType {
  BASE,
  // Generic: Swap
  SWAP,
  // Silo
  DEPOSIT,
  WITHDRAW,
  IN_TRANSIT,
  UPDATE_SILO_REWARDS,
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
  type: ActionType.UPDATE_SILO_REWARDS;
  stalk: BigNumber;
  seeds: BigNumber;
}

type SiloAction = {
  amount: BigNumber;
  token: Token;
}

export type SiloDepositAction = SiloAction & {
  type: ActionType.DEPOSIT;
}
export type SiloWithdrawAction = SiloAction & {
  type: ActionType.WITHDRAW;
}
export type SiloTransitAction = SiloAction & {
  type: ActionType.IN_TRANSIT;
  withdrawSeasons: BigNumber;
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
  | SiloWithdrawAction
  | SiloTransitAction
  | SiloRewardsAction
  | ClaimWithdrawalAction
  | FertilizerBuyAction
  | FertilizerRewardsAction
);

// -----------------------------------------------------------------------

export const parseActionMessage = (a: Action) => {
  switch (a.type) {
    /// SWAP
    case ActionType.SWAP:
      return `Swap ${displayTokenAmount(a.amountIn, a.tokenIn)} for ${displayTokenAmount(a.amountOut, a.tokenOut)}.`;

    /// SILO
    case ActionType.DEPOSIT:
      return `Deposit ${displayTokenAmount(a.amount, a.token)} into the Silo.`;
    case ActionType.WITHDRAW:
      return `Withdraw ${displayTokenAmount(a.amount.abs(), a.token)} from the Silo.`;
    case ActionType.IN_TRANSIT:
      return `Receive ${displayTokenAmount(a.amount.abs(), a.token, 'Claimable')} in ${a.withdrawSeasons.toFixed()} Season${a.withdrawSeasons.eq(1) ? '' : 's'}.`;
    case ActionType.UPDATE_SILO_REWARDS: // FIXME: don't like "update" here
      return `${a.stalk.lt(0) ? 'Burn' : 'Receive'} ${displayFullBN(a.stalk.abs(), 2)} Stalk and ${displayFullBN(a.seeds.abs(), 2)} Seeds.`;
    case ActionType.CLAIM_WITHDRAWAL:
      return `Claim ${displayFullBN(a.amountIn, 2)} ${a.tokenIn.symbol}.`;

    /// FERTILIZER
    case ActionType.BUY_FERTILIZER:
      return `Buy ${displayFullBN(a.amountIn, 2)} Fertilizer at ${displayFullBN(a.humidity.multipliedBy(100), 1)}% Humidity.`;
    case ActionType.RECEIVE_FERT_REWARDS:
      return `Receive a pro rata share of ⅓ of new Bean mints until ${displayFullBN(a.amountOut, 2)} Beans are earned.`;

    /// DEFAULT
    default: 
      return a.message || 'Unknown action';
  }
};

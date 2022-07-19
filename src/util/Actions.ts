import BigNumber from 'bignumber.js';
import Token from 'classes/Token';
import { displayFullBN, displayTokenAmount } from 'util/Tokens';
import { BEAN, PODS } from '../constants/tokens';

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
  // Field
  BURN_BEANS,
  HARVEST,
  SEND,
  BUY_BEANS,
  RECEIVE_PODS,
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
export type SiloClaimAction = SiloAction & {
  type: ActionType.CLAIM_WITHDRAWAL;
}

type FieldAction = {

}

export type BurnBeansAction = FieldAction & {
  type: ActionType.BURN_BEANS;
  amount: BigNumber;
}

export type ReceivePodsAction = FieldAction & {
  type: ActionType.RECEIVE_PODS;
  podAmount: BigNumber;
  placeInLine: BigNumber;
}

export type BuyBeansAction = {
  type: ActionType.BUY_BEANS;
  beanAmount: BigNumber;
  beanPrice: BigNumber;
  token: Token;
  tokenAmount: BigNumber;
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
  BaseAction
  | SwapAction
  | SiloDepositAction
  | SiloWithdrawAction
  | SiloTransitAction
  | SiloRewardsAction
  | SiloClaimAction
  | BurnBeansAction
  | ReceivePodsAction
  | BuyBeansAction
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
      return `Claim ${displayFullBN(a.amount, 2)} ${a.token.symbol}.`;

    /// FIELD
    case ActionType.BUY_BEANS:
      // if user sows with beans, this step is skipped
      if (a.token.symbol === BEAN[1].symbol) return null;
      return `Buy ${displayFullBN(a.beanAmount, BEAN[1].decimals)} BEAN with ${a.tokenAmount} ${a.token.symbol} for $${displayFullBN(a.beanPrice, BEAN[1].decimals)} each.`;
    case ActionType.BURN_BEANS:
      return `Burn ${displayFullBN(a.amount, BEAN[1].decimals)} BEAN.`;
    case ActionType.RECEIVE_PODS:
      return `Receive ${displayTokenAmount(a.podAmount, PODS)} Pods at ${a.placeInLine} in the Pod Line.`;

    /// FERTILIZER
    case ActionType.BUY_FERTILIZER:
      return `Buy ${displayFullBN(a.amountIn, 2)} Fertilizer at ${displayFullBN(a.humidity.multipliedBy(100), 1)}% Humidity.`;
    case ActionType.RECEIVE_FERT_REWARDS:
      return `Receive ${displayFullBN(a.amountOut, 2)} Sprouts. Sprouts become Fertilized pro rata as the Bean supply increases.`;

    /// DEFAULT
    default: 
      return a.message || 'Unknown action';
  }
};

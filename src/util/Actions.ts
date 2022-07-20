import BigNumber from 'bignumber.js';
import Token from 'classes/Token';
import { displayFullBN, displayTokenAmount } from 'util/Tokens';
import { BEAN, PODS } from '../constants/tokens';
import { getAccount, trimAddress } from './index';

export enum ActionType {
  BASE,
  END_TOKEN,
  // Generic: Swap
  SWAP,
  // Silo
  DEPOSIT,
  WITHDRAW,
  IN_TRANSIT,
  UPDATE_SILO_REWARDS,
  CLAIM_WITHDRAWAL,
  // Field
  BUY_BEANS,
  BURN_BEANS,
  RECEIVE_PODS,
  HARVEST,
  RECEIVE_BEANS,
  SEND_PODS,
  // Fertilizer
  BUY_FERTILIZER,
  RECEIVE_FERT_REWARDS,
}

export type BaseAction = {
  type: ActionType.BASE;
  message?: string;
}

export type EndTokenAction = {
  type: ActionType.END_TOKEN;
  token: Token;
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

export type BuyBeansAction = {
  type: ActionType.BUY_BEANS;
  beanAmount: BigNumber;
  beanPrice: BigNumber;
  token: Token;
  tokenAmount: BigNumber;
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

export type FieldHarvestAction = {
  type: ActionType.HARVEST;
  amount: BigNumber;
}

export type ReceiveBeansAction = {
  type: ActionType.RECEIVE_BEANS;
  amount: BigNumber;
}

export type SendPodsAction = {
  type: ActionType.SEND_PODS;
  start: BigNumber;
  end: BigNumber;
  address: string;
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
  | FieldHarvestAction
  | ReceiveBeansAction
  | BuyBeansAction
  | SendPodsAction
  | FertilizerBuyAction
  | FertilizerRewardsAction
  | EndTokenAction
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
      // if user sows with beans, skip this step
      if (a.token.symbol === BEAN[1].symbol) return null;
      return `Buy ${displayFullBN(a.beanAmount, BEAN[1].decimals)} Beans with ${displayFullBN(a.tokenAmount, a.token.decimals)} ${a.token.symbol} for $${displayFullBN(a.beanPrice, BEAN[1].decimals)} each.`;
    case ActionType.BURN_BEANS:
      return `Burn ${displayFullBN(a.amount, BEAN[1].decimals)} ${a.amount.eq(new BigNumber(1)) ? 'Bean' : 'Beans'}.`;
    case ActionType.RECEIVE_PODS:
      return `Receive ${displayTokenAmount(a.podAmount, PODS)} Pods at ${displayFullBN(a.placeInLine)} in the Pod Line.`;
    case ActionType.HARVEST:
      return `Harvest ${displayFullBN(a.amount, PODS.decimals)} Harvestable Pods.`;
    case ActionType.RECEIVE_BEANS:
      return `Receive ${displayFullBN(a.amount, BEAN[1].decimals)} Beans.`;
    case ActionType.SEND_PODS:
      return `Send Pods ${displayFullBN(a.start, BEAN[1].decimals)} - ${displayFullBN(a.end, BEAN[1].decimals)} to ${trimAddress(getAccount(a.address), true)}.`;

    /// FERTILIZER
    case ActionType.BUY_FERTILIZER:
      return `Buy ${displayFullBN(a.amountIn, 2)} Fertilizer at ${displayFullBN(a.humidity.multipliedBy(100), 1)}% Humidity.`;
    case ActionType.RECEIVE_FERT_REWARDS:
      return `Receive ${displayFullBN(a.amountOut, 2)} Sprouts. Sprouts become Fertilized pro rata as the Bean supply increases.`;

    /// ALL
    case ActionType.END_TOKEN:
      return null;

    /// DEFAULT
    default: 
      return a.message || 'Unknown action';
  }
};

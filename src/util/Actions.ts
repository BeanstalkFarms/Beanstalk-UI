import BigNumber from 'bignumber.js';
import Token from 'classes/Token';
import { FarmToMode } from 'lib/Beanstalk/Farm';
import { displayFullBN, displayTokenAmount } from 'util/Tokens';
import { BEAN, PODS } from '../constants/tokens';
import { trimAddress } from './index';

export enum ActionType {
  /// GENERIC
  BASE,
  END_TOKEN,
  SWAP,

  /// SILO
  DEPOSIT,
  WITHDRAW,
  IN_TRANSIT,
  UPDATE_SILO_REWARDS,
  CLAIM_WITHDRAWAL,
  TRANSFER,

  /// FIELD
  BUY_BEANS,
  BURN_BEANS,
  RECEIVE_PODS,
  HARVEST,
  RECEIVE_BEANS,
  SEND_PODS,

  /// MARKET
  CREATE_ORDER,

  /// FERTILIZER
  BUY_FERTILIZER,
  RECEIVE_FERT_REWARDS,
}

/// GENERIC
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

/// SILO
type SiloAction = {
  amount: BigNumber;
  token: Token;
}
export type SiloRewardsAction = {
  type: ActionType.UPDATE_SILO_REWARDS;
  stalk: BigNumber;
  seeds: BigNumber;
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
export type SiloTransferAction = SiloAction & {
  type: ActionType.TRANSFER;
  to: string;
}

/// FIELD
type FieldAction = {};
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
  destination?: FarmToMode;
}
export type SendPodsAction = {
  type: ActionType.SEND_PODS;
  amount: BigNumber;
  address: string;
}

/// MARKET
export type CreateOrderAction = {
  type: ActionType.CREATE_ORDER;
  message: string; // lazy!
}

/// FERTILIZER
export type FertilizerBuyAction = {
  type: ActionType.BUY_FERTILIZER;
  amountIn: BigNumber;
  humidity: BigNumber;
}
export type FertilizerRewardsAction = {
  type: ActionType.RECEIVE_FERT_REWARDS;
  amountOut: BigNumber;
}

/// AGGREGATE
export type Action = (
  BaseAction
  | SwapAction
  | EndTokenAction
  /// SILO
  | SiloDepositAction
  | SiloWithdrawAction
  | SiloTransitAction
  | SiloRewardsAction
  | SiloClaimAction
  | SiloTransferAction
  /// FIELD
  | BurnBeansAction
  | ReceivePodsAction
  | FieldHarvestAction
  | ReceiveBeansAction
  | BuyBeansAction
  | SendPodsAction
  /// MARKET
  | CreateOrderAction
  /// FERTILIZER
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
      return `Receive ${displayTokenAmount(a.amount.abs(), a.token, false, 'Claimable')} in ${a.withdrawSeasons.toFixed()} Season${a.withdrawSeasons.eq(1) ? '' : 's'}.`;
    case ActionType.UPDATE_SILO_REWARDS: // FIXME: don't like "update" here
      return `${a.stalk.lt(0) ? 'Burn' : 'Receive'} ${displayFullBN(a.stalk.abs(), 2)} Stalk and ${displayFullBN(a.seeds.abs(), 2)} Seeds.`;
    case ActionType.CLAIM_WITHDRAWAL:
      return `Claim ${displayFullBN(a.amount, 2)} ${a.token.symbol}.`;
    case ActionType.TRANSFER:
      return `Transfer ${displayFullBN(a.amount)} ${a.token.symbol} to ${trimAddress(a.to)}.`;

    /// FIELD
    case ActionType.BUY_BEANS:
      // if user sows with beans, skip this step
      if (a.token.symbol === BEAN[1].symbol) return null;
      return `Buy ${displayFullBN(a.beanAmount, BEAN[1].decimals)} Beans with ${displayFullBN(a.tokenAmount, a.token.decimals)} ${a.token.symbol} for $${displayFullBN(a.beanPrice, BEAN[1].decimals)} each.`;
    case ActionType.BURN_BEANS:
      return `Burn ${displayFullBN(a.amount, BEAN[1].decimals)} ${a.amount.eq(new BigNumber(1)) ? 'Bean' : 'Beans'}.`;
    case ActionType.RECEIVE_PODS:
      return `Receive ${displayTokenAmount(a.podAmount, PODS)} at ${displayFullBN(a.placeInLine)} in the Pod Line.`;
    case ActionType.HARVEST:
      return `Harvest ${displayFullBN(a.amount, PODS.decimals)} Harvestable Pods.`;
    case ActionType.RECEIVE_BEANS:
      return `Receive ${displayFullBN(a.amount, BEAN[1].decimals)} Beans${
        a.destination
          ? a.destination === FarmToMode.EXTERNAL
            ? ' to your Circulating Balance' 
            : ' to your Farm Balance' 
          : ''}.`;
    case ActionType.SEND_PODS:
      return `Send ${displayTokenAmount(a.amount, PODS)} to ${trimAddress(a.address)}.`;

    /// FERTILIZER
    case ActionType.BUY_FERTILIZER:
      return `Buy ${displayFullBN(a.amountIn, 2)} Fertilizer at ${displayFullBN(a.humidity.multipliedBy(100), 1)}% Humidity.`;
    case ActionType.RECEIVE_FERT_REWARDS:
      return `Receive ${displayFullBN(a.amountOut, 2)} Sprouts. Sprouts become Fertilized pro rata as the Bean supply increases.`;

    /// MARKET
    case ActionType.CREATE_ORDER:
      return a.message;

    /// ALL
    case ActionType.END_TOKEN:
      return null;

    /// DEFAULT
    default: 
      return a.message || 'Unknown action';
  }
};

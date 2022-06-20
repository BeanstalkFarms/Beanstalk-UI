import { BigNumber as EBN } from 'ethers';
import {
  SowEvent,
  HarvestEvent,
  PlotTransferEvent,
  AddDepositEvent,
} from 'constants/generated/Beanstalk/BeanstalkReplanted';
import { BEAN, ERC20_TOKENS } from 'constants/tokens';
import BigNumber from 'bignumber.js';
import { TypedEvent } from 'constants/generated/common';
import Token from 'classes/Token';
import { getChainConstant } from 'hooks/useChainConstant';
import { TokenMap } from 'constants/index';
import { FarmerSilo } from 'state/farmer/silo';
import { SeasonMap } from 'state/farmer/field';

const SupportedEvents = [
  'Sow',
  'Harvest',
  'PlotTransfer',
  'AddDeposit',
] as const;
const SupportedEventsSet = new Set(SupportedEvents);
type SupportedEvents = typeof SupportedEvents;

const Bean = BEAN[1];
const TOKENS = getChainConstant(ERC20_TOKENS, 1);

/** */
export const BN      = (v: EBN | BigNumber.Value) => (v instanceof EBN ? new BigNumber(v.toString()) : new BigNumber(v));
export const tokenBN = (v: EBN | BigNumber.Value, token: Token) => BN(v).div(10 ** token.decimals);
export const initTokens = (tokenMap: TokenMap) =>
  Object.keys(tokenMap).reduce<{ [season: string] : any }>(
    (prev, curr) => {
      // Lowercase all token addresses.
      prev[curr.toLowerCase()] = {};
      return prev;
    },
    {}
  )

export type EventProcessingParameters = {
  season: BigNumber;
  farmableBeans: BigNumber;
  harvestableIndex: BigNumber;
  tokenMap: TokenMap;
}
export type EventProcessorData = {
  plots: { [index: string] : BigNumber };
  deposits:     TokenMap<{ [season: string]: { amount: BigNumber, bdv: BigNumber; } }>;
  withdrawals:  TokenMap<{ [season: string]: { amount: BigNumber } }>;
}

export default class EventProcessor {
  // -- Processing parameters
  account : string;
  epp   : EventProcessingParameters;

  // -- Data
  plots       : EventProcessorData['plots'];
  deposits    : EventProcessorData['deposits'];    // token => season => amount
  withdrawals : EventProcessorData['withdrawals']; // token => season => amount

  // ----------------------------

  constructor(
    account : string,
    epp : EventProcessingParameters,
    initialState?: Partial<EventProcessorData>,
  ) {
    this.account = account.toLowerCase();
    if (!epp.tokenMap || typeof epp !== "object") throw new Error(`EventProcessor: Missing tokenMap`);
    this.epp = epp;
    this.plots = initialState?.plots || {};
    this.deposits    = initialState?.deposits    || initTokens(this.epp.tokenMap);
    this.withdrawals = initialState?.withdrawals || initTokens(this.epp.tokenMap);
  }

  // ----------------------------
  
  ingest<T extends TypedEvent>(event: T) {
    if (!event.event) throw new Error('Missing event name');
    if (!SupportedEventsSet.has(event.event as SupportedEvents[number])) throw new Error(`No handler for event: ${event.event}`);
    return this[event.event as SupportedEvents[number]](event);
  }

  // ----------------------------

  Sow(event: SowEvent) {
    const index = event.args.index.div(10 ** Bean.decimals).toString();
    this.plots[index] = BN(event.args.pods.div(10 ** Bean.decimals));
    return [index, this.plots[index]];
  }

  Harvest(event: HarvestEvent) {
    let beansClaimed = BN(event.args.beans.div(10 ** Bean.decimals));
    const plots = (
      event.args.plots
        .map((p) => BN(p.div(10 ** Bean.decimals)))
        .sort((a, b) => a.minus(b).toNumber())
    ); 
    plots.forEach((indexBN) => {
      const index = indexBN.toString();
      if (beansClaimed.isLessThan(this.plots[index])) {
        // ----------------------------------------
        // A Plot was partially Harvested. Example:
        // Event: Sow
        //  index  = 10
        //  amount = 10
        //
        // I call harvest when harvestableIndex = 14 (I harvest 10,11,12,13)
        //
        // Event: Harvest
        //  args.beans = 4
        //  args.plots = [10]
        //  beansClaimed  = 4
        //  partialIndex  = 4 + 10 = 14
        //  partialAmount = 10 - 4 = 6
        // 
        // Add Plot with 6 Pods at index 14
        // Remove Plot at index 10.
        // ----------------------------------------
        const partialIndex  = beansClaimed.plus(indexBN);
        const partialAmount = this.plots[index].minus(beansClaimed);
        this.plots = {
          ...this.plots,
          [partialIndex.toString()]: partialAmount,
        };
      } else {
        beansClaimed = beansClaimed.minus(this.plots[index]);
      }
      delete this.plots[index];
    });
  }

  PlotTransfer(event: PlotTransferEvent) {
    // Numerical "index" of the Plot.
    // Absolute, with respect to Pod 0.
    const index = tokenBN(event.args.id, Bean);
    const pods  = tokenBN(event.args.pods, Bean);

    // This account received a Plot
    if (event.args.to.toLowerCase() === this.account) {
      this.plots[index.toString()] = pods;
    }

    // This account sent a Plot
    else {
      // String version of `idx`, used to key
      // objects. This prevents duplicate toString() calls
      // and resolves Typescript errors.
      const indexStr = index.toString();

      // If we've located the plot in a prior event
      if (this.plots[indexStr] !== undefined) {
        // Send partial plot
        if (!pods.isEqualTo(this.plots[indexStr])) {
          const newStartIndex = index.plus(pods);
          this.plots[newStartIndex.toString()] = this.plots[indexStr].minus(pods);
        }
        delete this.plots[indexStr];
      }
      else {
        let i = 0;
        let found = false;
        while (found === false && i < Object.keys(this.plots).length) {
          const startIndex = BN(Object.keys(this.plots)[i]);
          const endIndex   = startIndex.plus(this.plots[startIndex.toString()]);
          if (startIndex.isLessThanOrEqualTo(index) && endIndex.isGreaterThan(index)) {
            this.plots[startIndex.toString()] = index.minus(startIndex);
            if (!index.isEqualTo(endIndex)) {
              const s2 = index.plus(pods);
              if (!s2.isEqualTo(endIndex)) {
                const s2Str = s2.toString();
                this.plots[s2Str] = endIndex.minus(s2);
                if (this.plots[s2Str].isEqualTo(0)) {
                  delete this.plots[s2Str];
                }
              }
            }
            found = true;
          }
          i += 1;
        }
      }
    }
  }

  // ----------------------------

  _makeDeposit(
    existing: EventProcessorData['deposits'][string][string] | undefined,
    amount: BigNumber,
    bdv: BigNumber
  ) {
    return existing ? {
      amount: existing.amount.plus(amount),
      bdv:    existing.bdv.plus(bdv),
     } : {
      amount,
      bdv,
    };
  }

  AddDeposit(event: AddDepositEvent) {
    const token  = event.args.token.toLowerCase();
    if (!this.epp.tokenMap[token]) throw new Error(`Attempted to process an event with an unknown token: ${token}`);
    const season = BN(event.args.season);
    const seasonStr = season.toString();
    const amount = tokenBN(event.args.amount, this.epp.tokenMap[token]);
    const bdv    = tokenBN(event.args.bdv, Bean);
    this.deposits[token] = {
      ...this.deposits[token],
      [seasonStr]: this._makeDeposit(this.deposits[token][seasonStr], amount, bdv)
    };
  }

}

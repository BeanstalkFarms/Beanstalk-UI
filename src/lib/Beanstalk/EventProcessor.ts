import { BigNumber as EBN, ethers } from 'ethers';
import {
  SowEvent,
  HarvestEvent,
  PlotTransferEvent,
  AddDepositEvent,
  AddWithdrawalEvent,
  RemoveWithdrawalEvent,
  RemoveDepositEvent,
  RemoveDeposits_address_address_uint32_array_uint256_array_uint256_Event,
  RemoveWithdrawalsEvent,
} from 'constants/generated/Beanstalk/BeanstalkReplanted';
import { BEAN } from 'constants/tokens';
import BigNumber from 'bignumber.js';
import { TypedEvent } from 'constants/generated/common';
import Token from 'classes/Token';
import { TokenMap } from 'constants/index';
import { PlotMap } from 'state/farmer/field';
import { FarmerSiloBalance, WithdrawalCrate } from 'state/farmer/silo';
import { Withdrawals } from 'hooks/useEventProcessor';

// ----------------------------------------

const SupportedEvents = [
  'Sow',
  'Harvest',
  'PlotTransfer',
  'AddDeposit',
  'RemoveDeposit',
  'RemoveDeposits',
  'AddWithdrawal',
  'RemoveWithdrawal',
  'RemoveWithdrawals',
] as const;
const SupportedEventsSet = new Set(SupportedEvents);
const Bean = BEAN[1];

// ----------------------------------------

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
  );

// ----------------------------------------

type SupportedEvents = typeof SupportedEvents;
export type EventProcessingParameters = {
  season: BigNumber;
  farmableBeans: BigNumber;
  harvestableIndex: BigNumber;
  whitelist: TokenMap;
}
export type EventProcessorData = {
  plots: {
    [index: string] : BigNumber
  };
  deposits: TokenMap<{ 
    [season: string]: { 
      amount: BigNumber;
      bdv: BigNumber;
    }
  }>;
  withdrawals: TokenMap<{
    [season: string]: { 
      amount: BigNumber;
    }
  }>;
}
export type EventKeys = 'event' | 'args' | 'blockNumber' | 'transactionIndex' | 'transactionHash' | 'logIndex'
export type Simplify<T extends ethers.Event> = Pick<T, EventKeys> & { facet?: string };
export type Event = Simplify<ethers.Event>;

export default class EventProcessor {
  // ----------------------------
  // |       PROCESSING         |
  // ----------------------------
  account : string;

  epp   : EventProcessingParameters;

  // ----------------------------
  // |      DATA STORAGE        |
  // ----------------------------

  plots       : EventProcessorData['plots'];

  deposits    : EventProcessorData['deposits'];    // token => season => amount

  withdrawals : EventProcessorData['withdrawals']; // token => season => amount

  // ----------------------------
  // |      SETUP + UTILS       |
  // ----------------------------

  constructor(
    account : string,
    epp : EventProcessingParameters,
    initialState?: Partial<EventProcessorData>,
  ) {
    this.account = account.toLowerCase();
    if (!epp.whitelist || typeof epp !== 'object') throw new Error('EventProcessor: Missing tokenMap');
    this.epp = epp;
    this.plots = initialState?.plots || {};
    this.deposits    = initialState?.deposits    || initTokens(this.epp.whitelist);
    this.withdrawals = initialState?.withdrawals || initTokens(this.epp.whitelist);
  }
  
  ingest<T extends Event>(event: T) {
    if (!event.event) { return }; //throw new Error('Missing event name');
    if (!SupportedEventsSet.has(event.event as SupportedEvents[number])) { return } // throw new Error(`No handler for event: ${event.event}`);
    return this[event.event as SupportedEvents[number]](event as any);
  }

  ingestAll<T extends Event>(events: T[]) {
    events.forEach((event) => this.ingest(event));
    return this.data();
  }

  data() {
    return {
      plots: this.plots,
      deposits: this.deposits,
      withdrawals: this.withdrawals,
    }
  }

  // ----------------------------
  // |          FIELD           |
  // ----------------------------

  Sow(event: Simplify<SowEvent>) {
    const index = event.args.index.div(10 ** Bean.decimals).toString();
    this.plots[index] = BN(event.args.pods.div(10 ** Bean.decimals));
    return [index, this.plots[index]];
  }

  Harvest(event: Simplify<HarvestEvent>) {
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

  PlotTransfer(event: Simplify<PlotTransferEvent>) {
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

  parsePlots(_harvestableIndex: BigNumber) {
    return EventProcessor.parsePlots(
      this.plots,
      _harvestableIndex || this.epp.harvestableIndex
    )
  }

  static parsePlots(plots: EventProcessorData['plots'], index: BigNumber) {
    let pods = new BigNumber(0);
    let harvestablePods = new BigNumber(0);
    const unharvestablePlots  : PlotMap<BigNumber> = {};
    const harvestablePlots    : PlotMap<BigNumber> = {};

    Object.keys(plots).forEach((p) => {
      if (plots[p].plus(p).isLessThanOrEqualTo(index)) {
        harvestablePods = harvestablePods.plus(plots[p]);
        harvestablePlots[p] = plots[p];
      } else if (new BigNumber(p).isLessThan(index)) {
        harvestablePods = harvestablePods.plus(index.minus(p));
        pods = pods.plus(
          plots[p].minus(index.minus(p))
        );
        harvestablePlots[p] = index.minus(p);
        unharvestablePlots[index.minus(p).plus(p).toString()] = plots[p].minus(
          index.minus(p)
        );
      } else {
        pods = pods.plus(plots[p]);
        unharvestablePlots[p] = plots[p];
      }
    });
    
    // FIXME: "unharvestable pods" are just Pods,
    // but we can't reuse "plots" in the same way.
    return [
      pods, harvestablePods,
      unharvestablePlots, harvestablePlots
    ] as const;
  }

  // ----------------------------
  // |      SILO: UTILITIES     |
  // ----------------------------
  
  // parseWithdrawals(currentSeason?: BigNumber) {
  //   return EventProcessor._parseWithdrawals(
  //     this.withdrawals,
  //     currentSeason || this.epp.season,
  //   );
  // }

  static _parseWithdrawals(
    withdrawals: EventProcessorData['withdrawals'][string], 
    currentSeason: BigNumber
  ) : {
    withdrawn: FarmerSiloBalance['withdrawn'];
    claimable: FarmerSiloBalance['claimable'];
  } {
    let transitBalance    = new BigNumber(0);
    let receivableBalance = new BigNumber(0);
    const transitWithdrawals    : WithdrawalCrate[] = [];
    const receivableWithdrawals : WithdrawalCrate[] = [];
  
    // Split each withdrawal between `receivable` and `transit`.
    Object.keys(withdrawals).forEach((season: string) => {
      const v = withdrawals[season].amount;
      const s = new BigNumber(season);
      if (s.isLessThanOrEqualTo(currentSeason)) {
        receivableBalance = receivableBalance.plus(v);
        receivableWithdrawals.push({
          amount: v,
          season: s,
        });
      } else {
        transitBalance = transitBalance.plus(v);
        transitWithdrawals.push({
          amount: v,
          season: s,
        });
      }
    });
  
    return {
      withdrawn: {
        amount: transitBalance,
        bdv: new BigNumber(0),
        crates: transitWithdrawals,
      },
      claimable: {
        amount: receivableBalance,
        crates: receivableWithdrawals,
      }
    };
  }

  // ----------------------------
  // |      SILO: DEPOSIT       |
  // ----------------------------

  _upsertDeposit(
    existing: EventProcessorData['deposits'][string][string] | undefined,
    amount: BigNumber,
    bdv: BigNumber,
  ) {
    return existing ? {
      amount: existing.amount.plus(amount),
      bdv:    existing.bdv.plus(bdv),
     } : {
      amount,
      bdv,
    };
  }

  _removeDeposit(
    season: string,
    token: string,
    _amount: EBN,
  ) {
    if (!this.epp.whitelist[token]) throw new Error(`Attempted to process an event with an unknown token: ${token}`);
    const amount    = tokenBN(_amount, this.epp.whitelist[token]);
    const existingDeposit = this.deposits[token][season];
    if (!existingDeposit) throw new Error('Received a \'RemoveDeposit\' event for an unknown deposit.');

    // BDV scales linearly with the amount of the underlying token.
    // Ex. if we remove 60% of the `amount`, we also remove 60% of the BDV.
    // Because of this, the `RemoveDeposit` event doesn't contain the BDV to save gas.
    const bdv = existingDeposit.bdv.times(amount.dividedBy(existingDeposit.amount));

    this.deposits[token] = {
      ...this.deposits[token],
      [season]: this._upsertDeposit(
        this.deposits[token][season],
        amount.negated(),
        bdv.negated()
      ),
    };

    if (this.deposits[token][season].amount.eq(0)) {
      delete this.deposits[token][season];
    }
  }

  AddDeposit(event: Simplify<AddDepositEvent>) {
    const token     = event.args.token.toLowerCase();
    if (!this.epp.whitelist[token]) throw new Error(`Attempted to process an event with an unknown token: ${token}`);
    const seasonBN  = BN(event.args.season);
    const season    = seasonBN.toString();
    const amount    = tokenBN(event.args.amount, this.epp.whitelist[token]);
    const bdv       = tokenBN(event.args.bdv, Bean);

    this.deposits[token] = {
      ...this.deposits[token],
      [season]: this._upsertDeposit(this.deposits[token][season], amount, bdv),
    };
  }

  RemoveDeposit(event: Simplify<RemoveDepositEvent>) {
    this._removeDeposit(
      event.args.season.toString(),
      event.args.token.toLowerCase(),
      event.args.amount
    );
  }

  RemoveDeposits(event: Simplify<RemoveDeposits_address_address_uint32_array_uint256_array_uint256_Event>) {
    event.args.seasons.forEach((seasonNum, index) => {
      this._removeDeposit(
        seasonNum.toString(),
        event.args.token,
        event.args.amounts[index],
      );
    });
  }

  // ----------------------------
  // |      SILO: WITHDRAW      |
  // ----------------------------

  _upsertWithdrawal(
    existing: EventProcessorData['withdrawals'][string][string] | undefined,
    amount: BigNumber,
  ) {
    return existing ? {
      amount: existing.amount.plus(amount),
     } : {
      amount,
    };
  }

  _removeWithdrawal(
    season: string,
    token: string,
    _amount: EBN,
  ) {
    if (!this.epp.whitelist[token]) throw new Error(`Attempted to process an event with an unknown token: ${token}`);
    const amount    = tokenBN(_amount, this.epp.whitelist[token]);
    const existingDeposit = this.withdrawals[token][season];
    if (!existingDeposit) throw new Error('Received a \'RemoveWithdrawal\' event for an unknown Withdrawal.');

    this.withdrawals[token] = {
      ...this.withdrawals[token],
      [season]: this._upsertWithdrawal(
        this.withdrawals[token][season],
        amount.negated(),
      ),
    };

    if (this.withdrawals[token][season].amount.eq(0)) {
      delete this.withdrawals[token][season];
    }
  }

  AddWithdrawal(event: Simplify<AddWithdrawalEvent>) {
    const token  = event.args.token.toLowerCase();
    if (!this.epp.whitelist[token]) throw new Error(`Attempted to process an event with an unknown token: ${token}`);
    const seasonBN = BN(event.args.season);
    const season = seasonBN.toString();
    const amount = tokenBN(event.args.amount, this.epp.whitelist[token]);
    
    this.withdrawals[token] = {
      ...this.withdrawals[token],
      [season]: this._upsertWithdrawal(this.withdrawals[token][season], amount),
    };
  }
  
  RemoveWithdrawal(event: Simplify<RemoveWithdrawalEvent>) {
    this._removeWithdrawal(
      event.args.season.toString(),
      event.args.token.toLowerCase(),
      event.args.amount
    );
  }

  RemoveWithdrawals(event: Simplify<RemoveWithdrawalsEvent>) {
    event.args.seasons.forEach((seasonNum, index) => {
      this._removeWithdrawal(
        seasonNum.toString(),
        event.args.token,
        event.args.amount,  // FIXME: 
      );
    });
  }

  // ----------------------------
  // |          MARKET          |
  // ----------------------------
}

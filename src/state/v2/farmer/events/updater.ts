import { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { useBeanstalkContract } from 'hooks/useContract';
import { useAccount, useConnect, useNetwork } from 'wagmi';
import flatten from 'lodash/flatten';
import useBlocks from 'hooks/useBlocks';
import { useDispatch } from 'react-redux';
import { Beanstalk } from 'constants/generated';
import ethers, { BigNumber as BN } from 'ethers';
import { GetAccountResult } from '@wagmi/core';
import { setEvents } from './actions';
import { useEffectDebugger } from 'hooks/useEffectDebugger';
import {
  useWhatChanged,
  setUseWhatChange,
} from '@simbathesailor/use-what-changed';

export type ParsedEvent = {
  event: ethers.Event['event'];
  blockNumber: ethers.Event['blockNumber'];
  logIndex: ethers.Event['logIndex'];
  returnValues: any;
};

const getEvents = (
  beanstalk: Beanstalk,
  account: string,
  blocks: ReturnType<typeof useBlocks>
) =>
  [
    beanstalk.queryFilter(
      beanstalk.filters.BeanDeposit(account),
      blocks.BEANSTALK_GENESIS_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters['BeanRemove(address,uint32[],uint256[],uint256)'](
        account
      ),
      blocks.BEANSTALK_GENESIS_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.BeanWithdraw(account),
      blocks.BEANSTALK_GENESIS_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters['LPDeposit(address,uint256,uint256,uint256)'](
        account
      ),
      blocks.BEANSTALK_GENESIS_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters['LPRemove(address,uint32[],uint256[],uint256)'](
        account
      ),
      blocks.BEANSTALK_GENESIS_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.LPWithdraw(account),
      blocks.BEANSTALK_GENESIS_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.Deposit(account),
      blocks.BEANSTALK_GENESIS_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.RemoveSeason(account),
      blocks.BEANSTALK_GENESIS_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.RemoveSeasons(account),
      blocks.BEANSTALK_GENESIS_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.Withdraw(account),
      blocks.BEANSTALK_GENESIS_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.ClaimSeason(account),
      blocks.BEANSTALK_GENESIS_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters['Sow(address,uint256,uint256,uint256)'](
        account
      ),
      blocks.BEANSTALK_GENESIS_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.Harvest(account),
      blocks.BEANSTALK_GENESIS_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.BeanClaim(account),
      blocks.BEANSTALK_GENESIS_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.LPClaim(account),
      blocks.BEANSTALK_GENESIS_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PlotTransfer(account, null), // from
      blocks.BEANSTALK_GENESIS_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PlotTransfer(null, account), // to
      blocks.BEANSTALK_GENESIS_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PodListingCreated(account),
      blocks.BIP10_COMMITTED_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PodListingCancelled(account),
      blocks.BIP10_COMMITTED_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PodListingFilled(account, null), // from
      blocks.BIP10_COMMITTED_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PodListingFilled(null, account), // to
      blocks.BIP10_COMMITTED_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PodOrderCreated(account),
      blocks.BIP10_COMMITTED_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PodOrderCancelled(account),
      blocks.BIP10_COMMITTED_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PodOrderFilled(account, null), // from
      blocks.BIP10_COMMITTED_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PodOrderFilled(null, account), // to
      blocks.BIP10_COMMITTED_BLOCK
    ),
  ] as const;

// HACK:
// Recursively parse all instances of BNJS as BigNumber
const bn = (v: any) => (v instanceof BN ? new BigNumber(v.toString()) : false);
const parseBNJS = (_o: { [key: string]: any }) => {
  const o: { [key: string]: any } = {};
  Object.keys(_o).forEach((k: string) => {
    o[k] =
      bn(_o[k]) ||
      (Array.isArray(_o[k]) ? _o[k].map((v: any) => bn(v) || v) : _o[k]);
  });
  return o;
};

setUseWhatChange(process.env.NODE_ENV === 'development');


const FarmerEventsUpdater = () => {
  const beanstalk = useBeanstalkContract();
  const { data: account, isLoading: isAccountLoading } = useAccount();
  const { status } = useConnect();
  const blocks = useBlocks();
  const dispatch = useDispatch();

  // When to pull events:
  //    - when the wallet address is set and changes
  //        - init load
  //        - wallet change
  //    - when the chain changes
  useEffectDebugger(() => {
    if (status === 'connected') {
      if (beanstalk && account?.address && blocks) {
        console.debug('[farmer/events/updater] fetching events', beanstalk.address, account.address, blocks);
        Promise.all(getEvents(beanstalk, account.address, blocks)).then((results) => {
          console.debug(`[farmer/events/updater] received ${results.length} events`)
          const allEvents: ParsedEvent[] = flatten<ethers.Event>(results)
            .map((event) => ({
              event: event.event,
              blockNumber: event.blockNumber,
              logIndex: event.logIndex,
              // args: event.args,
              returnValues: event.decode
                ? parseBNJS({
                    ...(event.decode(event.data, event.topics) as Array<any>),
                  })
                : null,
            }))
            .sort((a, b) => {
              const diff = a.blockNumber - b.blockNumber;
              if (diff !== 0) return diff;
              return a.logIndex - b.logIndex;
            });
          console.debug('[farmer/events/updater] allEvents', allEvents);
          dispatch(setEvents(allEvents));
        });
      } else {
        console.debug(`[farmer/events/updater] effect refreshed but vars missing`, beanstalk, account?.address, blocks)
      }
    } else {
      console.debug(`[farmer/events/updater] effect refreshed but status = ${status}`)
    }
  }, [
    account?.address,
    beanstalk,
    blocks,
    status,
    dispatch
  ]);

  return null;
};

export default FarmerEventsUpdater;

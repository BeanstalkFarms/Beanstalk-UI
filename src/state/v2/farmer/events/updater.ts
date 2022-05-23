import { useCallback, useEffect } from 'react';
import BigNumber from 'bignumber.js'
import { useBeanstalkContract } from 'hooks/useContract';
import { useAccount } from 'wagmi';
import flatten from 'lodash/flatten'
import useBlocks from 'hooks/useBlocks';
import { setEvents } from './actions';
import { useDispatch } from 'react-redux';
import { Beanstalk } from 'constants/generated';
import ethers, { BigNumber as BN } from 'ethers';
import { GetAccountResult } from '@wagmi/core';

export type ParsedEvent = {
  event: ethers.Event['event'];
  blockNumber: ethers.Event['blockNumber'];
  logIndex: ethers.Event['logIndex'];
  returnValues: any;
}

const getEvents = (beanstalk: Beanstalk, account: GetAccountResult, blocks: ReturnType<typeof useBlocks>) => (
  [
    beanstalk.queryFilter(
      beanstalk.filters.BeanDeposit(account.address),
      blocks.BEANSTALK_GENESIS_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters['BeanRemove(address,uint32[],uint256[],uint256)'](account.address),
      blocks.BEANSTALK_GENESIS_BLOCK
    ),
    beanstalk.queryFilter(
      beanstalk.filters.BeanWithdraw(account.address),
      blocks.BEANSTALK_GENESIS_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters['LPDeposit(address,uint256,uint256,uint256)'](account.address),
      blocks.BEANSTALK_GENESIS_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters['LPRemove(address,uint32[],uint256[],uint256)'](account.address),
      blocks.BEANSTALK_GENESIS_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters.LPWithdraw(account.address),
      blocks.BEANSTALK_GENESIS_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters.Deposit(account.address),
      blocks.BEANSTALK_GENESIS_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters.RemoveSeason(account.address),
      blocks.BEANSTALK_GENESIS_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters.RemoveSeasons(account.address),
      blocks.BEANSTALK_GENESIS_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters.Withdraw(account.address),
      blocks.BEANSTALK_GENESIS_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters.ClaimSeason(account.address),
      blocks.BEANSTALK_GENESIS_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters['Sow(address,uint256,uint256,uint256)'](account.address),
      blocks.BEANSTALK_GENESIS_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters.Harvest(account.address),
      blocks.BEANSTALK_GENESIS_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters.BeanClaim(account.address),
      blocks.BEANSTALK_GENESIS_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters.LPClaim(account.address),
      blocks.BEANSTALK_GENESIS_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PlotTransfer(account.address, null), // from
      blocks.BEANSTALK_GENESIS_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PlotTransfer(null, account.address), // to
      blocks.BEANSTALK_GENESIS_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PodListingCreated(account.address),
      blocks.BIP10_COMMITTED_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PodListingCancelled(account.address),
      blocks.BIP10_COMMITTED_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PodListingFilled(account.address, null), // from
      blocks.BIP10_COMMITTED_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PodListingFilled(null, account.address), // to
      blocks.BIP10_COMMITTED_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PodOrderCreated(account.address),
      blocks.BIP10_COMMITTED_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PodOrderCancelled(account.address),
      blocks.BIP10_COMMITTED_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PodOrderFilled(account.address, null), // from
      blocks.BIP10_COMMITTED_BLOCK,
    ),
    beanstalk.queryFilter(
      beanstalk.filters.PodOrderFilled(null, account.address), // to
      blocks.BIP10_COMMITTED_BLOCK,
    ),
  ] as const
)

// HACK:
// Recursively parse all instances of BNJS as BigNumber
const bn = (v: any) => {
  return v instanceof BN ? new BigNumber(v.toString()) : false;
};
const parseBNJS = (_o: { [key: string ] : any }) => {
  const o : { [key: string ] : any } = {};
  Object.keys(_o).forEach((k: string) => {
    o[k] = (
      bn(_o[k]) || (
        Array.isArray(_o[k])
          ? _o[k].map((v: any) => bn(v) || v)
          : _o[k]
      )
    )
  });
  return o;
}

export default function FarmerEventsUpdater() {
  const beanstalk = useBeanstalkContract();
  const { data: account } = useAccount();
  const blocks = useBlocks();
  const dispatch = useDispatch();
  
  useEffect(() => {
    if(beanstalk && account) {
      console.debug('[farmer/updater] fetching events');
      Promise.all(getEvents(beanstalk, account, blocks)).then((results) => {
        const allEvents : ParsedEvent[] = (
          flatten<ethers.Event>(results)
            .map((event) => ({
              event: event.event,
              blockNumber: event.blockNumber,
              logIndex: event.logIndex,
              args: event.args,
              returnValues: event.decode ? parseBNJS({ 
                ...event.decode(event.data, event.topics) as Array<any>
              }) : null,
            }))
            .sort((a, b) => {
              const diff = a.blockNumber - b.blockNumber;
              if (diff !== 0) return diff;
              return a.logIndex - b.logIndex;
            })
        );
        console.debug(`[farmer/updater] allEvents`, allEvents)
        dispatch(setEvents(allEvents));
      })
    }
  }, [
    account,
    beanstalk,
    blocks,
    dispatch
  ]);

  return null;
}
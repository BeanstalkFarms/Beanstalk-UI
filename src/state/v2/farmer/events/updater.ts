import { useCallback, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { useBeanstalkContract } from 'hooks/useContract';
import { useAccount } from 'wagmi';
import flatten from 'lodash/flatten';
import useBlocks from 'hooks/useBlocks';
import { useDispatch } from 'react-redux';
import { Beanstalk } from 'constants/generated';
import ethers, { BigNumber as BN } from 'ethers';
import useChainId from 'hooks/useChain';
import { resetEvents, setEvents } from './actions';

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

const useFarmerEvents = () => {
  const [beanstalk] = useBeanstalkContract();
  const blocks = useBlocks();
  const dispatch = useDispatch();

  // Handlers
  const fetch = useCallback(async (address?: string) => {
    try {
      if (beanstalk && address && blocks) {
        console.debug(`[farmer/events/useFarmerEvents] FETCH: beanstalk = ${beanstalk.address}, farmer = ${address}`, blocks);
        Promise.all(getEvents(beanstalk, address, blocks)).then((results) => {
          const flattened = flatten<ethers.Event>(results);
          console.debug(`[farmer/events/useFarmerEvents] RESULT: ${results.length} filters -> ${flattened.length} events`);
          const allEvents: ParsedEvent[] = flattened.map((event) => ({
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
          console.debug(`[farmer/events/useFarmerEvents] RESULT: received ${allEvents.length} events`, allEvents);
          dispatch(setEvents(allEvents));
        });
      } else {
        console.debug('[farmer/events/useFarmerEvents] effect refreshed but vars missing', beanstalk, address, blocks);
      }
    } catch (e) {
      console.debug('[farmer/events/useFarmerEvents] FAILED', e);
      console.error(e);
    }
  }, [
    dispatch,
    beanstalk,
    blocks,
  ]);
  
  const clear = useCallback(() => {
    console.debug('[farmer/events/useFarmerEvents] clear');
    dispatch(resetEvents());
  }, [dispatch]);

  return [fetch, clear] as const;
};

const FarmerEventsUpdater = () => {
  const [fetch, clear] = useFarmerEvents();
  const { data: account } = useAccount();
  const chainId = useChainId();

  // When to pull events:
  //    - when the wallet address is set and changes
  //        - init load
  //        - wallet change
  //    - when the chain changes
  useEffect(() => {
    clear();
    if (account?.address) {
      fetch(account?.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, account?.address]);

  return null;
};

export default FarmerEventsUpdater;

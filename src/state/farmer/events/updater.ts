import { useCallback, useEffect } from 'react';
import ethers, { BigNumber as BN } from 'ethers';
import BigNumber from 'bignumber.js';
import { useAccount } from 'wagmi';
import { useDispatch } from 'react-redux';
import flattenDeep from 'lodash/flattenDeep';
import useBlocks from 'hooks/useBlocks';
import { Beanstalk, BeanstalkReplanted } from 'constants/generated';
import { useBeanstalkContract } from 'hooks/useContract';
import useChainId from 'hooks/useChain';
import { getAccount } from 'util/Account';
import { getEventFacet } from 'util/GetEventFacet';
import useMigrateCall from 'hooks/useMigrateCall';
import { resetEvents, setEvents } from './actions';
import { Event } from 'lib/Beanstalk/EventProcessor';

const getEvents = (
  beanstalk: Beanstalk,
  migrate: ReturnType<typeof useMigrateCall>,
  account: string,
  blocks: ReturnType<typeof useBlocks>
) =>
  [
    migrate<Beanstalk, BeanstalkReplanted>(beanstalk, [
      (b) => Promise.all([
        // Silo (v1)
        b.queryFilter(
          b.filters.BeanDeposit(account),
          blocks.BEANSTALK_GENESIS_BLOCK
        ),
        b.queryFilter(
          b.filters.BeanWithdraw(account),
          blocks.BEANSTALK_GENESIS_BLOCK
        ),
        b.queryFilter(
          b.filters['BeanRemove(address,uint32[],uint256[],uint256)'](
            account
          ),
          blocks.BEANSTALK_GENESIS_BLOCK
        ),
        beanstalk.queryFilter(
          beanstalk.filters.BeanClaim(account),
          blocks.BEANSTALK_GENESIS_BLOCK
        ),
        b.queryFilter(
          b.filters['LPDeposit(address,uint256,uint256,uint256)'](
            account
          ),
          blocks.BEANSTALK_GENESIS_BLOCK
        ),
        b.queryFilter(
          b.filters.LPWithdraw(account),
          blocks.BEANSTALK_GENESIS_BLOCK
        ),
        b.queryFilter(
          b.filters['LPRemove(address,uint32[],uint256[],uint256)'](
            account
          ),
          blocks.BEANSTALK_GENESIS_BLOCK
        ),
        beanstalk.queryFilter(
          beanstalk.filters.LPClaim(account),
          blocks.BEANSTALK_GENESIS_BLOCK
        ),
        // Silo (Generalized v1)
        beanstalk.queryFilter(
          beanstalk.filters.Deposit(account),
          blocks.BEANSTALK_GENESIS_BLOCK
        ),
        beanstalk.queryFilter(
          beanstalk.filters.Withdraw(account),
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
          beanstalk.filters.ClaimSeason(account),
          blocks.BEANSTALK_GENESIS_BLOCK
        ),
        beanstalk.queryFilter(
          beanstalk.filters['ClaimSeasons(address,address,uint32[],uint256)'](account),
          blocks.BEANSTALK_GENESIS_BLOCK
        ),
      ]),
      (b) => Promise.all([
        // Silo (Generalized v2)
        b.queryFilter(
          b.filters.AddDeposit(account),
          blocks.BEANSTALK_GENESIS_BLOCK
        ),
        b.queryFilter(
          b.filters.AddWithdrawal(account),
          blocks.BEANSTALK_GENESIS_BLOCK
        ),
        b.queryFilter(
          b.filters.RemoveWithdrawal(account),
          blocks.BEANSTALK_GENESIS_BLOCK
        ),
        b.queryFilter(
          b.filters.RemoveWithdrawals(account),
          blocks.BEANSTALK_GENESIS_BLOCK
        ),
        b.queryFilter(
          b.filters.RemoveDeposit(account),
          blocks.BEANSTALK_GENESIS_BLOCK
        ),
        b.queryFilter(
          b.filters['RemoveDeposits(address,address,uint32[],uint256[],uint256)'](account),
          blocks.BEANSTALK_GENESIS_BLOCK
        ),
      ]),
    ]),
    // Field
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
    // Pod Market
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

// ----------------------------------------

const useFarmerEvents = () => {
  const blocks = useBlocks();
  const dispatch = useDispatch();
  const beanstalk = useBeanstalkContract();
  const migrate = useMigrateCall();

  // Handlers
  const fetch = useCallback(async (_account?: string) => {
    try {
      if (beanstalk && _account && blocks) {
        const account = getAccount(_account);
        console.debug(`[farmer/events/useFarmerEvents] FETCH: beanstalk = ${beanstalk.address}, farmer = ${account}`, blocks);
        Promise.all(getEvents(beanstalk, migrate, account, blocks)).then((results) => {
          const flattened = flattenDeep<ethers.Event>(results);
          console.debug(`[farmer/events/useFarmerEvents] RESULT: ${results.length} filters -> ${flattened.length} events`);
          const allEvents : Event[] = (
            flattened
              .map<Event>((e) => ({
                event: e.event,
                args: e.args,
                blockNumber: e.blockNumber,
                logIndex: e.logIndex,
                transactionHash: e.transactionHash,
                transactionIndex: e.transactionIndex,
                // backwards compat
                facet: getEventFacet(e.event),
                returnValues: e.decode
                  ? parseBNJS({
                      ...(e.decode(e.data, e.topics) as Array<any>),
                    })
                  : null,
              }))
              .sort((a, b) => {
                const diff = a.blockNumber - b.blockNumber;
                if (diff !== 0) return diff;
                return a.logIndex - b.logIndex;
              })
          );
          console.debug(`[farmer/events/useFarmerEvents] RESULT: received ${allEvents.length} events`, allEvents);
          dispatch(setEvents(allEvents));
        });
      } else {
        console.debug('[farmer/events/useFarmerEvents] effect refreshed but vars missing', beanstalk, _account, blocks);
      }
    } catch (e) {
      console.debug('[farmer/events/useFarmerEvents] FAILED', e);
      console.error(e);
    }
  }, [
    dispatch,
    migrate,
    beanstalk,
    blocks,
  ]);
  
  const clear = useCallback(() => {
    console.debug('[farmer/events/useFarmerEvents] clear');
    dispatch(resetEvents());
  }, [dispatch]);

  return [fetch, clear] as const;
};

// ----------------------------------------

const FarmerEventsUpdater = () => {
  const [fetch, clear] = useFarmerEvents();
  const { data: account } = useAccount();
  const chainId = useChainId();

  useEffect(() => {
    clear();
    if (account?.address) {
      fetch(account.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, account?.address]);

  return null;
};

export default FarmerEventsUpdater;

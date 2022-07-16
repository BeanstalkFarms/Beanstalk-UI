import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useChainConstant from 'hooks/useChainConstant';
import { useBeanstalkContract, useBeanstalkFertilizerContract } from 'hooks/useContract';
import { useAccount } from 'wagmi';
import { REPLANT_INITIAL_ID } from 'hooks/useHumidity';
import useChainId from 'hooks/useChain';
import { getAccount } from 'util/Account';
import useMigrateCall from 'hooks/useMigrateCall';
import { BeanstalkReplanted } from 'generated';
import { toTokenUnitsBN } from 'util/index';
import BigNumber from 'bignumber.js';
import { ZERO_BN } from 'constants/index';
import { resetFertilizer, updateFarmerFertilizer } from './actions';

/**
 * Try to call a subgraph -> formulate data
 *  - Loop through data as necessary (probably fetching all data for the farmer)
 *  - How to handle the case where we want to paginate? Very tricky with events,
 *    since application state needs to rebuilt from the first event up.
 *   
 * If the subgraph call fails, what next?
 *  1. Silently fall back to on-chain events.
 *  2. Ask the user how they want to proceed.
 *  3. Throw an error and stop trying.
 * 
 * If the on-chain event call works
 *  - Parse the events into the same format
 * 
 * If the on-chain event calls fail
 *  - Stop trying
 * 
 * How to save events:
 *  1 Within each section of state (silo, field, market)
 *    - Requires reducer/actions to handle saving events for each section
 *    - Sections could handle events in different ways if necessary
 *    - Different sections could be loaded from different data sources
 *    - Need to solve overlap problem with events like PlotTransfer which are
 *      required for both the Field and the Marketplace
 *      - Is the marketplace out of scope for event processing? Soon enough it will
 *        be far too large to parse. Check to see which event params are indexed.
 *  2 In a top level "farmer/events" section that shares all events
 *    - The event processor can loop through all events, so no need to filter before
 *      running it
 *      - How to share the event processor across updaters?
 *        - Will event process work OK if data from different regions is entered
 *          out of order? Ex. I ingest all of the Silo events in order, then do all
 *          of the field events in order. I don't think there's any interdependencies here.
 * 
 * What needs to be saved:
 *  - Array of events
 *    - Each event should be annotated with the last time it was loaded, what RPC address
 *  - Last block queried  
 *    - Defaults to an efficient block (ex. don't start at block 0, start at genesis)
 *      - Most efficient block depends on the event. For ex. after Replant the most efficient
 *        block from which to query silo events is the one at which Silo deposits first begin
 *        getting updated.
 *    - Can refetch from block X to latest block
 *    - How does this tie in with the subgraph?
 *      - If the subgraph fails and we have no events loaded, start all the way at 0
 *      - If the subgraph fails and we have some events loaded, query from the last event
 *        up to the most recent block and process accordingly
 *      - Should we ever bust the event cache for some reason?
 *        - User needs to be able to reset the cache
 *        - User needs to be able to choose whether the cache is saved or not
 *          - If we don't let them save, we should re-investigate using wallet native RPCs for 
 *            loading big data like this. Our poor Alchemy keys will get wrecked.
 *        - Not sure in what instance we'd want to bust the cache due to it being stale, given
 *          that ethereum events are set in stone and are processed sequentially to rebuild state.
 *          However we certainly need to let the user switch between wallets or networks.
 *  - Last updated at timestamp
 *  - The data source that last worked
 *    - Even if there are events loaded, we should know whether the visible data came from events or subgraph
 */

export const useFetchFarmerFertilizer = () => {
  /// Helpers
  const dispatch  = useDispatch();
  const replantId = useChainConstant(REPLANT_INITIAL_ID);

  /// Contracts
  const [fertContract]  = useBeanstalkFertilizerContract();
  const beanstalk       = useBeanstalkContract() as unknown as BeanstalkReplanted;
  const migrate         = useMigrateCall();

  /// Handlers 
  const fetch = useCallback(async (_account: string) => {
    const account = getAccount(_account);
    if (fertContract && account) {
      console.debug('[farmer/fertilizer/updater] FETCH: ', replantId.toString());

      // subgraph call?
      const ids = [
        6_000_000,
        3_500_000,
        3_495_182,
      ];

      const idStrings = ids.map((id) => id.toString())

      const [
        balances,
        unfertilized,
        fertilized,
      ] = await Promise.all([
        beanstalk.balanceOfBatchFertilizer(ids.map(() => account), idStrings),
        /// How much of each ID is Unfertilized (aka a Sprout)
        beanstalk.balanceOfUnfertilized(account, idStrings),
        /// How much of each ID is Fertilized   (aka a Fertilized Sprout)
        beanstalk.balanceOfFertilized(account, idStrings),
      ] as const);

      console.debug('[farmer/fertilizer/updater] RESULT: balances =', balances, unfertilized.toString(), fertilized.toString());
      
      /// Key the amount of fertilizer by ID.
      let sum = ZERO_BN;
      const fertById = balances.reduce((prev, curr, index) => {
        sum = sum.plus(new BigNumber(curr.amount.toString()));
        prev[ids[index]] = toTokenUnitsBN(curr.amount.toString(), 0);
        return prev;
      }, {} as { [key: number] : BigNumber });

      console.debug('[farmer/fertilizer/updater] fertById =', fertById, sum.toString());

      dispatch(updateFarmerFertilizer({
        tokens: fertById,
        unfertilized: toTokenUnitsBN(unfertilized.toString(), 6),
        fertilized:   toTokenUnitsBN(fertilized.toString(), 6),
      }));
    }
  }, [
    dispatch,
    beanstalk,
    fertContract,
    replantId,
  ]); 
  const clear = useCallback(() => { 
    dispatch(resetFertilizer());
  }, [dispatch]);

  return [fetch, clear] as const;
};

const FarmerFertilizerUpdater = () => {
  const [fetch, clear] = useFetchFarmerFertilizer();
  const { data: account } = useAccount();
  const chainId = useChainId();
  useEffect(() => {
    clear();
    if (account?.address) {
      fetch(account.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.address, chainId]);
  return null;
};

export default FarmerFertilizerUpdater;

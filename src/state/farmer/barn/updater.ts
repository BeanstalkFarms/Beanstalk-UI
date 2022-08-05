import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import BigNumber from 'bignumber.js';
import useChainConstant from '~/hooks/useChainConstant';
import { useBeanstalkContract, useFertilizerContract } from '~/hooks/useContract';
import { REPLANT_INITIAL_ID } from '~/hooks/useHumidity';
import useChainId from '~/hooks/useChain';
import { toTokenUnitsBN } from '~/util/index';
import { ZERO_BN } from '~/constants/index';
import useBlocks from '~/hooks/useBlocks';
import ERC1155EventProcessor from '~/lib/ERC1155/ERC1155EventProcessor';
import useAccount from '~/hooks/ledger/useAccount';
import { resetFarmerBarn, updateFarmerBarn } from './actions';
import useEvents, { GetQueryFilters } from '../events2/updater';
import { EventCacheName } from '../events2';

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
 *    
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

export const useFetchFarmerBarn = () => {
  /// Helpers
  const dispatch  = useDispatch();
  const replantId = useChainConstant(REPLANT_INITIAL_ID);

  /// Contracts
  const fertContract = useFertilizerContract();
  const beanstalk    = useBeanstalkContract();
  const blocks       = useBlocks();
  const account      = useAccount();

  /// Events
  const getQueryFilters = useCallback<GetQueryFilters>((
    _account,
    fromBlock,
    toBlock,
  ) => [
    /// Send FERT
    fertContract.queryFilter(
      fertContract.filters.TransferSingle(
        null,     // operator
        _account,  // from
        null,     // to
        null,     // id
        null,     // value
      ),
      fromBlock || blocks.FERTILIZER_LAUNCH_BLOCK,
      toBlock   || 'latest',
    ),
    fertContract.queryFilter(
      fertContract.filters.TransferBatch(
        null,     // operator
        _account,  // from
        null,     // to
        null,     // ids
        null,     // values
      ),
      fromBlock || blocks.FERTILIZER_LAUNCH_BLOCK,
      toBlock   || 'latest',
    ),
    /// Receive FERT
    fertContract.queryFilter(
      fertContract.filters.TransferSingle(
        null,     // operator
        null,     // from
        _account,  // to
        null,     // id
        null,     // value
      ),
      fromBlock || blocks.FERTILIZER_LAUNCH_BLOCK,
      toBlock   || 'latest',
    ),
    fertContract.queryFilter(
      fertContract.filters.TransferBatch(
        null,     // operator
        null,     // from
        _account,  // to
        null,     // ids
        null,     // values
      ),
      fromBlock || blocks.FERTILIZER_LAUNCH_BLOCK,
      toBlock   || 'latest',
    ),
  ], [blocks.FERTILIZER_LAUNCH_BLOCK, fertContract]);

  const [fetchEvents] = useEvents(EventCacheName.FERTILIZER, getQueryFilters);

  const initialized = (
    fertContract
    && account 
    && fetchEvents
  );

  /// Handlers 
  const fetch = useCallback(async () => {
    if (initialized) {
      console.debug('[farmer/fertilizer/updater] FETCH: ', replantId.toString());

      /// Fetch new events and re-run the processor.
      const allEvents = await fetchEvents();
      const { tokens } = new ERC1155EventProcessor(account, 0).ingestAll(allEvents || []);
      const ids = Object.keys(tokens);
      const idStrings = ids.map((id) => id.toString());

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
      }, {} as { [key: string] : BigNumber });

      console.debug('[farmer/fertilizer/updater] fertById =', fertById, sum.toString());

      dispatch(updateFarmerBarn({
        fertilizer: fertById,
        unfertilizedSprouts: toTokenUnitsBN(unfertilized.toString(), 6),
        fertilizedSprouts:   toTokenUnitsBN(fertilized.toString(), 6),
      }));
    }
  }, [
    dispatch,
    beanstalk,
    replantId,
    initialized,
    account,
    fetchEvents,
  ]); 

  const clear = useCallback(() => { 
    dispatch(resetFarmerBarn());
  }, [dispatch]);

  return [fetch, Boolean(initialized), clear] as const;
};

const FarmerBarnUpdater = () => {
  const [fetch, initialized, clear] = useFetchFarmerBarn();
  const account = useAccount();
  const chainId = useChainId();

  ///
  useEffect(() => {
    clear();
    if (account && initialized) fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, chainId, initialized]);

  return null;
};

export default FarmerBarnUpdater;

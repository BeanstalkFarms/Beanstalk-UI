import { useCallback, useEffect } from 'react';
import { REPLANTED_CHAINS } from 'constants/index';
import { useDispatch } from 'react-redux';
import { useBeanstalkContract } from 'hooks/useContract';
import useChainId from 'hooks/useChain';
import useMigrateCall from 'hooks/useMigrateCall';
import useBlocks from 'hooks/useBlocks';
import useAccount from 'hooks/ledger/useAccount';
import EventProcessor from 'lib/Beanstalk/EventProcessor';
import useWhitelist from 'hooks/useWhitelist';
import useSeason from 'hooks/useSeason';
import useEventProcessor from 'hooks/useEventProcessor';
import useEventParsingParams from 'hooks/ledger/useEventParsingParams';
import { EventCacheName } from '../events2';
import useEvents, { GetQueryFilters } from '../events2/updater';
import { updateFarmerField, resetFarmerField } from './actions';

export const useFetchFarmerField = () => {
  /// Helpers
  const dispatch = useDispatch();

  /// Contracts
  const beanstalk = useBeanstalkContract();
  const migrate = useMigrateCall();

  /// Data
  const account = useAccount();
  const chainId = useChainId();
  const blocks = useBlocks();
  const whitelist = useWhitelist();
  const season = useSeason();

  /// v1
  const eventParsingParameters = useEventParsingParams();
  const processFarmerEventsV1 = useEventProcessor();

  /// Events
  const getQueryFilters = useCallback<GetQueryFilters>(
    (_account, fromBlock, toBlock) => [
      beanstalk.queryFilter(
        beanstalk.filters['Sow(address,uint256,uint256,uint256)'](_account),
        fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
        toBlock || 'latest'
      ),
      beanstalk.queryFilter(
        beanstalk.filters.Harvest(_account),
        fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
        toBlock || 'latest'
      ),
      beanstalk.queryFilter(
        beanstalk.filters.PlotTransfer(_account, null), // from
        fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
        toBlock || 'latest'
      ),
      beanstalk.queryFilter(
        beanstalk.filters.PlotTransfer(null, _account), // to
        fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
        toBlock || 'latest'
      ),
    ],
    [blocks, beanstalk]
  );

  const [fetchFieldEvents] = useEvents(EventCacheName.FIELD, getQueryFilters);

  /// Handlers
  const fetch = useCallback(async () => {
    if (beanstalk && account && fetchFieldEvents && eventParsingParameters) {
      const allEvents = await fetchFieldEvents();

      if (!allEvents) return;

      if (REPLANTED_CHAINS.has(chainId)) {
        const p = new EventProcessor(account, { season, whitelist });
        p.ingestAll(allEvents);

        // Update Field
        dispatch(
          updateFarmerField(
            p.parsePlots(eventParsingParameters.harvestableIndex)
          )
        );
      } else {
        const results = processFarmerEventsV1(
          allEvents,
          eventParsingParameters
        );

        // TEMP:
        // Hardcode this because the event process returns `beanDepositsBalance`, etc.
        dispatch(
          updateFarmerField({
            plots: results.plots,
            pods: results.podBalance,
            harvestablePlots: results.harvestablePlots,
            harvestablePods: results.harvestablePodBalance,
          })
        );
      }
    }
  }, [
    dispatch,
    fetchFieldEvents,
    beanstalk,
    // v2
    season,
    whitelist,
    account,
    // v1
    chainId,
    eventParsingParameters,
    processFarmerEventsV1,
  ]);

  const clear = useCallback(() => {
    console.debug('[farmer/silo/useFarmerSilo] CLEAR');
    dispatch(resetFarmerField());
  }, [dispatch]);

  return [fetch, clear] as const;
};

// -- Updater

const FarmerFieldUpdater = () => {
  const [fetch, clear] = useFetchFarmerField();
  const account = useAccount();
  const chainId = useChainId();

  useEffect(() => {
    clear();
    if (account) fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, chainId]);

  return null;
};

export default FarmerFieldUpdater;

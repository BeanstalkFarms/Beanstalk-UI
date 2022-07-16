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

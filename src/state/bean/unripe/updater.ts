import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useBeanstalkContract } from '~/hooks/useContract';
import useChainId from '~/hooks/useChain';
import { BeanstalkReplanted } from 'generated/index';
import useTokenMap from '~/hooks/useTokenMap';
import { tokenResult } from '~/util/index';
import BigNumber from 'bignumber.js';
import { AddressMap } from '~/constants/index';
import { resetUnripe, updateUnripe } from './actions';
import { UNRIPE_TOKENS } from '../../../constants/tokens';

// Hook
export const useUnripe = () => {
  const dispatch = useDispatch();
  const beanstalk = useBeanstalkContract() as unknown as BeanstalkReplanted;
  const unripeTokens = useTokenMap(UNRIPE_TOKENS);

  const fetch = useCallback(async () => {
    if (beanstalk) {
      try {
        const tokenAddresses = Object.keys(unripeTokens); // ['0x1BEA0', '0x1BEA1']
        const results = await Promise.all(
          tokenAddresses.map((addr) => (
            // VERIFY: the percentage returned uses the underlying token's decimals
            beanstalk.getPercentPenalty(addr).then(tokenResult(unripeTokens[addr]))
          ))
        ); // [BigNumber(0.001), BigNumber(0.0014)]
        dispatch(updateUnripe({
          chopRates: tokenAddresses.reduce<AddressMap<BigNumber>>((prev, key, index) => {
            prev[key] = results[index];
            return prev;
          }, {})
        }));
      } catch (err) {
        /// ???
        console.error(err);
      }
    }
  }, [
    dispatch,
    beanstalk,
    unripeTokens,
  ]);

  const clear = useCallback(() => {
    dispatch(resetUnripe());
  }, [dispatch]);

  return [fetch, clear] as const;
};

// Component
const UnripeUpdater = () => {
  const [fetch, clear] = useUnripe();
  const chainId = useChainId();
  
  useEffect(() => {
    clear();
    fetch();
    // NOTE: 
    // The below requires that useChainId() is called last in the stack of hooks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  return null;
};

export default UnripeUpdater;

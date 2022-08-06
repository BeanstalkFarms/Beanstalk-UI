import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import BigNumber from 'bignumber.js';
import { BARNRAISE_CUSTODIAN_ADDRESSES, USDC_ADDRESSES } from '~/constants/addresses';
import { BEAN } from '~/constants/tokens';
import useChainConstant from '~/hooks/useChainConstant';
import { useBeanstalkContract, useBeanstalkFertilizerContract, useERC20Contract } from '~/hooks/useContract';
import { tokenResult, bigNumberResult } from '~/util';
import useChainId from '~/hooks/useChain';
import { resetBarn, updateBarn } from './actions';

const fetchGlobal = fetch;

export const useBarn = () => {
  const dispatch        = useDispatch();
  const beanstalk       = useBeanstalkContract();
  const [fertContract]  = useBeanstalkFertilizerContract();
  const [usdcContract]  = useERC20Contract(USDC_ADDRESSES);
  const custodian       = useChainConstant(BARNRAISE_CUSTODIAN_ADDRESSES);

  // Handlers
  const fetch = useCallback(async () => {
    if (fertContract && usdcContract && custodian) {
      console.debug('[beanstalk/fertilizer/updater] FETCH');
      const [
        remaining,
        totalRaised,
        humidity,
        currentBpf,
        endBpf,
      ] = await Promise.all([
        beanstalk.remainingRecapitalization().then(tokenResult(BEAN)),
        await fetchGlobal('https://api.thegraph.com/subgraphs/name/publiuss/fertilizer', {
          method: 'POST',
          body: JSON.stringify({
            query: `
              query {
                fertilizers {
                  totalSupply
                }
              }
            `
          })
        }).then((r) => r.json()).then((r) => new BigNumber(r.data.fertilizers?.[0]?.totalSupply || 0)),
        beanstalk.getCurrentHumidity().then(bigNumberResult),
        beanstalk.beansPerFertilizer().then(bigNumberResult),
        beanstalk.getEndBpf().then(bigNumberResult),
      ] as const);
      console.debug(`[beanstalk/fertilizer/updater] RESULT: remaining = ${remaining.toFixed(2)}`);
      dispatch(updateBarn({
        remaining,
        totalRaised,
        humidity,
        currentBpf,
        endBpf
      }));
    }
  }, [
    dispatch,
    beanstalk,
    fertContract,
    usdcContract,
    custodian
  ]); 
  const clear = useCallback(() => {
    dispatch(resetBarn());
  }, [dispatch]);

  return [fetch, clear] as const;
};

const BarnUpdater = () => {
  const [fetch, clear] = useBarn();
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

export default BarnUpdater;

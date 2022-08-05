import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BARNRAISE_CUSTODIAN_ADDRESSES, USDC_ADDRESSES } from '~/constants/addresses';
import { BEAN, USDC } from '~/constants/tokens';
import useChainConstant from '~/hooks/useChainConstant';
import { useBeanstalkContract, useBeanstalkFertilizerContract, useERC20Contract } from '~/hooks/useContract';
import { tokenResult, bigNumberResult } from '~/util/index';
import useChainId from '~/hooks/useChain';
import useMigrateCall from '~/hooks/useMigrateCall';
import { Beanstalk, BeanstalkReplanted } from 'generated/index';
import { ZERO_BN } from '~/constants/index';
import BigNumber from 'bignumber.js';
import { resetBarn, updateBarn } from './actions';

export const useBarn = () => {
  const dispatch        = useDispatch();
  const beanstalk       = useBeanstalkContract() as unknown as BeanstalkReplanted;
  const [fertContract]  = useBeanstalkFertilizerContract();
  const [usdcContract]  = useERC20Contract(USDC_ADDRESSES);
  const custodian       = useChainConstant(BARNRAISE_CUSTODIAN_ADDRESSES);
  const migrate         = useMigrateCall();

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
        // Amount of Fertilizer remaining to be sold
        migrate<Beanstalk, BeanstalkReplanted>(beanstalk, [
          () => fertContract.remaining().then(tokenResult(BEAN)),
          () => beanstalk.remainingRecapitalization().then(tokenResult(BEAN)),
        ]),
        // Amount of USDC already raised
        migrate<Beanstalk, BeanstalkReplanted>(beanstalk, [
          () => usdcContract.balanceOf(custodian).then(tokenResult(USDC)),
          () => Promise.resolve(ZERO_BN), // not possible after Replant
        ]),
        // Humidity
        migrate(beanstalk, [
          () => Promise.resolve(new BigNumber(500)),
          () => beanstalk.getCurrentHumidity().then(bigNumberResult)
        ]),
        // Current BPF
        migrate(beanstalk, [
          () => Promise.resolve(ZERO_BN),
          () => beanstalk.beansPerFertilizer().then(bigNumberResult)
        ]),
        // End BPF
        migrate(beanstalk, [
          () => Promise.resolve(ZERO_BN),
          () => beanstalk.getEndBpf().then(bigNumberResult)
        ]),
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
    migrate,
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

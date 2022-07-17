import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { BEAN_TO_STALK, BEAN_TO_SEEDS, ZERO_BN } from 'constants/index';
import { UNRIPE_BEAN, UNRIPE_BEAN_CRV3 } from 'constants/tokens';
import { AppState } from 'state';
import { MaxBN } from 'util/index';
import useFarmerSiloBalances from './useFarmerSiloBalances';
import useGetChainToken from './useGetChainToken';

/**
 * Calculate the Farmer's current number of revitalized Stalk and Seeds.
 */
export default function useRevitalized() {
  /// Helpers
  const getChainToken = useGetChainToken();

  /// Balances
  const balances = useFarmerSiloBalances();
  const beanstalkSilo = useSelector<AppState, AppState['_beanstalk']['silo']>(
    (state) => state._beanstalk.silo
  );

  return useMemo(() => {
    const urBean = getChainToken(UNRIPE_BEAN);
    const urBeanCrv3 = getChainToken(UNRIPE_BEAN_CRV3);
    const expectedBDV = (addr: string) =>
      (balances[addr]?.deposited.amount || ZERO_BN).times(
        beanstalkSilo.balances[addr]?.bdvPerToken || ZERO_BN
      );
    const actualBDV = (addr: string) =>
      balances[addr]?.deposited.bdv || ZERO_BN;

    // flooring at 0 prevents edge case where bdv < haircut during testing
    const delta1 = MaxBN(
      expectedBDV(urBean.address).minus(actualBDV(urBean.address)),
      ZERO_BN
    );
    const delta2 = MaxBN(
      expectedBDV(urBeanCrv3.address).minus(actualBDV(urBeanCrv3.address)),
      ZERO_BN
    );
    const delta = delta1.plus(delta2);

    console.debug('[useRevitalized] delta1 = ', delta1);
    console.debug('[useRevitalized] delta2 = ', delta2);

    return {
      revitalizedStalk: delta.times(BEAN_TO_STALK),
      revitalizedSeeds: delta.times(BEAN_TO_SEEDS),
    };
  }, [balances, beanstalkSilo, getChainToken]);
}

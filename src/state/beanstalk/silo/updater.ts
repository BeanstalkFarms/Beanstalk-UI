import { useCallback, useEffect, useMemo } from 'react';
import { BEAN_TO_SEEDS, BEAN_TO_STALK,  TokenMap, ZERO_BN } from 'constants/index';
import { useDispatch } from 'react-redux';
import { bigNumberResult } from 'util/Ledger';
import { tokenResult } from 'util/Tokens';

import { BEAN, BEAN_CRV3_LP, BEAN_ETH_UNIV2_LP, BEAN_LUSD_LP, SEEDS, STALK } from 'constants/tokens';
import { useBeanstalkContract } from 'hooks/useContract';
import { useGeneralizedWhitelist } from 'hooks/useWhitelist';
import BigNumber from 'bignumber.js';
import { resetBeanstalkSilo, updateBeanstalkSiloAssets } from './actions';
import { useGetChainConstant } from 'hooks/useChainConstant';
import { BeanstalkSiloBalance } from './index';

export const useBeanstalkSilo = () => {
  const dispatch = useDispatch();
  const beanstalk = useBeanstalkContract();
  const WHITELIST = useGeneralizedWhitelist();

  const getChainConstant = useGetChainConstant();
  const SiloTokens = useMemo(() => ({
    Bean: getChainConstant(BEAN),
    BeanEthLP: getChainConstant(BEAN_ETH_UNIV2_LP),
    BeanCrv3LP: getChainConstant(BEAN_CRV3_LP),
    BeanLusdLP: getChainConstant(BEAN_LUSD_LP),
  }), [getChainConstant]);

  // Handlers
  const fetch = useCallback(async () => {
    if (beanstalk) {
      console.debug('[beanstalk/silo/useBeanstalkSilo] FETCH');

      const [
        stalkTotal,
        seedsTotal,
        rootsTotal,
        earnedBeansTotal,
        depositedBeansTotal,
        withdrawnBeansTotal,
        depositedLpTotal,
        withdrawnLpTotal,
        poolBalancesTotal,
      ] = await Promise.all([
        beanstalk.totalStalk().then(tokenResult(STALK)),
        beanstalk.totalSeeds().then(tokenResult(SEEDS)),
        beanstalk.totalRoots().then(bigNumberResult),
        beanstalk.totalFarmableBeans().then(tokenResult(BEAN)),   // internally, earned == farmable
        beanstalk.totalDepositedBeans().then(tokenResult(BEAN)),
        beanstalk.totalWithdrawnBeans().then(tokenResult(BEAN)),
        beanstalk.totalDepositedLP().then(tokenResult(BEAN_ETH_UNIV2_LP)),
        beanstalk.totalWithdrawnLP().then(tokenResult(BEAN_ETH_UNIV2_LP)),
        //
        Promise.all(
          Object.keys(WHITELIST).map((addr) => (
            Promise.all([
              beanstalk.getTotalDeposited(addr).then(tokenResult(WHITELIST[addr])),
              beanstalk.getTotalWithdrawn(addr).then(tokenResult(WHITELIST[addr]))
            ]).then((data) => ({
              token: addr,
              deposited: data[0],
              withdrawn: data[1],
            }))
          ))
        )
      ] as const);

      console.debug('[beanstalk/silo/useBeanstalkSilo] RESULT', [stalkTotal, seedsTotal]);

      // farmableStalk and farmableSeed are derived from farmableBeans
      // because 1 bean = 1 stalk, 2 seeds
      const earnedStalkTotal = earnedBeansTotal.times(BEAN_TO_STALK);
      const activeStalkTotal = stalkTotal.plus(earnedStalkTotal);
      const earnedSeedTotal = earnedBeansTotal.times(BEAN_TO_SEEDS);

      // total:   active & inactive
      // active:  owned, actively earning other silo assets
      // earned:  active but not yet deposited into a Season
      // grown:   inactive
      dispatch(updateBeanstalkSiloAssets({
        beans: {
          earned: earnedBeansTotal,
          total: depositedBeansTotal,
        },
        stalk: {
          active: activeStalkTotal,
          earned: earnedStalkTotal,
          grown: ZERO_BN,
          total: activeStalkTotal,
        },
        seeds: {
          active: seedsTotal,
          earned: earnedSeedTotal,
          total: seedsTotal.plus(earnedSeedTotal),
        },
        roots: {
          total: rootsTotal,
        },
        tokens: {
          [SiloTokens.Bean.address]: {
            deposited: {
              amount:  depositedBeansTotal,
              bdv:    depositedBeansTotal,
            },
            withdrawn: {
              amount:  withdrawnBeansTotal,
              bdv:    withdrawnBeansTotal,
            }
          },
          [SiloTokens.BeanEthLP.address]: {
            deposited: {
              amount:  depositedLpTotal,
              bdv:    new BigNumber(0),
            },
            withdrawn: {
              amount:  withdrawnLpTotal,
              bdv:    new BigNumber(0),
            }
          },
          ...poolBalancesTotal.reduce((agg, curr) => {
            agg[curr.token] = {
              deposited: {
                amount: curr.deposited,
                bdv: new BigNumber(0),
              },
              withdrawn: {
                amount: curr.withdrawn,
                bdv: new BigNumber(0),
              }
            };
            return agg;
          }, {} as TokenMap<BeanstalkSiloBalance>)
        }
      }));
    }
  }, [
    SiloTokens.Bean.address,
    SiloTokens.BeanEthLP.address,
    dispatch,
    beanstalk,
    WHITELIST
  ]);

  const clear = useCallback(() => {
    console.debug('[beanstalk/silo/useBeanstalkSilo] CLEAR');
    dispatch(resetBeanstalkSilo());
  }, [dispatch]);

  return [fetch, clear] as const;
};

// -- Updater

const BeanstalkSiloUpdater = () => {
  const [fetch, clear] = useBeanstalkSilo();

  useEffect(() => {
    clear();
    fetch();
  }, [clear, fetch]);

  return null;
};

export default BeanstalkSiloUpdater;

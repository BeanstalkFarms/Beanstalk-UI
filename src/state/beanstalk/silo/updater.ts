import { useCallback, useEffect, useMemo } from 'react';
import { BEAN_TO_SEEDS, BEAN_TO_STALK,  REPLANTED_CHAINS,  SupportedChainId,  TokenMap, ZERO_BN } from 'constants/index';
import { useDispatch } from 'react-redux';
import { bigNumberResult } from 'util/Ledger';
import { tokenResult, toStringBaseUnitBN } from 'util/index';
import { BEAN, BEAN_CRV3_LP, BEAN_ETH_UNIV2_LP, BEAN_LUSD_LP, SEEDS, STALK } from 'constants/tokens';
import { useBeanstalkContract } from 'hooks/useContract';
import useMigrateCall from 'hooks/useMigrateCall';
import { Beanstalk, BeanstalkReplanted } from 'generated/index';
import useWhitelist, { useGeneralizedWhitelist } from 'hooks/useWhitelist';
import BigNumber from 'bignumber.js';
import { useGetChainConstant } from 'hooks/useChainConstant';
import useChainId from 'hooks/useChain';
import { resetBeanstalkSilo, updateBeanstalkSilo } from './actions';
import { BeanstalkSiloBalance } from './index';

export const useBeanstalkSilo = () => {
  const dispatch = useDispatch();
  const beanstalk = useBeanstalkContract();
  const migrate = useMigrateCall();
  const chainId = useChainId();
  const FULL_WHITELIST = useWhitelist();
  const GEN_WHITELIST  = useGeneralizedWhitelist();
  const IS_REPLANTED = REPLANTED_CHAINS.has(chainId);
  const WHITELIST = IS_REPLANTED  ? FULL_WHITELIST : GEN_WHITELIST;

  const getChainConstant = useGetChainConstant();
  const SiloTokens = useMemo(() => ({
    Bean:       getChainConstant(BEAN),
    BeanEthLP:  getChainConstant(BEAN_ETH_UNIV2_LP),
    BeanCrv3LP: getChainConstant(BEAN_CRV3_LP),
    BeanLusdLP: getChainConstant(BEAN_LUSD_LP),
  }), [getChainConstant]);

  // Handlers
  const fetch = useCallback(async () => {
    if (beanstalk) {
      console.debug('[beanstalk/silo/useBeanstalkSilo] FETCH: whitelist = ', WHITELIST);

      const [
        // 0
        stalkTotal,
        seedsTotal,
        rootsTotal,
        // 1
        earnedBeansTotal,
        // 2
        depositedBeansTotal,
        withdrawnBeansTotal,
        // 3
        depositedLpTotal,
        withdrawnLpTotal,
        // 4
        poolBalancesTotal,
        // 5
        withdrawSeasons,
      ] = await Promise.all([
        // 0
        beanstalk.totalStalk().then(tokenResult(STALK)),  // Includes Stalk from Earned Beans.
        beanstalk.totalSeeds().then(tokenResult(SEEDS)),  // 
        beanstalk.totalRoots().then(bigNumberResult),     //
        // 1
        migrate<Beanstalk, BeanstalkReplanted>(beanstalk, [
          (b) => b.totalFarmableBeans(),
          (b) => b.totalEarnedBeans(),
        ]).then(tokenResult(BEAN)),
        // 2
        migrate<Beanstalk, BeanstalkReplanted>(beanstalk, [
          (b) => b.totalDepositedBeans(),
          () => Promise.resolve(ZERO_BN), // FIXME
        ]).then(tokenResult(BEAN)),
        migrate<Beanstalk, BeanstalkReplanted>(beanstalk, [
          (b) => b.totalWithdrawnBeans(),
          () => Promise.resolve(ZERO_BN), // FIXME
        ]).then(tokenResult(BEAN)),
        // 3
        migrate<Beanstalk, BeanstalkReplanted>(beanstalk, [
          (b) => b.totalDepositedLP(),
          () => Promise.resolve(ZERO_BN), // FIXME
        ]).then(tokenResult(BEAN_ETH_UNIV2_LP)),
        migrate<Beanstalk, BeanstalkReplanted>(beanstalk, [
          (b) => b.totalWithdrawnLP(),
          () => Promise.resolve(ZERO_BN), // FIXME
        ]).then(tokenResult(BEAN_ETH_UNIV2_LP)),
        // 4
        Promise.all(
          Object.keys(WHITELIST).map((addr) => (
            Promise.all([
              // FIXME: duplicate tokenResult optimization
              beanstalk.getTotalDeposited(addr).then(tokenResult(WHITELIST[addr])),
              beanstalk.getTotalWithdrawn(addr).then(tokenResult(WHITELIST[addr])),
              IS_REPLANTED ? (
                // BEAN will always have a fixed BDV of 1,
                // skip to save a network request
                WHITELIST[addr] === SiloTokens.Bean 
                  ? new BigNumber(1)
                  : (beanstalk as unknown as BeanstalkReplanted)
                      .bdv(addr, toStringBaseUnitBN(1, WHITELIST[addr].decimals))
                      .then(tokenResult(BEAN))
                      .catch((err) => {
                        console.error(`Failed to fetch BDV: ${addr}`)
                        console.error(err)
                        throw err;
                      })
              ) : Promise.resolve(ZERO_BN)
            ]).then((data) => ({
              token: addr.toLowerCase(),
              deposited: data[0],
              withdrawn: data[1],
              bdvPerToken: data[2],
            }))
          ))
        ),
        // 5
        migrate<Beanstalk, BeanstalkReplanted>(beanstalk, [
          (b) => b.withdrawSeasons(),
          (b) => b.withdrawFreeze(),
        ]).then(bigNumberResult),
      ] as const);

      console.debug('[beanstalk/silo/useBeanstalkSilo] RESULT', [stalkTotal, seedsTotal, poolBalancesTotal[0], poolBalancesTotal[0].deposited.toString(), withdrawSeasons]);

      // farmableStalk and farmableSeed are derived from farmableBeans
      // because 1 bean = 1 stalk, 2 seeds
      const activeStalkTotal = (
        chainId === SupportedChainId.MAINNET
          ? stalkTotal // .minus(219316.5007560000) // subtract exploiter stalk balance
          : stalkTotal
      );
      const earnedStalkTotal = earnedBeansTotal.times(BEAN_TO_STALK);
      const earnedSeedTotal  = earnedBeansTotal.times(BEAN_TO_SEEDS);

      // total:   active & inactive
      // active:  owned, actively earning other silo assets
      // earned:  active but not yet deposited into a Season
      // grown:   inactive
      dispatch(updateBeanstalkSilo({
        // Balances
        balances: {
          ...(IS_REPLANTED ? {} : {
            [SiloTokens.Bean.address]: {
              bdvPerToken: ZERO_BN,
              deposited: {
                amount:  depositedBeansTotal,
              },
              withdrawn: {
                amount:  withdrawnBeansTotal,
              }
            },
            [SiloTokens.BeanEthLP.address]: {
              bdvPerToken: ZERO_BN,
              deposited: {
                amount:  depositedLpTotal,
              },
              withdrawn: {
                amount:  withdrawnLpTotal,
              }
            },
          }),
          // Replanted Beanstalk contains data about
          // all whitelisted silo tokens in `poolBalancesTotal`
          ...poolBalancesTotal.reduce((agg, curr) => {
            agg[curr.token] = {
              bdvPerToken: curr.bdvPerToken,
              deposited: {
                amount: curr.deposited,
              },
              withdrawn: {
                amount: curr.withdrawn,
              }
            };
            return agg;
          }, {} as TokenMap<BeanstalkSiloBalance>)
        },
        // Rewards
        beans: {
          earned: earnedBeansTotal,
          total:  depositedBeansTotal,
        },
        stalk: {
          active: activeStalkTotal,
          earned: earnedStalkTotal,
          grown:  ZERO_BN,
          total:  activeStalkTotal.plus(ZERO_BN),
        },
        seeds: {
          active: seedsTotal,
          earned: earnedSeedTotal,
          total:  seedsTotal.plus(earnedSeedTotal),
        },
        roots: {
          total:  rootsTotal,
        },
        // Metadata
        withdrawSeasons: withdrawSeasons
      }));
    }
  }, [
    SiloTokens.Bean,
    SiloTokens.BeanEthLP.address,
    dispatch,
    migrate,
    beanstalk,
    WHITELIST,
    IS_REPLANTED,
    chainId
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

import { useCallback, useEffect, useMemo } from 'react';
import { BEAN_TO_SEEDS, BEAN_TO_STALK, LP_TO_SEEDS, REPLANTED_CHAINS, ZERO_BN } from 'constants/index';
import { useDispatch, useSelector } from 'react-redux';
import { BEAN, BEAN_CRV3_LP, BEAN_ETH_UNIV2_LP, BEAN_LUSD_LP, SEEDS, STALK } from 'constants/tokens';
import { useBeanstalkContract } from 'hooks/useContract';
import useChainId from 'hooks/useChain';
import { bigNumberResult, tokenResult } from 'util/index';
import useMigrateCall from 'hooks/useMigrateCall';
import { Beanstalk, BeanstalkReplanted } from 'generated/index';
import useBlocks from 'hooks/useBlocks';
import { ethers } from 'ethers';
import useAccount from 'hooks/ledger/useAccount';
import EventProcessor from 'lib/Beanstalk/EventProcessor';
import useWhitelist from 'hooks/useWhitelist';
import useSeason from 'hooks/useSeason';
import BigNumber from 'bignumber.js';
import useEventProcessor, { EventParsingParameters } from 'hooks/useEventProcessor';
import { useGetChainConstant } from 'hooks/useChainConstant';
import { AppState } from 'state';
import { parseWithdrawals } from 'util/Crates';
import { DepositCrate } from '.';
import { EventCacheName } from '../events2';
import useEvents, { GetQueryFilters } from '../events2/updater';
import { resetFarmerSilo, updateFarmerSiloBalances, UpdateFarmerSiloBalancesPayload, updateFarmerSiloRewards } from './actions';
import useEventParsingParams from 'hooks/ledger/useEventParsingParams';

export const useFetchFarmerSilo = () => {
  /// Helpers
  const dispatch  = useDispatch();

  /// Contracts
  const beanstalk = useBeanstalkContract();
  const migrate   = useMigrateCall();

  /// Data
  const account   = useAccount();
  const chainId   = useChainId();
  const blocks    = useBlocks();
  const whitelist = useWhitelist();
  const season    = useSeason();

  /// v1
  const processFarmerEventsV1   = useEventProcessor();
  const eventParsingParameters  = useEventParsingParams();
  const getChainConstant = useGetChainConstant();
  const SiloTokens = useMemo(() => ({
    Bean:       getChainConstant(BEAN),
    BeanEthLP:  getChainConstant(BEAN_ETH_UNIV2_LP),
    BeanCrv3LP: getChainConstant(BEAN_CRV3_LP),
    BeanLusdLP: getChainConstant(BEAN_LUSD_LP),
  }), [getChainConstant]);

  /// Events
  const getQueryFilters = useCallback<GetQueryFilters>((
    _account,
    fromBlock,
    toBlock,
  ) => migrate<Beanstalk, BeanstalkReplanted, Promise<ethers.Event[]>[]>(beanstalk, [
      (b) => ([
        // Silo (v1)
        b.queryFilter(
          b.filters.BeanDeposit(_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest'
        ),
        b.queryFilter(
          b.filters.BeanWithdraw(_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest'
        ),
        b.queryFilter(
          b.filters['BeanRemove(address,uint32[],uint256[],uint256)'](_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest'
        ),
        b.queryFilter(
          b.filters.BeanClaim(_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest'
        ),
        b.queryFilter(
          b.filters['LPDeposit(address,uint256,uint256,uint256)'](_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest'
        ),
        b.queryFilter(
          b.filters.LPWithdraw(_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest'
        ),
        b.queryFilter(
          b.filters['LPRemove(address,uint32[],uint256[],uint256)'](_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest'
        ),
        b.queryFilter(
          b.filters.LPClaim(_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest'
        ),
        // Silo (Generalized v1)
        b.queryFilter(
          b.filters.Deposit(_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest'
        ),
        b.queryFilter(
          b.filters.Withdraw(_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest'
        ),
        b.queryFilter(
          b.filters.RemoveSeason(_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest'
        ),
        b.queryFilter(
          b.filters.RemoveSeasons(_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest'
        ),
        b.queryFilter(
          b.filters.ClaimSeason(_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest'
        ),
        b.queryFilter(
          b.filters['ClaimSeasons(address,address,uint32[],uint256)'](_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest'
        ),
      ]),
      (b) => ([
        // Silo (Generalized v2)
        b.queryFilter(
          b.filters.AddDeposit(_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest',
        ),
        b.queryFilter(
          b.filters.AddWithdrawal(_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest',
        ),
        b.queryFilter(
          b.filters.RemoveWithdrawal(_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest',
        ),
        b.queryFilter(
          b.filters.RemoveWithdrawals(_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest',
        ),
        b.queryFilter(
          b.filters.RemoveDeposit(_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest',
        ),
        b.queryFilter(
          b.filters['RemoveDeposits(address,address,uint32[],uint256[],uint256)'](_account),
          fromBlock || blocks.BEANSTALK_GENESIS_BLOCK,
          toBlock   || 'latest',
        ),
      ]),
    ]), [
    migrate,
    blocks,
    beanstalk,
  ]);
  
  const [fetchSiloEvents] = useEvents(EventCacheName.SILO, getQueryFilters);

  /// Handlers
  const fetch = useCallback(async () => {
    if (beanstalk && account && fetchSiloEvents && eventParsingParameters) {
      console.debug('[farmer/silo/useFarmerSilo] FETCH');

      const [
        stalkBalance,
        grownStalkBalance,
        seedBalance,
        rootBalance,
        earnedBeanBalance,
        allEvents = []
      ] = await Promise.all([
        // FIXME: multicall this section
        /// balanceOfStalk() returns `stalk + earnedStalk`
        beanstalk.balanceOfStalk(account).then(tokenResult(STALK)),
        beanstalk.balanceOfGrownStalk(account).then(tokenResult(STALK)),
        beanstalk.balanceOfSeeds(account).then(tokenResult(SEEDS)),
        beanstalk.balanceOfRoots(account).then(bigNumberResult),
        migrate<Beanstalk, BeanstalkReplanted>(beanstalk, [
          (b) => b.balanceOfFarmableBeans(account),
          (b) => b.balanceOfEarnedBeans(account),
        ]).then(tokenResult(BEAN)),
        fetchSiloEvents(),
      ] as const);

      // console.debug('[farmer/silo/useFarmerSilo] RESULT', [
      //   stalkBalance.toString(),
      //   seedBalance.toString(),
      //   rootBalance.toString(),
      //   earnedBeanBalance.toString(),
      //   grownStalkBalance.toString(),
      // ]);

      /// stalk + earnedStalk
      const activeStalkBalance    = stalkBalance;
      /// earnedStalk (this is already included in activeStalk)
      const earnedStalkBalance    = earnedBeanBalance.times(BEAN_TO_STALK);
      /// earnedSeed  (aka plantable seeds)
      const plantableSeedBalance  = earnedBeanBalance.times(BEAN_TO_SEEDS);
      
      // total:   active & inactive
      // active:  owned, actively earning other silo assets
      // earned:  active but not yet deposited into a Season
      // grown:   inactive
      dispatch(updateFarmerSiloRewards({
        beans: {
          earned: earnedBeanBalance,
        },
        stalk: {
          active: activeStalkBalance,
          earned: earnedStalkBalance,
          grown:  grownStalkBalance,
          total:  activeStalkBalance.plus(grownStalkBalance),
        },
        seeds: {
          active:    seedBalance,
          plantable: plantableSeedBalance,
          total:     seedBalance.plus(plantableSeedBalance),
        },
        roots: {
          total: rootBalance,
        }
      }));

      if (REPLANTED_CHAINS.has(chainId)) {
        const p = new EventProcessor(account, { season, whitelist });
        const results = p.ingestAll(allEvents);

        dispatch(updateFarmerSiloBalances(
          Object.keys(whitelist).reduce<UpdateFarmerSiloBalancesPayload>((prev, addr) => {
            prev[addr] = {
              deposited: {
                ...Object.keys(results.deposits[addr]).reduce((dep, s) => {
                  const crate = results.deposits[addr][s];
                  const bdv   = crate.bdv;
                  dep.amount  = dep.amount.plus(crate.amount);
                  dep.bdv     = dep.bdv.plus(bdv);
                  dep.crates.push({
                    season: new BigNumber(s),
                    amount: crate.amount,
                    bdv:    bdv,
                    stalk:  whitelist[addr].getStalk(bdv),
                    seeds:  whitelist[addr].getSeeds(bdv),
                  });
                  return dep;
                }, {
                  amount: ZERO_BN,
                  bdv:    ZERO_BN,
                  crates: [] as DepositCrate[],
                })
              },
              // Splits into 'withdrawn' and 'claimable'
              ...p.parseWithdrawals(addr, season)
            };
            return prev;
          }, {})
        ));
      } else {
        const results = processFarmerEventsV1(allEvents, eventParsingParameters);
        console.debug('[farmer/updater] ...processed events!', results);

        dispatch(updateFarmerSiloBalances({
          [SiloTokens.Bean.address]: {
            deposited: Object.keys(results.userBeanDeposits).reduce((prev, s) => {
              const tokenAmount = results.userBeanDeposits[s];
              const bdv         = tokenAmount; // only for Bean
              prev.amount = prev.amount.plus(tokenAmount);
              prev.bdv   = prev.bdv.plus(bdv);
              prev.crates.push({
                amount: tokenAmount,
                bdv:    bdv,
                season: new BigNumber(s),
                stalk:  SiloTokens.Bean.getStalk(bdv),
                seeds:  SiloTokens.Bean.getSeeds(bdv),
              });
              return prev;
            }, {
              amount:  new BigNumber(0),
              bdv:    new BigNumber(0),
              crates: [] as DepositCrate[],
            }),
            ...parseWithdrawals(results.beanWithdrawals, eventParsingParameters.season)
          },
          [SiloTokens.BeanEthLP.address]: {
            deposited: Object.keys(results.userLPDeposits).reduce((prev, s) => {
              const tokenAmount = results.userLPDeposits[s];
              // LEGACY: 
              // BDV of a LP deposit was previously calculated via
              // 'userLPSeedDeposits / 4'.
              const bdv   = results.userLPSeedDeposits[s].div(LP_TO_SEEDS);
              prev.amount = prev.amount.plus(tokenAmount);
              prev.bdv    = prev.bdv.plus(bdv);
              prev.crates.push({
                amount: tokenAmount,
                bdv:    bdv,
                season: new BigNumber(s),
                stalk:  SiloTokens.BeanEthLP.getStalk(bdv),
                seeds:  SiloTokens.BeanEthLP.getSeeds(bdv),
              });
              return prev;
            }, {
              amount:  new BigNumber(0),
              bdv:    new BigNumber(0),
              crates: [] as DepositCrate[],
            }),
            ...parseWithdrawals(results.lpWithdrawals, eventParsingParameters.season)
          },
          [SiloTokens.BeanCrv3LP.address]: {
            deposited: Object.keys(results.userCurveDeposits).reduce((prev, s) => {
              const tokenAmount = results.userCurveDeposits[s];
              const bdv         = results.userCurveBDVDeposits[s];
              prev.amount = prev.amount.plus(tokenAmount);
              prev.bdv    = prev.bdv.plus(bdv);
              prev.crates.push({
                amount: tokenAmount,
                bdv:    bdv,
                season: new BigNumber(s),
                stalk:  SiloTokens.BeanCrv3LP.getStalk(bdv),
                seeds:  SiloTokens.BeanCrv3LP.getSeeds(bdv),
              });
              return prev;
            }, {
              amount:  new BigNumber(0),
              bdv:    new BigNumber(0),
              crates: [] as DepositCrate[],
            }),
            ...parseWithdrawals(results.curveWithdrawals, eventParsingParameters.season)
          },
          [SiloTokens.BeanLusdLP?.address]: {
            deposited: Object.keys(results.userBeanlusdDeposits).reduce((prev, s) => {
              const tokenAmount = results.userBeanlusdDeposits[s];
              const bdv         = results.userBeanlusdBDVDeposits[s];
              prev.amount = prev.amount.plus(tokenAmount);
              prev.bdv   = prev.bdv.plus(bdv);
              prev.crates.push({
                amount: tokenAmount,
                bdv:    bdv,
                season: new BigNumber(s),
                stalk:  SiloTokens.BeanLusdLP.getStalk(bdv),
                seeds:  SiloTokens.BeanLusdLP.getSeeds(bdv),
              });
              return prev;
            }, {
              amount:  new BigNumber(0),
              bdv:    new BigNumber(0),
              crates: [] as DepositCrate[],
            }),
            ...parseWithdrawals(results.beanlusdWithdrawals, eventParsingParameters.season)
          }
        }));
      }
    }
  }, [
    dispatch,
    migrate,
    fetchSiloEvents,
    beanstalk,
    // v2
    season,
    whitelist,
    account,
    // v1
    SiloTokens,
    chainId,
    eventParsingParameters,
    processFarmerEventsV1,
  ]);
  
  const clear = useCallback(() => {
    console.debug('[farmer/silo/useFarmerSilo] CLEAR');
    dispatch(resetFarmerSilo());
  }, [dispatch]);

  return [fetch, clear] as const;
};

// -- Updater

const FarmerSiloUpdater = () => {
  const [fetch, clear] = useFetchFarmerSilo();
  const account = useAccount();
  const chainId = useChainId();

  useEffect(() => {
    clear();
    if (account) fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, chainId]);

  return null;
};

export default FarmerSiloUpdater;

import BigNumber from 'bignumber.js';
import { LP_TO_SEEDS, REPLANTED_CHAINS, ZERO_BN } from 'constants/index';
import { BEAN, BEAN_CRV3_LP, BEAN_ETH_UNIV2_LP, BEAN_LUSD_LP } from 'constants/tokens';
import useAccount from 'hooks/ledger/useAccount';
import useChainId from 'hooks/useChain';
import { useGetChainConstant } from 'hooks/useChainConstant';
import useEventProcessor, { EventParsingParameters } from 'hooks/useEventProcessor';
import useSeason from 'hooks/useSeason';
import useWhitelist from 'hooks/useWhitelist';
import Beanstalk from 'lib/Beanstalk';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'state';
import { parseWithdrawals } from 'util/Crates';
import { updateFarmerField } from '../field/actions';
import { DepositCrate } from '../silo';
import { updateFarmerSiloBalances, UpdateFarmerSiloBalancesPayload } from '../silo/actions';

const FarmerEventsProcessor = () => {
  const account  = useAccount();
  const dispatch = useDispatch();

  // Selectors
  const events = useSelector<AppState, AppState['_farmer']['events']>(
    (state) => state._farmer.events
  );
  const earnedBeans = useSelector<AppState, AppState['_farmer']['silo']['beans']['earned']>(
    (state) => state._farmer.silo.beans.earned
  );
  const season = useSeason();
  const harvestableIndex = useSelector<AppState, AppState['_beanstalk']['field']['harvestableIndex']>(
    (state) => state._beanstalk.field.harvestableIndex,
  );

  const processFarmerEventsV1 = useEventProcessor();
  const getChainConstant = useGetChainConstant();
  const chainId = useChainId();
  const SiloTokens = useMemo(() => ({
    Bean:       getChainConstant(BEAN),
    BeanEthLP:  getChainConstant(BEAN_ETH_UNIV2_LP),
    BeanCrv3LP: getChainConstant(BEAN_CRV3_LP),
    BeanLusdLP: getChainConstant(BEAN_LUSD_LP),
  }), [getChainConstant]);
  const whitelist = useWhitelist();

  // Required to properly parse event data
  const eventParsingParameters = useMemo<null | EventParsingParameters>(() => {
    if (account && season && earnedBeans && harvestableIndex) {
      return {
        account,
        season: season,
        // only needed for v1
        harvestableIndex: harvestableIndex,
        farmableBeans: earnedBeans,
      };
    }
    return null;
  }, [
    account,
    season,
    earnedBeans,
    harvestableIndex,
  ]);

  /**
   * Process events.
   * 
   * FIXME: 
   * - called twice as eventParsingParameters are set in separate dispatch calls
   */
  useEffect(() => {
    if (eventParsingParameters) {
      if (events && events.length > 0) {
        console.debug(`[farmer/updater] process ${events.length} events`, events, eventParsingParameters);

        /// EVENT PROCESSING v2: POST-REPLANT
        /// ---------------------------------
        /// Notable differences:
        /// (1) Beanstalk.EventProcessor does not add Earned Beans
        ///     as a deposit in the current season. The UI is responsible
        ///     for showing these Beans wherever necessary.
        if (REPLANTED_CHAINS.has(chainId)) {
          const p = new Beanstalk.EventProcessor(
            eventParsingParameters.account,
            { 
              ...eventParsingParameters,
              whitelist: whitelist,
            }
          );
          const results = p.ingestAll(events);
          console.debug('[processor.ts] ...received results:', results);
        
          // Update Field
          dispatch(updateFarmerField(
            p.parsePlots(eventParsingParameters.harvestableIndex)
          ));

          // Update Silo
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
                ...p.parseWithdrawals(addr, eventParsingParameters.season)
              };
              return prev;
            }, {})
          ));
        }
        
        /// EVENT PROCESSING v1: PRE-REPLANT
        else {
          const results = processFarmerEventsV1(events, eventParsingParameters);
          console.debug('[farmer/updater] ...processed events!', results);

          // TEMP:
          // Hardcode this because the event process returns `beanDepositsBalance`, etc.
          dispatch(updateFarmerField({
            plots: results.plots,
            harvestablePlots: results.harvestablePlots,
            pods: results.podBalance,
            harvestablePods: results.harvestablePodBalance,
          }));
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
    }
  }, [
    // FIXME: cascading renders here
    events,       // receives new events
    account,      // user changes their wallet address
    chainId,      // chain changes
    whitelist,    // changes when chainId changes
    eventParsingParameters, // changes for new account, season, harvestableIndex
    processFarmerEventsV1,  // changes when chainId changes
    SiloTokens,   // changes when chainId changes
    dispatch,     // shouldn't change
  ]);

  return null;
};

export default FarmerEventsProcessor;
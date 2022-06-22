import BigNumber from 'bignumber.js';
import { LP_TO_SEEDS, ZERO_BN } from 'constants/index';
import { BEAN, BEAN_CRV3_LP, BEAN_ETH_UNIV2_LP, BEAN_LUSD_LP } from 'constants/tokens';
import useChainId from 'hooks/useChain';
import { useGetChainConstant } from 'hooks/useChainConstant';
import useEventProcessor, { EventParsingParameters } from 'hooks/useEventProcessor';
import { REPLANTED_CHAINS } from 'hooks/useMigrateCall';
import useWhitelist from 'hooks/useWhitelist';
import Beanstalk from 'lib/Beanstalk';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'state';
import { getAccount } from 'util/Account';
import { parseWithdrawals } from 'util/Crates';
import { useAccount } from 'wagmi';
import { updateFarmerField } from './field/actions';
import { DepositCrate, WithdrawalCrate } from './silo';
import { updateFarmerSiloBalances, UpdateFarmerSiloBalancesPayload } from './silo/actions';

const FarmerEventsProcessor = () => {
  const { data: account } = useAccount();
  const dispatch = useDispatch();

  // Selectors
  const events = useSelector<AppState, AppState['_farmer']['events']>(
    (state) => state._farmer.events
  );
  const earnedBeans = useSelector<AppState, AppState['_farmer']['silo']['beans']['earned']>(
    (state) => state._farmer.silo.beans.earned
  );
  const season = useSelector<AppState, AppState['_farmer']['silo']['beans']['earned']>(
    (state) => state._beanstalk.sun.season,
  );
  const harvestableIndex = useSelector<AppState, AppState['_beanstalk']['field']['harvestableIndex']>(
    (state) => state._beanstalk.field.harvestableIndex,
  );

  const processFarmerEvents = useEventProcessor();
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
    if (account?.address && season && earnedBeans && harvestableIndex) {
      return {
        // override account if necessary
        account: getAccount(account.address.toLowerCase()),
        farmableBeans: earnedBeans,
        season: season,
        harvestableIndex: harvestableIndex,
      };
    }
    return null;
  }, [
    account?.address,
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

        if (REPLANTED_CHAINS.has(chainId)) {
          // Run processor
          const p = new Beanstalk.EventProcessor(
            eventParsingParameters.account,
            {
              ...eventParsingParameters,
              whitelist: whitelist,
            }
          );
          const results = p.ingestAll(events);
          console.debug('[farmer/updater] ...processed events!', results);
          
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
                ...Beanstalk.EventProcessor._parseWithdrawals(
                  results.withdrawals[addr],
                  eventParsingParameters.season,
                )
              };
              return prev;
            }, {})
          ));
        } else {
          // v1
          const results = processFarmerEvents(
            events,
            eventParsingParameters
          );
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
            // -----------------------------
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

            // -----------------------------
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

            // -----------------------------
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

            // -----------------------------
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
    events,
    account,
    chainId,
    whitelist,
    dispatch,
    eventParsingParameters,
    processFarmerEvents,
    SiloTokens,
  ]);

  return null;
};

export default FarmerEventsProcessor;

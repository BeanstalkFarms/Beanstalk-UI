import BigNumber from 'bignumber.js';
import { LP_TO_SEEDS } from 'constants/index';
import { BEAN, BEAN_CRV3_LP, BEAN_ETH_UNIV2_LP, BEAN_LUSD_LP } from 'constants/tokens';
import { useGetChainConstant } from 'hooks/useChainConstant';
import useEventProcessor, { EventParsingParameters } from 'hooks/useEventProcessor';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'state';
import { getAccount } from 'util/account';
import { useAccount } from 'wagmi';
import { updateFarmerField } from './field/actions';
import { Deposit, Withdrawal } from './silo';
import { updateFarmerTokenBalances } from './silo/actions';

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
  const SiloTokens = useMemo(() => ({
    Bean:       getChainConstant(BEAN),
    BeanEthLP:  getChainConstant(BEAN_ETH_UNIV2_LP),
    BeanCrv3LP: getChainConstant(BEAN_CRV3_LP),
    BeanLusdLP: getChainConstant(BEAN_LUSD_LP),
  }), [getChainConstant]);

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
        console.debug(`[farmer/updater] process ${events.length} events`, eventParsingParameters);
        const results = processFarmerEvents(
          events,
          eventParsingParameters
        );
        console.debug('[farmer/updater] ...processed events!', results);

        // TEMP:
        // Hardcode this because the event process returns `beanDepositsBalance`, etc.
        dispatch(updateFarmerTokenBalances({
          // -----------------------------
          [SiloTokens.Bean.address]: {
            deposited: Object.keys(results.userBeanDeposits).reduce((prev, s) => {
              const tokenAmount = results.userBeanDeposits[s];
              const bdv         = tokenAmount; // only for Bean
              prev.total = prev.total.plus(tokenAmount);
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
              total:  new BigNumber(0),
              bdv:    new BigNumber(0),
              crates: [] as Deposit[],
            }),
            withdrawn: Object.keys(results.beanWithdrawals).reduce((prev, s) => {
              const tokenAmount = results.beanWithdrawals[s];
              const bdv         = tokenAmount; // only for Bean
              prev.total = prev.total.plus(tokenAmount);
              prev.bdv   = prev.bdv.plus(bdv);
              prev.crates.push({
                amount: tokenAmount,
                season: new BigNumber(s),
              });
              return prev;
            }, {
              total:  new BigNumber(0),
              bdv:    new BigNumber(0),
              crates: [] as Withdrawal[],
            }),
            // withdrawals: undefined,
            // withdrawn: undefined,
            // circulating: undefined,
            // claimable: undefined,
            // wrapped: undefined,
          },

          // -----------------------------
          [SiloTokens.BeanEthLP.address]: {
            deposited: Object.keys(results.userLPDeposits).reduce((prev, s) => {
              const tokenAmount = results.userLPDeposits[s];
              // LEGACY: 
              // BDV of a LP deposit was previously calculated via
              // 'userLPSeedDeposits / 4'.
              const bdv  = results.userLPSeedDeposits[s].div(LP_TO_SEEDS);
              prev.total = prev.total.plus(tokenAmount);
              prev.bdv   = prev.bdv.plus(bdv);
              prev.crates.push({
                amount: tokenAmount,
                bdv:    bdv,
                season: new BigNumber(s),
                stalk:  SiloTokens.BeanEthLP.getStalk(bdv),
                seeds:  SiloTokens.BeanEthLP.getSeeds(bdv),
              });
              return prev;
            }, {
              total:  new BigNumber(0),
              bdv:    new BigNumber(0),
              crates: [] as Deposit[],
            }),
            withdrawn: Object.keys(results.lpWithdrawals).reduce((prev, s) => {
              const tokenAmount = results.lpWithdrawals[s];
              const bdv         = tokenAmount;            // FIXME: wrong calc
              prev.total = prev.total.plus(tokenAmount);
              prev.bdv   = prev.bdv.plus(bdv);            // FIXME: wrong calc
              prev.crates.push({
                amount: tokenAmount,
                season: new BigNumber(s),
              });
              return prev;
            }, {
              total:  new BigNumber(0),
              bdv:    new BigNumber(0),
              crates: [] as Withdrawal[],
            }),
          },

          // -----------------------------
          [SiloTokens.BeanCrv3LP.address]: {
            deposited: Object.keys(results.userCurveDeposits).reduce((prev, s) => {
              const tokenAmount = results.userCurveDeposits[s];
              const bdv         = results.userCurveBDVDeposits[s];
              prev.total = prev.total.plus(tokenAmount);
              prev.bdv   = prev.bdv.plus(bdv);
              prev.crates.push({
                amount: tokenAmount,
                bdv:    bdv,
                season: new BigNumber(s),
                stalk:  SiloTokens.BeanCrv3LP.getStalk(bdv),
                seeds:  SiloTokens.BeanCrv3LP.getSeeds(bdv),
              });
              return prev;
            }, {
              total:  new BigNumber(0),
              bdv:    new BigNumber(0),
              crates: [] as Deposit[],
            })
          },

          // -----------------------------
          [SiloTokens.BeanLusdLP?.address]: {
            deposited: Object.keys(results.userBeanlusdDeposits).reduce((prev, s) => {
              const tokenAmount = results.userBeanlusdDeposits[s];
              const bdv         = results.userBeanlusdBDVDeposits[s];
              prev.total = prev.total.plus(tokenAmount);
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
              total:  new BigNumber(0),
              bdv:    new BigNumber(0),
              crates: [] as Deposit[],
            }),
            withdrawn: Object.keys(results.lpWithdrawals).reduce((prev, s) => {
              const tokenAmount = results.beanlusdWithdrawals[s];
              const bdv         = new BigNumber(0);           // FIXME: wrong calc
              prev.total = prev.total.plus(tokenAmount);
              prev.bdv   = prev.bdv.plus(bdv);                // FIXME: wrong calc
              prev.crates.push({
                amount: tokenAmount,
                season: new BigNumber(s),
              });
              return prev;
            }, {
              total:  new BigNumber(0),
              bdv:    new BigNumber(0),
              crates: [] as Withdrawal[],
            }),
          }
        }));
        dispatch(updateFarmerField({
          plots: results.plots,
          harvestablePlots: results.harvestablePlots,
          pods: results.podBalance,
          harvestablePods: results.harvestablePodBalance,
        }));
      }
    }
  }, [
    events,
    account,
    dispatch,
    eventParsingParameters,
    processFarmerEvents,
    SiloTokens,
  ]);

  return null;
};

export default FarmerEventsProcessor;

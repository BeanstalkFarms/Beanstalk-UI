import BigNumber from 'bignumber.js';
import { BEAN, BEAN_CRV3_LP, BEAN_ETH_UNIV2_LP } from 'constants/v2/tokens';
import useBDV from 'hooks/useBDV';
import useChainConstant from 'hooks/useChainConstant';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'state';
import processFarmerEvents from 'util/processFarmerEvents';
import { useAccount, useNetwork } from 'wagmi';
import { updateFarmerField } from './field/actions';
import { Deposit } from './silo';
import { updateFarmerTokenBalances } from './silo/actions';

const FarmerUpdater = () => {
  const { data: account } = useAccount();
  const { activeChain } = useNetwork();
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

  //
  const getBDV      = useBDV();
  const Bean        = useChainConstant(BEAN);
  const BeanEthLP   = useChainConstant(BEAN_ETH_UNIV2_LP);
  const BeanCrv3LP  = useChainConstant(BEAN_CRV3_LP);

  /**
   * Process events
   */
  useEffect(() => {
    // possible edge cases:
    //  - pool state isn't loaded and this tries to run
    if (account?.address && activeChain?.id && season && earnedBeans) {
      const results = processFarmerEvents(events, {
        account: account.address,
        farmableBeans: earnedBeans,
        season: season,
        harvestableIndex: harvestableIndex
      });
      console.debug('[farmer/updater] process events', results);

      // FIXME: temporary
      // hardcode this because the event process returns `beanDepositsBalance`, etc.
      dispatch(updateFarmerTokenBalances({
        [Bean.address]: {
          deposited: Object.keys(results.userBeanDeposits).reduce((prev, s) => {
            const tokenAmount = results.userBeanDeposits[s];
            const bdv         = tokenAmount; // only for Bean
            prev.total = prev.total.plus(tokenAmount);
            prev.bdv   = prev.bdv.plus(bdv);
            prev.crates.push({
              amount: tokenAmount,
              bdv:    bdv,
              season: new BigNumber(s),
              seeds:  Bean.getStalk(bdv),
              stalk:  Bean.getSeeds(bdv),
            });
            return prev;
          }, {
            total:  new BigNumber(0),
            bdv:    new BigNumber(0),
            crates: [] as Deposit[],
          })
          // withdrawals: undefined,
          // withdrawn: undefined,
          // circulating: undefined,
          // claimable: undefined,
          // wrapped: undefined,
        },
        [BeanEthLP.address]: {
          deposited: Object.keys(results.userLPDeposits).reduce((prev, s) => {
            const tokenAmount = results.userLPDeposits[s];
            const bdv         = getBDV(BeanEthLP, tokenAmount);
            prev.total = prev.total.plus(tokenAmount);
            prev.bdv   = prev.bdv.plus(bdv);
            prev.crates.push({
              amount: tokenAmount,
              bdv:    bdv,
              season: new BigNumber(s),
              seeds:  BeanEthLP.getStalk(bdv),
              stalk:  BeanEthLP.getSeeds(bdv),
            });
            return prev;
          }, {
            total:  new BigNumber(0),
            bdv:    new BigNumber(0),
            crates: [] as Deposit[],
          })
        },
        [BeanCrv3LP.address]: {
          deposited: Object.keys(results.userCurveDeposits).reduce((prev, s) => {
            const tokenAmount = results.userCurveDeposits[s];
            const bdv         = results.userCurveBDVDeposits[s];
            prev.total = prev.total.plus(tokenAmount);
            prev.bdv   = prev.bdv.plus(bdv);
            prev.crates.push({
              amount: tokenAmount,
              bdv:    bdv,
              season: new BigNumber(s),
              seeds:  BeanCrv3LP.getStalk(bdv),
              stalk:  BeanCrv3LP.getSeeds(bdv),
            });
            return prev;
          }, {
            total:  new BigNumber(0),
            bdv:    new BigNumber(0),
            crates: [] as Deposit[],
          })
        }
      }));
      dispatch(updateFarmerField({
        plots: results.plots,
        harvestablePlots: results.harvestablePlots,
        pods: results.podBalance,
        harvestablePods: results.harvestablePodBalance,
      }));
    }
  }, [
    events,
    account,
    activeChain,
    dispatch,
    // event parsing params
    earnedBeans,
    harvestableIndex,
    season,
    //
    Bean,
    BeanEthLP,
    BeanCrv3LP,
    getBDV,
  ]);

  return null;
};

export default FarmerUpdater;

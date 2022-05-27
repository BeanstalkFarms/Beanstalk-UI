import BigNumber from 'bignumber.js';
import Pool from 'classes/Pool';
import { BEAN, BEAN_CRV3_LP, BEAN_ETH_UNIV2_LP } from 'constants/v2/tokens';
import useBDV from 'hooks/useBDV';
import useChainConstant from 'hooks/useChainConstant';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'state';
import processFarmerEvents from 'util/processFarmerEvents';
import { useAccount, useNetwork } from 'wagmi';
import { updateFarmerField } from './field/actions';
import { updateFarmerTokenBalances } from './silo/actions';

const FarmerUpdater = () => {
  const { data: account } = useAccount();
  const { activeChain } = useNetwork();
  const dispatch = useDispatch();
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

  console.debug('[FarmerUpdater] re-rendering');
  
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

      // ----
      // const []

      // FIXME: temporary
      // hardcode this because the event process returns `beanDepositsBalance`, etc.
      dispatch(updateFarmerTokenBalances({
        [Bean.address]: {
          deposited: results.beanDepositsBalance,
          deposits: Object.keys(results.userBeanDeposits).map((s) => ({
            amount: results.userBeanDeposits[s],
            bdv:    results.userBeanDeposits[s],
            season: new BigNumber(s),
            seeds:  Bean.getStalk(results.userBeanDeposits[s]),
            stalk:  Bean.getSeeds(results.userBeanDeposits[s]),
          })),
          // TODO:
          // withdrawals: undefined,
          // withdrawn: undefined,
          // circulating: undefined,
          // claimable: undefined,
          // wrapped: undefined,
        },
        [BeanEthLP.address]: {
          deposited: results.lpDepositsBalance,
          deposits: Object.keys(results.userLPDeposits).map((s) => ({
            amount: results.userLPDeposits[s],
            // FIXME: this can't be right!
            bdv:    getBDV(BeanEthLP, results.userLPDeposits[s]),
            season: new BigNumber(s),
            seeds:  BeanEthLP.getStalk(results.userLPDeposits[s]),
            stalk:  BeanEthLP.getSeeds(results.userLPDeposits[s]),
          })),
          // TODO:
          // withdrawals: undefined,
          // withdrawn: undefined,
          // circulating: undefined,
          // claimable: undefined,
          // wrapped: undefined,
        },
        [BeanCrv3LP.address]: {
          deposited: results.curveDepositsBalance,
          deposits: Object.keys(results.userCurveDeposits).map((s) => ({
            amount: results.userCurveDeposits[s],
            bdv: results.userCurveBDVDeposits[s],
            season: new BigNumber(s),
            stalk: BeanCrv3LP.getStalk(results.userCurveBDVDeposits[s]),
            seeds: BeanCrv3LP.getSeeds(results.userCurveBDVDeposits[s]),
          }))
        }
      }));
      dispatch(updateFarmerField({
        plots: results.plots,
        harvestablePlots: results.harvestablePlots,
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

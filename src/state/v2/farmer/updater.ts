import BigNumber from 'bignumber.js';
import { BEAN, BEAN_ETH_UNISWAP_V2_LP } from 'constants/v2/tokens';
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

  useEffect(() => {
    if (account?.address && activeChain?.id && season && earnedBeans) {
      const results = processFarmerEvents(events, {
        account: account.address,
        farmableBeans: earnedBeans,
        season: season,
        harvestableIndex: harvestableIndex
      });
      console.debug('[farmer/updater] process events', results);
      dispatch(updateFarmerTokenBalances({
        [BEAN[activeChain.id].address]: {
          deposited: results.beanDepositsBalance,
          deposits: Object.keys(results.userBeanDeposits).map((s) => ({
            amount: results.userBeanDeposits[s],
            bdv: results.userBeanDeposits[s],
            season: new BigNumber(s),
            seeds: new BigNumber(0),
            stalk: new BigNumber(0),
          })),
        },
        [BEAN_ETH_UNISWAP_V2_LP[activeChain.id].address]: {
          deposited: results.lpDepositsBalance,
          deposits: Object.keys(results.userLPDeposits).map((s) => ({
            amount: results.userLPDeposits[s],
            bdv: results.userLPDeposits[s],
            season: new BigNumber(s),
            seeds: new BigNumber(0),
            stalk: new BigNumber(0),
          })),
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
    season
  ]);

  return null;
};

export default FarmerUpdater;

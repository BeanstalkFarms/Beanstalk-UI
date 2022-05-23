import BigNumber from "bignumber.js";
import { SupportedChainId } from "constants/chains";
import { BEAN } from "constants/v2/tokens";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "state";
import processFarmerEvents from "util/processFarmerEvents";
import { useAccount, useNetwork } from "wagmi";
import { updateFarmerTokenBalances } from "./silo/actions";

export default function FarmerUpdater() {
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

  useEffect(() => {
    if(account?.address && activeChain?.id && season && earnedBeans) {
      const results = processFarmerEvents(events, {
        account: account.address,
        farmableBeans: earnedBeans,
        season: season
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
        } 
      }))
    }
  }, [
    events,
    account,
    activeChain,
    dispatch,
    // event parsing params
    earnedBeans,
    season
  ])

  return null;
}
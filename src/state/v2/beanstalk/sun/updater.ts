import { SupportedChainId } from "constants/chains";
import { BEAN } from "constants/v2/tokens";
import { useBeanstalkContract } from "hooks/useContract";
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { bigNumberResult, tokenResult } from "util/LedgerUtilities2";
import { useNetwork } from "wagmi";
import { updateHarvestableIndex } from "../field/actions";
import { updateSeason } from "./actions";

export const useSun = () => {
  const dispatch = useDispatch();
  const beanstalk = useBeanstalkContract()

  // Handlers
  const fetch = useCallback(async () => {
    if (beanstalk) {
      const [
        season,
        harvestableIndex,
      ] = await Promise.all([
        beanstalk.season().then(bigNumberResult),
        // FIXME
        beanstalk.harvestableIndex().then(tokenResult(BEAN[SupportedChainId.MAINNET])),
      ] as const);

      console.debug(`[beanstalk/sun/updater] season = ${season}`)
      dispatch(updateSeason(season));
      dispatch(updateHarvestableIndex(harvestableIndex))
    }
  }, [
    dispatch,
    beanstalk
  ]);
  
  const clear = useCallback(() => {
    // console.debug(`[farmer/silo/updater] clear`)
    // dispatch(reset())
  }, []);

  return [fetch, clear] as const;
};


export default function SunUpdater() {
  const { activeChain } = useNetwork();
  const [fetch] = useSun();
  useEffect(() => {
    if(activeChain?.id) fetch();
  }, [activeChain?.id, fetch]);

  return null;
}
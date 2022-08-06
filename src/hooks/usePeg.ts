import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { ONE_BN, POD_RATE_LOWER_BOUND, POD_RATE_UPPER_BOUND, ZERO_BN } from '~/constants';
import usePodRate from '~/hooks/usePodRate';
import useSeason from '~/hooks/useSeason';
import { AppState } from '~/state';
import { MaxBN, MinBN } from '~/util';

const RDLower = new BigNumber(POD_RATE_LOWER_BOUND / 100);
const RDUpper = new BigNumber(POD_RATE_UPPER_BOUND / 100);

/// Section 8.10    Bean Supply
const beanSupply = (
  // The award for successfully calling the sunrise() function for t;
  a_t: BigNumber,
  // The sum of liquidity and time weighted average shortages or excesss of Beans across liquidity pools on the Oracle Whitelist over the previous Season;
  ΔB_t1: BigNumber,
  // The total Unfertilized Sprouts;
  𝒟: BigNumber,
  // The total number of Unharvestable Pods;
  D: BigNumber,
) => {
  const m_t   = MaxBN(a_t, ΔB_t1); 
  const Δ𝒟_t  = MinBN(MaxBN(ZERO_BN, ΔB_t1.div(3)), 𝒟); // The number of Unfertilized Sprouts that are Fertilized by Active Fertilizer and become Rinsable at the beginning of each Season;
  const ΔD_t  = MinBN(MaxBN(ZERO_BN, (ΔB_t1.minus(Δ𝒟_t)).div(2)), D); // The number of Pods that Ripen and become Harvestable at the beginning of each Season
  return [m_t, Δ𝒟_t, ΔD_t];
};

const soilSupply = (
  // newHarvestablePods: The number of Pods that Ripen and become Harvestable at the beginning of each Season;
  ΔD_t: BigNumber,
  // field.weather.yield: The Temperature during t;
  h_t: BigNumber,
  // The Pod Rate at the end of the previous Season;
  RD_t1: BigNumber,
  // bean.deltaB: The sum of liquidity and time weighted average shortages or excesss of Beans across liquidity pools on the Oracle Whitelist over the previous Season;
  ΔB_t1: BigNumber,
) => {
  let x : number;
  if (RDUpper.lte(RD_t1)) {
    x = 0.5;
  } else if (RDLower.lt(RD_t1)) {
    x = 1;
  } else {
    x = 1.5;
  }
  const Smin_t    = (new BigNumber(x).times(ΔD_t)).div(ONE_BN.plus(h_t.div(100)));
  const SStart_t  = MaxBN(ΔB_t1.negated(), Smin_t);
  return SStart_t;
};

const temperature = (
  podRate: BigNumber,
  price: BigNumber,
  deltaDemand: BigNumber,
) => {
  // let caseId = 0;
  // if (podRate.isGreaterThanOrEqualTo(POD_RATE_UPPER_BOUND)) caseId = 24;
  // else if (podRate.isGreaterThanOrEqualTo(OPTIMAL_POD_RATE)) caseId = 16;
  // else if (podRate.isGreaterThanOrEqualTo(POD_RATE_LOWER_BOUND)) caseId = 8;

  // if (
  //   price.isGreaterThan(1) ||
  //   (price.isEqualTo(1) && podRate.isLessThanOrEqualTo(OPTIMAL_POD_RATE))
  // ) {
  //   caseId += 4;
  // }

  // if (deltaDemand.isGreaterThanOrEqualTo(DELTA_POD_DEMAND_UPPER_BOUND)) {
  //   caseId += 2;
  // } else if (deltaDemand.isGreaterThanOrEqualTo(DELTA_POD_DEMAND_LOWER_BOUND)) {
  //   if (lastSowTime.isEqualTo(MAX_UINT32) || !didSowBelowMin) caseId += 1;
  //   else if (didSowFaster) caseId += 2;
  // }

  // let deltaWeather = new BigNumber(PEG_WEATHER_CASES[caseId]);
  // if (weather.plus(deltaWeather).isLessThanOrEqualTo(0)) {
  //   deltaWeather = weather.minus(1);
  // }
};

/**
 * 
 */
const usePeg = () => {
  const season    = useSeason();
  const bean      = useSelector<AppState, AppState['_bean']['token']>((state) => state._bean.token);
  const awaiting  = useSelector<AppState, boolean>((state) => state._beanstalk.sun.sunrise.awaiting);
  const field     = useSelector<AppState, AppState['_beanstalk']['field']>((state) => state._beanstalk.field);
  const barn      = useSelector<AppState, AppState['_beanstalk']['barn']>((state) => state._beanstalk.barn);
  const podRate   = usePodRate();

  const [
    newBeans,
    newRinsableSprouts,
    newHarvestablePods,
  ] = beanSupply(
    ZERO_BN,
    bean.deltaB,
    barn.unfertilized,
    field.podLine
  );

  const soilStart = soilSupply(
    newHarvestablePods,
    field.weather.yield,
    podRate.div(100),
    bean.deltaB,
  );

  // const deltaTemperature = temperature(

  // )

  return {
    newBeans,
    newRinsableSprouts,
    newHarvestablePods,
    soilStart,
  };
};

export default usePeg;

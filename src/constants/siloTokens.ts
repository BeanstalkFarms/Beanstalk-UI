// Whitelisted tokens that can be deposited into the Silo
import {
  BEAN_TO_SEEDS,
  BEAN_TO_STALK,
  CURVE_BDV_TO_SEEDS,
  CURVE_BDV_TO_STALK,
  LPBEAN_TO_STALK,
  LPBEANS_TO_SEEDS
} from "./values";
import { getAPYs } from "../util";
import { AppState } from "../state";

const TOKENS = [
  {
    name: 'Bean',
    slug: 'bean',
    rewards: {
      stalk: BEAN_TO_STALK,
      seeds: BEAN_TO_SEEDS,
    },
    getAPY: (apys: ReturnType<typeof getAPYs>) => {
      return apys[0]; // Bean
    },
    getTotalBalance: (totalBalances: AppState['totalBalance']) => {
      return totalBalances.totalBeans;
    },
    getUserBalance: (userBalances: AppState['userBalance']) => {
      return userBalances.beanSiloBalance;
    }
  },
  {
    name: 'Bean:ETH',
    slug: 'bean-eth',
    rewards: {
      stalk: LPBEAN_TO_STALK,
      seeds: LPBEANS_TO_SEEDS,
    },
    getAPY: (apys: ReturnType<typeof getAPYs>) => {
      return apys[1]; // LP
    },
    getTotalBalance: (totalBalances: AppState['totalBalance']) => {
      return totalBalances.totalSiloBeans;
    },
    getUserBalance: (userBalances: AppState['userBalance']) => {
      return userBalances.lpSiloBalance;
    }
  },
  {
    name: 'Bean:3CRV',
    slug: 'bean-3crv',
    rewards: {
      stalk: CURVE_BDV_TO_STALK,
      seeds: CURVE_BDV_TO_SEEDS,
    },
    getAPY: (apys: ReturnType<typeof getAPYs>) => {
      return apys[1]; // LP
    },
    getTotalBalance: (totalBalances: AppState['totalBalance']) => {
      return totalBalances.totalCurveBeans;
    },
    getUserBalance: (userBalances: AppState['userBalance']) => {
      return userBalances.curveSiloBalance;
    }
  }
];

export default TOKENS;

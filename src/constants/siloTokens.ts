// Whitelisted tokens that can be deposited into the Silo
import {
  BEAN_TO_SEEDS,
  BEAN_TO_STALK,
  CURVE_BDV_TO_SEEDS,
  CURVE_BDV_TO_STALK,
  LUSD_BDV_TO_SEEDS,
  LUSD_BDV_TO_STALK,
  LPBEAN_TO_STALK,
  LPBEANS_TO_SEEDS
} from './values';
import { getAPYs } from '../util';
import { AppState } from '../state';

import beanIcon from '../img/bean-logo.svg';
import beanEthIcon from '../img/lp-logo.svg';
import bean3CrvIcon from '../img/bean-curve-logo.svg';
import beanlusdIcon from '../img/bean-lusd-logo.svg';
import { getUserSiloDepositsUSD } from '../util/SiloUtilities';
import { Token } from 'classes';

import { Bean, BeanEthUniswapLP } from './tokensv2';

export type SiloToken = {
  name: string;
  slug: string;
  icon: any;
  rewards: {
    stalk: number;
    seeds: number;
  };
  getAPY: Function;
  getTotalSiloBalance: Function;
  getUserSiloBalance: Function;
  getUserSiloBalanceInUSD: Function;
}

export default [
  Bean,
  BeanEthUniswapLP,
];


// class SiloToken extends 

// export class SiloToken {

// }

// const TOKENS : SiloToken[] = [
//   {
//     name: 'Bean',
//     slug: 'bean',
//     icon: beanIcon,
//     rewards: {
//       stalk: BEAN_TO_STALK,
//       seeds: BEAN_TO_SEEDS,
//     },
//     getAPY: (apys: ReturnType<typeof getAPYs>) => apys[0], // Bean with 2 Seeds
//     getTotalSiloBalance: (totalBalances: AppState['totalBalance']) => totalBalances.totalBeans,
//     getUserSiloBalance: (userBalances: AppState['userBalance']) => userBalances.beanSiloBalance,
//     getUserSiloBalanceInUSD: (
//       userBalanceState: AppState['userBalance'],
//       priceState: AppState['prices'],
//       totalBalanceState: AppState['totalBalance']
//     ) => getUserSiloDepositsUSD(userBalanceState, priceState, totalBalanceState).Bean
//   },
//   {
//     name: 'Bean:ETH LP',
//     slug: 'bean-eth',
//     icon: beanEthIcon,
//     rewards: {
//       stalk: LPBEAN_TO_STALK,
//       seeds: LPBEANS_TO_SEEDS,
//     },
//     getAPY: (apys: ReturnType<typeof getAPYs>) => apys[1], // LP with 4 Seeds
//     getTotalSiloBalance: (totalBalances: AppState['totalBalance']) => totalBalances.totalSiloBeans,
//     getUserSiloBalance: (userBalances: AppState['userBalance']) => userBalances.lpSiloBalance,
//     getUserSiloBalanceInUSD: (
//       userBalanceState: AppState['userBalance'],
//       priceState: AppState['prices'],
//       totalBalanceState: AppState['totalBalance']
//     ) => getUserSiloDepositsUSD(userBalanceState, priceState, totalBalanceState)['Bean:ETH']
//   },
//   {
//     name: 'Bean:3CRV LP',
//     slug: 'bean-3crv',
//     icon: bean3CrvIcon,
//     rewards: {
//       stalk: CURVE_BDV_TO_STALK,
//       seeds: CURVE_BDV_TO_SEEDS,
//     },
//     getAPY: (apys: ReturnType<typeof getAPYs>) => apys[1], // LP with 4 Seeds
//     getTotalSiloBalance: (totalBalances: AppState['totalBalance']) => totalBalances.totalCurveBeans,
//     getUserSiloBalance: (userBalances: AppState['userBalance']) => userBalances.curveSiloBalance,
//     getUserSiloBalanceInUSD: (
//       userBalanceState: AppState['userBalance'],
//       priceState: AppState['prices'],
//       totalBalanceState: AppState['totalBalance']
//     ) => getUserSiloDepositsUSD(userBalanceState, priceState, totalBalanceState)['Bean:3CRV']
//   },
//   {
//     name: 'Bean:LUSD LP',
//     slug: 'bean-lusd',
//     icon: beanlusdIcon,
//     rewards: {
//       stalk: LUSD_BDV_TO_STALK,
//       seeds: LUSD_BDV_TO_SEEDS,
//     },
//     getAPY: (apys: ReturnType<typeof getAPYs>) => apys[2], // LP with 3 Seeds
//     getTotalSiloBalance: (totalBalances: AppState['totalBalance']) => totalBalances.totalBeanlusdBeans,
//     getUserSiloBalance: (userBalances: AppState['userBalance']) => userBalances.beanlusdSiloBalance,
//     getUserSiloBalanceInUSD: (
//       userBalanceState: AppState['userBalance'],
//       priceState: AppState['prices'],
//       totalBalanceState: AppState['totalBalance']
//     ) => getUserSiloDepositsUSD(userBalanceState, priceState, totalBalanceState)['Bean:LUSD']
//   }
// ];

// export default TOKENS;

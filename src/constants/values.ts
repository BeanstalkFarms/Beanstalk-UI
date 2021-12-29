import BigNumber from 'bignumber.js';
import { ChainId, WETH as _WETH } from '@uniswap/sdk';

export const RPC_URL = process.env.REACT_APP_NETWORK_URL;
export const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';
export const APP_URL = 'https://bean.money';
export const CONTACT_EMAIL = 'dev@bean.money';
export const APP_NAME = 'Bean Money';

/* Governance */
export const BASE_COMMIT_INCENTIVE = 1e8; /* 100 beans */
export const GOVERNANCE_PERIOD = 168; /* 168 seasons */
export const GOVERNANCE_EMERGENCY_PERIOD = 86400; /* 86400 seconds = 1 day */
export const GOVERNANCE_PASS_THRESHOLD = 5e17; /* 1/2 */
export const GOVERNANCE_EMERGENCY_THRESHOLD_NUMERATOR = 2;
export const GOVERNANCE_EMERGENCY_THRESHOLD_DEMONINATOR = 3;
export const GOVERNANCE_EXPIRATION = 25; /* 24 + 1 seasons */
export const GOVERNANCE_PROPOSAL_THRESHOLD = 1e16; /* 0.5% */

/* Silo */
export const BASE_ADVANCE_INCENTIVE = 1e8; /* 100 beans */

export const BEAN_TO_STALK = 1;
export const BEAN_TO_SEEDS = 2;
export const LPBEAN_TO_STALK = 2;
export const LPBEANS_TO_SEEDS = 4;

export const LP_TO_SEEDS = 8;
export const UNISWAP_BASE_LP = 1e-15;

export const WITHDRAWAL_FROZEN = 25; /* Frozen for 24 + 1 Seasons upon Withdrawal */

/* Field */
export const SOIL_MAX_RATIO_CAP = 0.25; /* 25% */
export const SOIL_MIN_RATIO_CAP = 0.001; /* 0.1% */

/* Sun */
export const HARVESET_PERCENTAGE = 50; /* 50% */

/* Weather */
export const POD_RATE_LOWER_BOUND = 5; /* 5% */
export const OPTIMAL_POD_RATE = 15; /* 15% */
export const POD_RATE_UPPER_BOUND = 25; /* 25% */

export const DELTA_POD_DEMAND_LOWER_BOUND = 0.98; /* 98% */
export const DELTA_POD_DEMAND_UPPER_BOUND = 1.02; /* 102% */

/* Season */
export const STEADY_SOW_TIME = 60; /* 60 seconds */
export const RAIN_TIME = 24; /* 24 Seasons */
export const PEG_WEATHER_CASES = [
  3, 1, 0, 0, -1, -3, -3, 0, 3, 1, 0, 0, -1, -3, -3, 0, 3, 3, 1, 0, 0, -1, -3,
  0, 3, 3, 1, 0, 1, -1, -3, 0,
]; /* Peg Maintenance Weather Cases */

/* Website Settings */
export const BASE_SLIPPAGE = 0.995; /* 0.5% slippage */
export const SLIPPAGE_THRESHOLD = 0.97; /* 3% slippage threshold for frontrunning */
export const LP_FEE = 0.003; /* 0.3% LP fee */
export const MIN_BALANCE = 0.05; /* 0.05 minimum eth withtheld to transact */

export const MAX_UINT32 = 4294967295;

export const UNISWAP_V2_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

/* NFTs */
export const TOTAL_NFTS = 4068;
export const NFTS_PER_SEASON = 5;
export const GENESIS_NFT = {
  account: '0x02491D37984764d39b99e4077649dcD349221a62',
  id: 0,
  txn: '💎',
};
export const PARSE_API_KEY = 'MLpZllgINkSrNFn4XySbgx2r4bzAv95zlzEofKWJ';
export const PARSE_APP_ID = 'PxgBC714lswdUeAU9taADj9Bl39JY7QEEGkTHk99';

/* Diamonds */
export const zeroBN = new BigNumber(0);
export const newBN = new BigNumber(-1);

export const wallets = () => [
  { walletName: 'metamask', preferred: true },
  {
    walletName: 'walletConnect',
    preferred: true,
    rpc: {
      1: RPC_URL,
      4: RPC_URL,
      56: BSC_RPC_URL,
    },
  },
];

export const BUSD = {
  id: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
  address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
  decimals: 18,
  symbol: 'BUSD',
  name: 'Binance USD',
};

export const WMATIC = {
  id: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  decimals: 18,
  symbol: 'WMATIC',
  name: 'Wrapped Matic',
};

export const WBNB = {
  id: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  decimals: 18,
  symbol: 'WBNB',
  name: 'Wrapped BNB',
};

export const WETH = {
  [ChainId.MAINNET]: {
    id: _WETH[ChainId.MAINNET].address,
    address: _WETH[ChainId.MAINNET].address,
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether',
  },
  [ChainId.RINKEBY]: {
    id: '0x227dA5Feb8b55E1dF54322026149A6b4eAC0b295', // _WETH[ChainId.RINKEBY].address,
    address: '0x227dA5Feb8b55E1dF54322026149A6b4eAC0b295', // _WETH[ChainId.RINKEBY].address,
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether',
  },
  [ChainId.ROPSTEN]: {
    id: _WETH[ChainId.ROPSTEN].address,
    address: _WETH[ChainId.ROPSTEN].address,
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether',
  },
  [ChainId.GÖRLI]: {
    id: _WETH[ChainId.GÖRLI].address,
    address: _WETH[ChainId.GÖRLI].address,
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether',
  },
  [ChainId.KOVAN]: {
    id: _WETH[ChainId.KOVAN].address,
    address: _WETH[ChainId.KOVAN].address,
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether',
  },
  56: WBNB,
  137: WMATIC,
};

export const DAI = {
  [ChainId.MAINNET]: {
    id: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
  },
  [ChainId.RINKEBY]: {
    id: '0xfEb940BAfD4a552BAeBE86f56d6D31E4DCd95e53',
    address: '0xfEb940BAfD4a552BAeBE86f56d6D31E4DCd95e53',
    decimals: 18,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
  },
  [ChainId.ROPSTEN]: {
    id: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
  },
  [ChainId.GÖRLI]: {
    id: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
  },
  [ChainId.KOVAN]: {
    id: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
  },
  56: BUSD,
  137: {
    id: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
    address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
    decimals: 18,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
  },
};

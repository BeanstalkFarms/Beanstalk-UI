import BigNumber from 'bignumber.js';

/**
 * NOTE: 3/1/2022 Silo Chad
 * Commenting out some vars in this file that aren't used elsewhere in the application.
 * This should reduce bundle size. We may want to expose these somehow via the SDK
 * if they are used in calculations, or update the frontend to use them where it isn't currently.
 */

/* Governance */
// export const BASE_COMMIT_INCENTIVE = 1e8; /* 100 beans */
// export const GOVERNANCE_PERIOD = 168; /* 168 seasons */
export const GOVERNANCE_EMERGENCY_PERIOD = 86400; /* 86400 seconds = 1 day */
// export const GOVERNANCE_PASS_THRESHOLD = 5e17; /* 1/2 */
export const GOVERNANCE_EMERGENCY_THRESHOLD_NUMERATOR = 2;
export const GOVERNANCE_EMERGENCY_THRESHOLD_DEMONINATOR = 3;
export const GOVERNANCE_EXPIRATION = 25; /* 24 + 1 seasons */
// export const GOVERNANCE_PROPOSAL_THRESHOLD = 1e16; /* 0.5% */

/* Silo */
//export const BASE_ADVANCE_INCENTIVE = 1e8; /* 100 beans */

export const BEAN_TO_STALK = 1;
export const BEAN_TO_SEEDS = 2;
export const LPBEAN_TO_STALK = 2;
export const LPBEANS_TO_SEEDS = 4;
export const CURVE_BDV_TO_STALK = 1;
export const CURVE_BDV_TO_SEEDS = 4;

// export const LP_TO_SEEDS = 8; // unused
export const UNISWAP_BASE_LP = 1e-15;

export const WITHDRAWAL_FROZEN = 25; /* Frozen for 24 + 1 Seasons upon Withdrawal */

/* Field */
// export const SOIL_MAX_RATIO_CAP = 0.25; /* 25% */
// export const SOIL_MIN_RATIO_CAP = 0.001; /* 0.1% */

/* Sun */
// export const HARVESET_PERCENTAGE = 50; /* 50% */

/* Weather */
export const POD_RATE_LOWER_BOUND = 5; /* 5% */
export const OPTIMAL_POD_RATE = 15; /* 15% */
export const POD_RATE_UPPER_BOUND = 25; /* 25% */

export const DELTA_POD_DEMAND_LOWER_BOUND = 0.98; /* 98% */
export const DELTA_POD_DEMAND_UPPER_BOUND = 1.02; /* 102% */

/* Season */
// export const STEADY_SOW_TIME = 60; /* 60 seconds */
// export const RAIN_TIME = 24; /* 24 Seasons */
export const PEG_WEATHER_CASES = [
  3, 1, 0, 0, -1, -3, -3, 0, 3, 1, 0, 0, -1, -3, -3, 0, 3, 3, 1, 0, 0, -1, -3, 0,
  3, 3, 1, 0, 1, -1, -3, 0,
]; /* Peg Maintenance Weather Cases */

/* Website Settings */
export const BASE_SLIPPAGE = 0.995; /* 0.5% slippage */
export const CONVERT_BEAN_SLIPPAGE = 0.980; /* 2.0% slippage */
export const CONVERT_LP_SLIPPAGE = 0.990; /* 1.0% slippage */
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

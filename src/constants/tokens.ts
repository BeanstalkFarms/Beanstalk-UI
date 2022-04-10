export const BUDGETS = [
  '0xAA420e97534aB55637957e868b658193b112A551',
  '0x83A758a6a24FE27312C1f8BDa7F3277993b64783',
  '0xb7ab3f0667eFF5e2299d39C23Aa0C956e8982235',
  '0x21DE18B6A8f78eDe6D16C50A167f6B222DC08DF7',
];

export type SupportedToken = {
  addr: string;
  decimals: number;
  symbol?: string;
  factory?: string;
}

export const BEAN : SupportedToken = {
  addr: '0xDC59ac4FeFa32293A95889Dc396682858d52e5Db',
  decimals: 6,
  symbol: 'BEAN',
};

export const SEEDS : SupportedToken = {
  addr: '',
  decimals: 6,
};

export const STALK : SupportedToken = {
  addr: '',
  decimals: 10,
};

// Ether
export const ETH : SupportedToken = {
  addr: '',
  decimals: 18,
  symbol: 'ETH',
};

export const WETH : SupportedToken = {
  addr: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  decimals: 18,
};

// Supported Stables
export const USDC : SupportedToken = {
  addr: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  decimals: 6,
  symbol: 'USDC',
};

export const DAI : SupportedToken = {
  addr: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  decimals: 18,
  symbol: 'DAI',
};

export const TETHER : SupportedToken = {
  addr: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  decimals: 6,
  symbol: 'USDT',
};

// BEAN:ETH Uni V2 LP Pool
export const UNI_V2_ETH_BEAN_LP : SupportedToken = {
  addr: '0x87898263B6C5BABe34b4ec53F22d98430b91e371',
  decimals: 18,
};

// USDC:ETH Uni V2 LP Pool
export const UNI_V2_USDC_ETH_LP : SupportedToken = {
  addr: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
  decimals: 18,
};

// BEAN:3CRV Factory Pool
export const CURVE : SupportedToken = {
  addr: '0x3a70DfA7d2262988064A2D051dd47521E43c9BdD', // BEAN:3crv address
  // addr: '0xC20628FFFF326c80056e35E39308e4eE0Ff44fFC', // Ropsten
  decimals: 18,
  symbol: 'BEAN:3CRV',
  factory: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7', // 3crv address
};

// BEAN:LUSD Plain Pool
export const BEANLUSD : SupportedToken = {
  addr: '0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D', // BEAN:LUSD address
  // addr: '0xC20628FFFF326c80056e35E39308e4eE0Ff44fFC', // Ropsten
  decimals: 18,
  symbol: 'BEAN:LUSD',
  // factory: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7', // 3crv address
};

// LUSD:3CRV Factory Pool
export const LUSD : SupportedToken = {
  addr: '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA', // LUSD:3CRV address
  // addr: '0xC20628FFFF326c80056e35E39308e4eE0Ff44fFC', // Ropsten
  decimals: 18,
  symbol: 'LUSD:3CRV',
  // factory: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7', // 3crv address
};

export const PRICE = {
  addr: '0xcB64964117ae6dc6FaB049531Ed63dF949dCf6aF',
};

export const BEANSTALK_GETTERS = {
  addr: '0x2585Bc446edbD99de17A7a1a85EC328372c599f7',
};

export function changeTokenAddresses(chainId: number) {
  console.log(`changeAddresses: ${chainId}`);
  // Mainnet Addresses
  if (chainId === 1) {
    UNI_V2_USDC_ETH_LP.addr = '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc';
    WETH.addr = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    UNI_V2_ETH_BEAN_LP.addr = '0x87898263B6C5BABe34b4ec53F22d98430b91e371';
    USDC.addr = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
    CURVE.addr = '0x3a70DfA7d2262988064A2D051dd47521E43c9BdD';
    BEANLUSD.addr = '0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D';
    LUSD.addr = '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA';
    PRICE.addr = '0xcB64964117ae6dc6FaB049531Ed63dF949dCf6aF';
    BEANSTALK_GETTERS.addr = '0x2585Bc446edbD99de17A7a1a85EC328372c599f7';
  }
  // Ropsten Addresses
  else if (chainId === 3) {
    UNI_V2_USDC_ETH_LP.addr = '0x681A4164703351d6AceBA9D7038b573b444d3353';
    WETH.addr = '0xc778417E063141139Fce010982780140Aa0cD5Ab';
    UNI_V2_ETH_BEAN_LP.addr = '0x298c5f1f902c5bDc2936eb44b3E0E8675F40B8db';
    USDC.addr = '0x07865c6E87B9F70255377e024ace6630C1Eaa37F';
    CURVE.addr = '0xC20628FFFF326c80056e35E39308e4eE0Ff44fFC';
    BEANLUSD.addr = '0xC20628FFFF326c80056e35E39308e4eE0Ff44fFC'; // FIX: change ropsten BEAN:LUSD address (currently curve)
    LUSD.addr = '0xC20628FFFF326c80056e35E39308e4eE0Ff44fFC'; // using curuve ropsten address for lusd:3crv pool
    PRICE.addr = '0x9d80cDBFee5c8294BCb2b356F608Db90b2D13d4b';
    BEANSTALK_GETTERS.addr = '0xB6CC892079345d69BE3a6C91DCc8Dc0D2AAb4A03';
  }
}

export const supportedERC20Tokens = [
  WETH,
  BEAN,
  USDC,
  CURVE,
  BEANLUSD
];

export const supportedTokens = supportedERC20Tokens;

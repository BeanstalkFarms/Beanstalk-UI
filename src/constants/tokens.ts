export const BUDGETS = [
  '0xAA420e97534aB55637957e868b658193b112A551',
  '0x83A758a6a24FE27312C1f8BDa7F3277993b64783',
  '0xb7ab3f0667eFF5e2299d39C23Aa0C956e8982235',
  '0x21DE18B6A8f78eDe6D16C50A167f6B222DC08DF7',
];

export const BEANFTGENESIS = {
  addr: '0xa755A670Aaf1FeCeF2bea56115E65e03F7722A79', // Mainnet
  decimals: 6,
  symbol: 'BEANFT',
};

export const CURVE = {
  addr: '0x3a70DfA7d2262988064A2D051dd47521E43c9BdD', // BEAN:3crv address
  decimals: 18,
  symbol: 'BEAN:3CRV',
  factory: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7', // 3crv address
};

export const BEANFTCOLLECTION = {
  addr: '0x459895483556daD32526eFa461F75E33E458d9E9', // Mainnet
  decimals: 6,
  symbol: 'BEANFT',
};

export const BEAN = {
  addr: '0xDC59ac4FeFa32293A95889Dc396682858d52e5Db', // Mainnet
  decimals: 6,
  symbol: 'Bean',
};

export const BEANSTALK = {
  addr: '0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5',
  decimals: 6,
};

export const UNI_V2_ETH_BEAN_LP = {
  addr: '0x87898263B6C5BABe34b4ec53F22d98430b91e371', // Mainnet
  // addr: '0x298c5f1f902c5bDc2936eb44b3E0E8675F40B8db', // Ropsten
  decimals: 18,
};

export const SEEDS = {
  addr: '',
  decimals: 6,
};

export const UNI = {
  addr: '0x88ff79eB2Bc5850F27315415da8685282C7610F9',
  decimals: 18,
  symbol: 'UNI',
};

export const USDC = {
  addr: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  decimals: 6,
  symbol: 'USDC',
};

export const ETH = {
  decimals: 18,
  symbol: 'ETH',
};

export const STALK = {
  addr: '0x9d4454B023096f34B160D6B654540c56A1F81688',
  decimals: 10,
};

export const WETH = {
  addr: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Mainnet
  // addr: '0xc778417E063141139Fce010982780140Aa0cD5Ab', // Ropsten
  decimals: 18,
};

export const UNI_V2_USDC_ETH_LP = {
  addr: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc', // Mainnet
  // addr: '0x681A4164703351d6AceBA9D7038b573b444d3353', // Ropsten
  decimals: 18,
};

export function changeAddresses(chainId) {
  if (chainId === 1) {
    UNI_V2_USDC_ETH_LP.addr = '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc';
    WETH.addr = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    UNI_V2_ETH_BEAN_LP.addr = '0x87898263B6C5BABe34b4ec53F22d98430b91e371';
    USDC.addr = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  } else if (chainId === 3) {
    UNI_V2_USDC_ETH_LP.addr = '0x681A4164703351d6AceBA9D7038b573b444d3353';
    WETH.addr = '0xc778417E063141139Fce010982780140Aa0cD5Ab';
    UNI_V2_ETH_BEAN_LP.addr = '0x298c5f1f902c5bDc2936eb44b3E0E8675F40B8db';
    USDC.addr = '0x07865c6E87B9F70255377e024ace6630C1Eaa37F';
  }
}

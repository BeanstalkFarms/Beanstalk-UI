import { SupportedChainId } from './chains';

// ----------------------------------------
// Beanstalk Contracts
// ----------------------------------------

export const BEANSTALK_ADDRESSES = {
  [SupportedChainId.MAINNET]:
    '0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5'.toLowerCase(),
  [SupportedChainId.ROPSTEN]:
    '0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5'.toLowerCase(),
};

export const BEANSTALK_PRICE_ADDRESSES = {
  [SupportedChainId.MAINNET]:
    '0xcB64964117ae6dc6FaB049531Ed63dF949dCf6aF'.toLowerCase(),
  [SupportedChainId.ROPSTEN]:
    '0xB721C3386052389892A898EC700619A7Ab20C6B7'.toLowerCase(),
  [SupportedChainId.PHOENIX]:
    '0x34cd75271fcf6a733a6f069f2afbd6c223811334'.toLowerCase(),
  [SupportedChainId.LOCALHOST]:
    '0x34cd75271fcf6a733a6f069f2afbd6c223811334'.toLowerCase(),
};

export const BEANSTALK_FERTILIZER_ADDRESSES = {
  [SupportedChainId.MAINNET]:
    '0x402c84De2Ce49aF88f5e2eF3710ff89bFED36cB6'.toLowerCase(),
  [SupportedChainId.ROPSTEN]:
    '0x82025f355969E7D2A64e4Dba1Ca0263843E6fbB1'.toLowerCase(),
};

export const BARNRAISE_CUSTODIAN_ADDRESSES = {
  [SupportedChainId.MAINNET]:
    '0xa9bA2C40b263843C04d344727b954A545c81D043'.toLowerCase(),
  [SupportedChainId.ROPSTEN]:
    '0xA3D5F4042899a52f2ae7A0Cc58C079EFB62B9e43'.toLowerCase(),
};

// ----------------------------------------
// BeaNFT Contracts
// ----------------------------------------

export const BEANFT_GENESIS_ADDRESSES = {
  [SupportedChainId.MAINNET]:
    '0xa755A670Aaf1FeCeF2bea56115E65e03F7722A79'.toLowerCase(),
  [SupportedChainId.ROPSTEN]:
    '0xa755A670Aaf1FeCeF2bea56115E65e03F7722A79'.toLowerCase(),
};

export const BEANFT_WINTER_ADDRESSES = {
  [SupportedChainId.MAINNET]:
    '0x459895483556daD32526eFa461F75E33E458d9E9'.toLowerCase(),
  [SupportedChainId.ROPSTEN]:
    '0x459895483556daD32526eFa461F75E33E458d9E9'.toLowerCase(),
};

// ----------------------------------------
// Bean & Unripe Bean Tokens
// ----------------------------------------

export const BEAN_ADDRESSES = {
  [SupportedChainId.MAINNET]:
    '0xDC59ac4FeFa32293A95889Dc396682858d52e5Db'.toLowerCase(),
  [SupportedChainId.ROPSTEN]:
    '0xDC59ac4FeFa32293A95889Dc396682858d52e5Db'.toLowerCase(),
  [SupportedChainId.PHOENIX]:
    '0xBEA0003eA948Db32082Fc6F4EC0729D258a0444c'.toLowerCase(),
  [SupportedChainId.LOCALHOST]:
    '0xBEA0003eA948Db32082Fc6F4EC0729D258a0444c'.toLowerCase(),
};

export const UNRIPE_BEAN_ADDRESSES = {
  // --------------------------------------------------
  // "Unripe Bean": Unripe vesting asset for the Bean token, Localhost
  // -------------------------------------------------
  [SupportedChainId.MAINNET]:
    '0x1BEA0050E63e05FBb5D8BA2f10cf5800B6224449'.toLowerCase(),
  [SupportedChainId.PHOENIX]:
    '0x1BEA0050E63e05FBb5D8BA2f10cf5800B6224449'.toLowerCase(),
  [SupportedChainId.LOCALHOST]:
    '0x1BEA0050E63e05FBb5D8BA2f10cf5800B6224449'.toLowerCase(),
};

export const UNRIPE_BEAN_CRV3_ADDRESSES = {
  // --------------------------------------------------
  // "Unripe BEAN:CRV3 LP": Unripe vesting asset for the BEAN:CRV3 LP token, Localhost
  // -------------------------------------------------
  [SupportedChainId.MAINNET]:
    '0x1BEA3CcD22F4EBd3d37d731BA31Eeca95713716D'.toLowerCase(),
  [SupportedChainId.PHOENIX]:
    '0x1BEA3CcD22F4EBd3d37d731BA31Eeca95713716D'.toLowerCase(),
  [SupportedChainId.LOCALHOST]:
    '0x1BEA3CcD22F4EBd3d37d731BA31Eeca95713716D'.toLowerCase(),
};

// ----------------------------------------
// Common ERC-20 Tokens
// ----------------------------------------

export const DAI_ADDRESSES = {
  [SupportedChainId.MAINNET]:
    '0x6B175474E89094C44Da98b954EedeAC495271d0F'.toLowerCase(),
};

export const USDC_ADDRESSES = {
  [SupportedChainId.MAINNET]:
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'.toLowerCase(),
  [SupportedChainId.ROPSTEN]:
    '0x07865c6E87B9F70255377e024ace6630C1Eaa37F'.toLowerCase(),
  // [SupportedChainId.RINKEBY]: '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b',
};

export const USDT_ADDRESSES = {
  [SupportedChainId.MAINNET]:
    '0xdAC17F958D2ee523a2206206994597C13D831ec7'.toLowerCase(),
  // [SupportedChainId.ROPSTEN]: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F'.toLowerCase(),
  // [SupportedChainId.RINKEBY]: '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b',
};

export const CRV3_ADDRESSES = {
  // --------------------------------------------------
  // "Curve.fi: 3CRV Token"
  // [Implements: ERC-20]
  // -------------------------------------------------
  [SupportedChainId.MAINNET]:
    '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490'.toLowerCase(),

  // --------------------------------------------------
  // "Beanstalk: b3Curve (B3CRV)"
  // [Implements: ERC-20]
  // [Unofficial Testnet Deployment by Beanstalk Farms]
  // --------------------------------------------------
  [SupportedChainId.ROPSTEN]:
    '0x3D1449b23Ed2Eff19c2da41170d0760299eE9dbD'.toLowerCase(),
};

export const LUSD_ADDRESSES = {
  [SupportedChainId.MAINNET]:
    '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0'.toLowerCase(),
  [SupportedChainId.ROPSTEN]:
    '0x86E5040C1F0459cb59B8cf2794555615554799D3'.toLowerCase(),
};

// ----------------------------------------
// Uniswap Pools
// ----------------------------------------

export const BEAN_ETH_UNIV2_ADDRESSES = {
  // --------------------------------------------------
  // "Uniswap V2: BEAN 3": Uniswap V2 Pair, Mainnet
  // --------------------------------------------------
  // token0 = 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2 (WETH)
  // token1 = 0xdc59ac4fefa32293a95889dc396682858d52e5db (BEAN)
  [SupportedChainId.MAINNET]:
    '0x87898263B6C5BABe34b4ec53F22d98430b91e371'.toLowerCase(),

  // --------------------------------------------------
  // "UniswapV2Pair": Uniswap V2 Pair, Ropsten
  // --------------------------------------------------
  // token0 = 0xc778417e063141139fce010982780140aa0cd5ab (WETH9)
  // token1 = 0xdc59ac4fefa32293a95889dc396682858d52e5db (BEAN)
  [SupportedChainId.ROPSTEN]:
    '0x298c5f1f902c5bDc2936eb44b3E0E8675F40B8db'.toLowerCase(),
};

// ----------------------------------------
// Curve Pools: BEAN
// ----------------------------------------

export const BEAN_CRV3_ADDRESSES = {
  // --------------------------------------------------
  // "Curve.fi Factory USD Metapool: Bean (BEAN3CRV-f)"
  // [Implements: ERC20 & Metapool]
  // --------------------------------------------------
  // coins[0] = 0xDC59ac4FeFa32293A95889Dc396682858d52e5Db (BEAN)
  // coins[1] = 0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490 (3CRV)
  //
  // 1. Creates a BEAN:3CRV Metapool contract.
  // 2. Issues BEAN3CRV-f, the pool's LP token. The pool address and
  //    the LP token address are identical. Note that this is NOT the
  //    case for 3pool itself on Mainnet:
  //    - 3CRV (the 3pool LP Token) = 0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490
  //    - 3pool Contract            = 0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7
  [SupportedChainId.MAINNET]:
    '0x3a70DfA7d2262988064A2D051dd47521E43c9BdD'.toLowerCase(),

  // --------------------------------------------------
  // "Curve.fi Factory USD Metapool: Bean:3Crv"
  // [Implements: ERC20 & Metapool]
  // --------------------------------------------------
  // coins[0] = 0xDC59ac4FeFa32293A95889Dc396682858d52e5Db (BEAN)
  // coins[1] = 0x3D1449b23Ed2Eff19c2da41170d0760299eE9dbD (b3CRV)
  //
  // NOTE: On Ropsten, there is a broken copy of this contract. The correct contract
  // is 0x9ED0380C5dedadd3b2a32f5D5FD6B3929f8d39d9.
  // https://ropsten.etherscan.io/address/0x8e0dc2f6e8fb8712bc1e3c411609e581077cd1d6
  //
  // NOTE: On Ropsten, there was an ERC-20 token called "MockSiloToken" deployed
  // for testing of Generalized Silo functionality. This was prior to Beanstalk's
  // deployment of the BEAN:3CRV Metapool on Ropsten. It is now deprecated.
  // https://ropsten.etherscan.io/address/0xC20628FFFF326c80056e35E39308e4eE0Ff44fFC
  [SupportedChainId.ROPSTEN]:
    '0x9ED0380C5dedadd3b2a32f5D5FD6B3929f8d39d9'.toLowerCase(),

  // --------------------------------------------------
  // Below is the address for the new BEAN:3CRV
  // metapool deployed as part of Replanting Beanstalk.
  // --------------------------------------------------
  [SupportedChainId.PHOENIX]:
    '0xc9C32cd16Bf7eFB85Ff14e0c8603cc90F6F2eE49'.toLowerCase(),
  [SupportedChainId.LOCALHOST]:
    '0xc9C32cd16Bf7eFB85Ff14e0c8603cc90F6F2eE49'.toLowerCase(),
};

export const BEAN_LUSD_ADDRESSES = {
  // --------------------------------------------------
  // "Curve.fi Factory Plain Pool: Bean-LUSD (BEANLUSD-f)"
  // [Implements: ERC20 & Metapool]
  // --------------------------------------------------
  [SupportedChainId.MAINNET]:
    '0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D'.toLowerCase(),

  // --------------------------------------------------
  // "Curve.fi Factory USD Metapool: Bean:3Crv"
  // [Implements: ERC20 & Metapool]
  // --------------------------------------------------
  // [SupportedChainId.ROPSTEN]: '0xC20628FFFF326c80056e35E39308e4eE0Ff44fFC',
};

// ----------------------------------------
// Curve Pools: Other
// ----------------------------------------

export const POOL3_ADDRESSES = {
  // --------------------------------------------------
  // "Curve.fi: DAI/USDC/USDT Pool" (aka 3pool)
  // --------------------------------------------------
  // coins[0] = 0x6B175474E89094C44Da98b954EedeAC495271d0F (DAI)
  // coins[1] = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 (USDC)
  // coins[2] = 0xdAC17F958D2ee523a2206206994597C13D831ec7 (USDT)
  [SupportedChainId.MAINNET]:
    '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7'.toLowerCase(),

  // --------------------------------------------------
  // 3pool Test
  // [Unofficial Testnet Deployment by Beanstalk Farms]
  // --------------------------------------------------
  [SupportedChainId.ROPSTEN]:
    '0x6412bbCeEf0b384B7f8142BDafeFE119178F1E22,'.toLowerCase(),
};

export const TRICRYPTO2_ADDRESSES = {
  // --------------------------------------------------
  // tricrypto2
  // --------------------------------------------------
  // coins[0] = 0xdAC17F958D2ee523a2206206994597C13D831ec7 (USDT)
  // coins[1] = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599 (WBTC)
  // coins[2] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 (WETH)
  [SupportedChainId.MAINNET]:
    '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46'.toLowerCase(),
};

// ----------------------------------------
// Curve: Registries / Factories / Utils
// ----------------------------------------
// "metapool" and "cryptoswap" are simultaneously
// - "registries" (they track a list of pools)
// - "factories"  (they allow creation of new pools)

// 3pool, etc.
export const POOL_REGISTRY_ADDRESSES = {
  [SupportedChainId.MAINNET]:
    '0x90e00ace148ca3b23ac1bc8c240c2a7dd9c2d7f5'.toLowerCase(),
};

// X:3CRV, etc. aka StableFactory
export const META_FACTORY_ADDRESSES = {
  [SupportedChainId.MAINNET]:
    '0xB9fC157394Af804a3578134A6585C0dc9cc990d4'.toLowerCase(),
};

// tricrypto2, etc.
export const CRYPTO_FACTORY_ADDRESSES = {
  [SupportedChainId.MAINNET]:
    '0x8F942C20D02bEfc377D41445793068908E2250D0'.toLowerCase(),
};

// zap
export const CURVE_ZAP_ADDRESSES = {
  [SupportedChainId.MAINNET]:
    '0xA79828DF1850E8a3A3064576f380D90aECDD3359'.toLowerCase(),
};

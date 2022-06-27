import { ethers } from "ethers";
import { BeanstalkReplanted__factory, Curve3Pool__factory, CurveFactory__factory, CurveTriCrypto2Pool__factory } from "constants/generated";
import { BEANSTALK_ADDRESSES, POOL3_ADDRESSES } from "constants/index";
import { getChainConstant } from "hooks/useChainConstant";
import { BEAN_CRV3_CURVE_POOL_MAINNET } from "constants/pools";


const TRICRYPTO2 = '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46';
const STABLE_FACTORY = '0xB9fC157394Af804a3578134A6585C0dc9cc990d4';
const CRYPTO_FACTORY = '0x0959158b6040D32d04c301A72CBFD6b39E21c9AE';

enum FarmFromMode {
  EXTERNAL = '0',
  INTERNAL = '1',
  INTERNAL_EXTERNAL = '2',
  INTERNAL_TOLERANT = '3',
}
enum FarmToMode {
  EXTERNAL = '0',
  INTERNAL = '1',
}

// export type ChainableFunctionResult = {
//   encode: (amountIn: ethers.BigNumber, minAmountOut: ethers.BigNumber) => string,
//   data?: any
// }
export type ChainableFunctionResult = {
  amountOut: ethers.BigNumber;
  data?: any;
  encode: (amountIn: ethers.BigNumber, minAmountOut: ethers.BigNumber) => string;
};
export type ChainableFunction = (amountIn: ethers.BigNumber) => Promise<ChainableFunctionResult>;

const getContracts = (provider: ethers.providers.BaseProvider) => {
  return {
    beanstalk: BeanstalkReplanted__factory.connect(
      getChainConstant(BEANSTALK_ADDRESSES, provider.network.chainId),
      provider,
    ),
    curve: {
      // Bean:CRV3 pool
      beanCrv3: BEAN_CRV3_CURVE_POOL_MAINNET.getContract(),
      // Other Curve pools
      tricrypto2: CurveTriCrypto2Pool__factory.connect(
        TRICRYPTO2,
        provider,
      ),
      pool3: Curve3Pool__factory.connect(
        getChainConstant(POOL3_ADDRESSES, provider.network.chainId),
        provider
      ),
      // Factories
      stableFactory: CurveFactory__factory.connect(STABLE_FACTORY, provider),
      cryptoFactory: CurveFactory__factory.connect(CRYPTO_FACTORY, provider),
    }
  }
}

export default class Farm {

  provider : ethers.providers.BaseProvider;

  contracts : ReturnType<typeof getContracts>;

  constructor(provider: ethers.providers.BaseProvider) {
    this.provider = provider;
    this.contracts = getContracts(provider);
  }

  static async estimate(
    fns: ChainableFunction[],
    initialArgs: [amountIn: ethers.BigNumber]
  ) : Promise<{
    amountOut: ethers.BigNumber;
    steps: ChainableFunctionResult[];
  }> {
    let args = initialArgs;
    const steps : ChainableFunctionResult[] = [];
    for (let i = 0; i < fns.length; i += 1) {
      console.debug(`[chain] calling ${i}`);
      const step = await fns[i](...args);
      console.debug(`[chain] called ${i} = `, step);
      args = [step.amountOut];
      steps.push(step);
    }
    return {
      amountOut: args[0],
      steps,
    };
  }

  static SLIPPAGE_PRECISION = ethers.BigNumber.from(10**6);

  static encodeSlippage(
    steps: ChainableFunctionResult[],
    _amountIn: ethers.BigNumber,
    slippage: ethers.BigNumber,
  ) {
    const fnData : string[] = [];
    let amountIn = _amountIn;
    for (let i = 0; i < steps.length; i += 1) {
      const amountOut    = steps[i].amountOut;
      const minAmountOut = amountOut.mul(Farm.SLIPPAGE_PRECISION.sub(slippage)).div(this.SLIPPAGE_PRECISION);
      console.debug(`[chain] encoding step ${i}: amountIn = ${amountIn}, expected amountOut = ${amountOut}, minAmountOut = ${minAmountOut}`)
      fnData.push(
        steps[i].encode(
          amountIn,
          minAmountOut,
        )
      );
      amountIn = amountOut;
    }
    return fnData;
  }

  // ------------------------------------------

  buyBeans = () => {
    return [
      this.swapTriCrypto,         // WETH -> USDT
      this.swapBeanCrv3Pool,      // USDT -> BEAN
    ]
  }
  
  buyAndDepositBeanCrv3LP = () => {
    return [
      this.swapTriCrypto,         // WETH -> USDT
      this.addLiquidity3Pool,     // USDT -> CRV3
      this.addLiquidityBeanCrv3,  // CRV3 -> BEAN:CRV3
    ]
  }

  // ------------------------------------------

  swapTriCrypto : ChainableFunction = async (
    amountInStep: ethers.BigNumber
  ) => {
    const pool      = this.contracts.curve.tricrypto2.address;
    const tokenIn   = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH
    const tokenOut  = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // USDT
    const amountOut = await this.contracts.curve.tricrypto2.get_dy(
      2, // i = WETH = tricryptoPoolV2.coins[2]
      0, // j = USDT = tricryptoPoolV2.coins[0]
      amountInStep,
      { gasLimit: 10000000 }
    );
    return {
      amountOut,
      encode: (amountIn: ethers.BigNumber, minAmountOut: ethers.BigNumber) => (
        this.contracts.beanstalk.interface.encodeFunctionData('exchange', [
          pool,
          tokenIn,
          tokenOut,
          amountIn,
          minAmountOut,
          false,
          FarmFromMode.INTERNAL_TOLERANT,
          FarmToMode.INTERNAL,
        ])
      ),
      data: {
        tokenIn,
        amountIn: amountInStep,
        tokenOut,
        amountOut,
        swap: {
          dex: 'curve',
          pool,
        }
      }
    };
  }

  swapBeanCrv3Pool : ChainableFunction = async (amountInStep: ethers.BigNumber) => {
    const pool      = this.contracts.curve.beanCrv3.address;
    const tokenIn   = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // USDT
    const tokenOut  = '0xDC59ac4FeFa32293A95889Dc396682858d52e5Db'; // BEAN
    const amountOut = await this.contracts.curve.beanCrv3.callStatic['get_dy_underlying(int128,int128,uint256)'](
      3,  // i = USDT = coins[3] ([BEAN, CRV3] => [BEAN, DAI, USDC, USDT])
      0,  // j = BEAN = coins[0]
      amountInStep,
      { gasLimit: 10000000 }
    );
    return {
      amountOut,
      encode: (amountIn: ethers.BigNumber, minAmountOut: ethers.BigNumber) => (
        this.contracts.beanstalk.interface.encodeFunctionData('exchangeUnderlying', [
          pool,
          tokenIn,
          tokenOut,
          amountIn,
          minAmountOut,
          FarmFromMode.INTERNAL_TOLERANT,
          FarmToMode.INTERNAL,
        ])
      ),
      data: {
        tokenIn,
        amountIn: amountInStep,
        tokenOut,
        amountOut,
        swap: {
          dex: 'curve',
          pool,
        }
      }
    };
  }

  addLiquidity3Pool : ChainableFunction = async (amountInStep: ethers.BigNumber) => {
    // assumes that amountInStep is USDT
    const pool = this.contracts.curve.pool3;
    const amountOut = await pool.callStatic.calc_token_amount(
      [0, 0, amountInStep],
      true, // _is_deposit
    );
    return {
      amountOut,
      encode: (amountIn: ethers.BigNumber, minAmountOut: ethers.BigNumber) => (
        this.contracts.beanstalk.interface.encodeFunctionData('addLiquidity', [
          pool.address,
          [0, 0, amountIn],
          minAmountOut,
          true,
          FarmFromMode.INTERNAL_TOLERANT,
          FarmToMode.INTERNAL,
        ])
      ),
      data: {}
    };
  }

  addLiquidityBeanCrv3 : ChainableFunction = async (amountInStep: ethers.BigNumber) => {
    const pool = this.contracts.curve.beanCrv3;
    const amountOut = await pool.callStatic['calc_token_amount(uint256[2],bool)'](
      [0, amountInStep],
      true // _is_deposit
    );
    return {
      amountOut,
      encode: (amountIn: ethers.BigNumber, minAmountOut: ethers.BigNumber) => (
        this.contracts.beanstalk.interface.encodeFunctionData('addLiquidity', [
          pool.address,
          [0, amountIn],
          minAmountOut,
          true,
          FarmFromMode.INTERNAL_TOLERANT,
          FarmToMode.INTERNAL,
        ])
      ),
      data: {}
    };
  }
  
}
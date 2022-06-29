import { ethers } from "ethers";
import { BeanstalkReplanted__factory, Curve3Pool__factory, CurveTriCrypto2Pool__factory, CurveRegistry__factory, CurveMetaFactory__factory, CurveCryptoFactory__factory, CurveCryptoFactory, CurveMetaPool__factory, CurveRegistry, CurveMetaFactory, CurvePlainPool__factory, CurveMetaPool } from "constants/generated";
import { BEANSTALK_ADDRESSES, BEAN_CRV3_ADDRESSES, POOL3_ADDRESSES } from "constants/index";
import { getChainConstant } from "hooks/useChainConstant";
import { Result } from "ethers/lib/utils";
import { BEAN, USDT, WETH } from "constants/tokens";

// declare function assert(condition : boolean, message?: string): asserts value;
function assert(condition : boolean, message?: string) : asserts condition is true {
  if(!condition) throw Error(message || 'Assertion failed');
}

const TRICRYPTO2 = '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46';

// Curve Registry Addresses
// -----–-----–-----–-----–-----–-----–-----–--------
// "metapool" and "cryptoswap" are simultaneously
// - "registries" (they track a list of pools)
// - "factories"  (they allow creation of new pools)
const POOL_REGISTRY  = '0x90e00ace148ca3b23ac1bc8c240c2a7dd9c2d7f5' as const; // has 3pool
const META_FACTORY   = '0xB9fC157394Af804a3578134A6585C0dc9cc990d4' as const; // has X:3CRV pools
const CRYPTO_FACTORY = '0x8F942C20D02bEfc377D41445793068908E2250D0' as const; // has tricrypto2

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

type CurveRegistries = {
  [POOL_REGISTRY]:  CurveRegistry;
  [META_FACTORY]:   CurveMetaFactory;
  [CRYPTO_FACTORY]: CurveCryptoFactory;
}

export type ChainableFunctionResult = {
  amountOut: ethers.BigNumber;
  data?: any;
  encode: (minAmountOut: ethers.BigNumber) => string;
  decode: (data: string) => Result;
};
export type ChainableFunction = (amountIn: ethers.BigNumber) => Promise<ChainableFunctionResult>;

const getContracts = (provider: ethers.providers.BaseProvider) => {
  const BEANSTALK =  getChainConstant(BEANSTALK_ADDRESSES, provider.network.chainId)
  const POOL3 = getChainConstant(POOL3_ADDRESSES, provider.network.chainId);
  const BEAN_CRV3 = getChainConstant(BEAN_CRV3_ADDRESSES, provider.network.chainId);
  return {
    beanstalk: BeanstalkReplanted__factory.connect(BEANSTALK, provider),
    curve: {
      // Pools
      pools: {
        pool3:      Curve3Pool__factory.connect(POOL3, provider),
        tricrypto2: CurveTriCrypto2Pool__factory.connect(TRICRYPTO2, provider),
        beanCrv3:   CurveMetaPool__factory.connect(BEAN_CRV3, provider),
      },
      // Registries
      registries: <CurveRegistries>{
        [POOL_REGISTRY]:  CurveRegistry__factory.connect(POOL_REGISTRY, provider),
        [META_FACTORY]:   CurveMetaFactory__factory.connect(META_FACTORY, provider),
        [CRYPTO_FACTORY]: CurveCryptoFactory__factory.connect(CRYPTO_FACTORY, provider)
      },
    }
  }
}

export default class Farm {

  provider : ethers.providers.BaseProvider;

  contracts : ReturnType<typeof getContracts>;

  static SLIPPAGE_PRECISION = ethers.BigNumber.from(10**6);

  // ------------------------------------------

  constructor(provider: ethers.providers.BaseProvider) {
    this.provider = provider;
    this.contracts = getContracts(provider);
  }

  // ------------------------------------------

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
      // console.debug(`[chain] calling ${i}`);
      const step = await fns[i](...args);
      // console.debug(`[chain] called ${i} = `, step);
      args = [step.amountOut];
      steps.push(step);
    }
    return {
      amountOut: args[0],
      steps,
    };
  }

  static encodeStepsWithSlippage(
    steps: ChainableFunctionResult[],
    _slippage: ethers.BigNumber,
  ) {
    const fnData : string[] = [];
    // let amountIn = _amountIn;
    for (let i = 0; i < steps.length; i += 1) {
      const amountOut    = steps[i].amountOut;
      const minAmountOut = amountOut.mul(Farm.SLIPPAGE_PRECISION.sub(_slippage)).div(Farm.SLIPPAGE_PRECISION);
      console.debug(`[chain] encoding step ${i}: expected amountOut = ${amountOut}, minAmountOut = ${minAmountOut}`)
      const encoded = steps[i].encode(minAmountOut);
      fnData.push(encoded);
    }
    return fnData;
  }

  // ------------------------------------------

  buyBeans = () => {
    return [
      // WETH -> USDT via tricrypto2 exchange
      this.exchange(
        TRICRYPTO2,
        CRYPTO_FACTORY,
        WETH[1].address,
        USDT[1].address,
      ),
      // USDT -> BEAN via bean3crv exchange_underlying
      this.exchangeUnderlying(
        this.contracts.curve.pools.beanCrv3.address,
        USDT[1].address,
        BEAN[1].address,
      ),
    ]
  }
  
  buyAndAddBEANCRV3Liquidity = () => {
    return [
      // WETH -> USDT via tricrypto2 exchange
      this.exchange(
        TRICRYPTO2,
        CRYPTO_FACTORY,
        WETH[1].address,
        USDT[1].address,
      ),
      // USDT -> deposit into pool3 for CRV3
      this.addLiquidity(
        this.contracts.curve.pools.pool3.address,
        POOL_REGISTRY,
        [0, 0, 1], // [DAI, USDC, USDT] use Tether from previous call
      ),
      // CRV3 -> deposit into beanCrv3 for BEAN:CRV3
      this.addLiquidity(
        this.contracts.curve.pools.beanCrv3.address,
        META_FACTORY,
        [0, 1],    // [BEAN, CRV3] use CRV3 from previous call
      ),
    ]
  }

  // ------------------------------------------

  // _getPoolContract = (
  //   _pool: string,
  //   _registry: keyof CurveRegistries,
  // ) => {
  //   const addr = _pool.toLowerCase();
  //   const pools = this.contracts.curve.pools;
  //   if (addr === pools.tricrypto2.address.toLowerCase()) {
  //     return pools.tricrypto2;
  //   } else if (addr === pools.pool3.address.toLowerCase()) {
  //     return pools.pool3;
  //   } else if (_registry === META_FACTORY) {
  //     return CurveMetaPool__factory.connect(_pool, this.provider);
  //   } /*else if (_registry === CRYPTO_FACTORY) {
  //     return CurvePlainPool__factory.connect(_pool, this.provider);
  //   }*/
  //   throw new Error(`Unknown pool + registry combination: ${_pool} ${_registry}`)
  // }

  // ------------------------------------------

  exchange = (
    _pool: string,
    _registry: keyof CurveRegistries,
    _tokenIn: string,
    _tokenOut: string
  ) : ChainableFunction => {
    return async (amountInStep: ethers.BigNumber) => {
      const registry = this.contracts.curve.registries[_registry];
      if (!registry) throw new Error(`Unknown registry: ${_registry}`);

      const [i, j] = await registry.get_coin_indices(
        _pool,
        _tokenIn,
        _tokenOut,
        { gasLimit: 10000000 }
      );
      const amountOut = await this.contracts.curve.pools.tricrypto2.get_dy(
        i,
        j,
        amountInStep,
        { gasLimit: 10000000 }
      );
      console.debug(`[step@exchange] i=${i}, j=${j}, amountOut=${amountOut.toString()}`)

      return {
        amountOut,
        encode: (minAmountOut: ethers.BigNumber) => (
          this.contracts.beanstalk.interface.encodeFunctionData('exchange', [
            _pool,
            _registry,
            _tokenIn,
            _tokenOut,
            amountInStep,
            minAmountOut,
            FarmFromMode.INTERNAL_TOLERANT,
            FarmToMode.INTERNAL,
          ])
        ),
        decode: (data: string) => this.contracts.beanstalk.interface.decodeFunctionData('exchange', data),
        data: {}
      }
    }
  }

  exchangeUnderlying = (
    _pool: string,
    // _registry: keyof typeof this.contracts.curve.registries,
    _tokenIn: string,
    _tokenOut: string
  ) : ChainableFunction => {
    return async (amountInStep: ethers.BigNumber) => {
      // const registry = this.contracts.curve.registries[_registry];
      // if (!registry) throw new Error(`Unknown registry: ${_registry}`);
      const registry = this.contracts.curve.registries[META_FACTORY];
      const [i, j] = await registry.get_coin_indices(
        _pool,
        _tokenIn,
        _tokenOut,
        { gasLimit: 1000000 }
      );
      // Only MetaPools have the ability to exchange_underlying
      // FIXME: 3pool also has a single get_dy_underlying method, will we ever use this?
      const amountOut = await CurveMetaPool__factory.connect(_pool, this.provider).callStatic['get_dy_underlying(int128,int128,uint256)'](
        i, // 3,  // i = USDT = coins[3] ([0=BEAN, 1=CRV3] => [0=BEAN, 1=DAI, 2=USDC, 3=USDT])
        j, // 0,  // j = BEAN = coins[0]
        amountInStep,
        { gasLimit: 10000000 }
      );
      
      console.debug(`[step@exchangeUnderlying] i=${i}, j=${j}, amountOut=${amountOut.toString()}`)

      return {
        amountOut,
        encode: (minAmountOut: ethers.BigNumber) => (
          this.contracts.beanstalk.interface.encodeFunctionData('exchangeUnderlying', [
            _pool,
            _tokenIn,
            _tokenOut,
            amountInStep,
            minAmountOut,
            FarmFromMode.INTERNAL_TOLERANT,
            FarmToMode.INTERNAL,
          ])
        ),
        decode: (data: string) => this.contracts.beanstalk.interface.decodeFunctionData('exchangeUnderlying', data),
        data: {
          // tokenIn,
          // amountIn: amountInStep,
          // tokenOut,
          // amountOut,
          // swap: {
          //   dex: 'curve',
          //   pool,
          // }
        }
      };

    }
  }

  addLiquidity(
    _pool: string,
    _registry: keyof CurveRegistries,
    _amounts: (
      readonly   [number, number]
      | readonly [number, number, number]
    ),
  ) : ChainableFunction {
    return async (_amountInStep: ethers.BigNumber) => {
      const amountInStep = _amounts.map((k) => (k === 1 ? _amountInStep : ethers.BigNumber.from(0)));

      // Get amount out based on the selected pool
      const poolAddr = _pool.toLowerCase();
      const pools = this.contracts.curve.pools;
      let amountOut;
      if (poolAddr === pools.tricrypto2.address.toLowerCase()) {
        assert(amountInStep.length === 3)
        amountOut = await pools.tricrypto2.callStatic.calc_token_amount(
          amountInStep as [any, any, any], // [DAI, USDC, USDT]; assumes that amountInStep is USDT
          true, // _is_deposit
        );
      } else if (poolAddr === pools.pool3.address.toLowerCase()) {
        amountOut = await pools.pool3.callStatic.calc_token_amount(
          amountInStep as [any, any, any],
          true,
        )
      } else if (_registry === META_FACTORY) {
        amountOut = await CurveMetaPool__factory.connect(_pool, this.provider)["calc_token_amount(uint256[2],bool)"](
          amountInStep as [any, any],
          true,
        );
      } else if (_registry === CRYPTO_FACTORY) {
        amountOut = await CurvePlainPool__factory.connect(_pool, this.provider).calc_token_amount(
          amountInStep as [any, any],
          true
        );
      }
      if (!amountOut) throw new Error('No supported pool found');

      console.debug(`[step@exchange] amounts.length=${_amounts.length} amountInStep=[${amountInStep.toString()}], amountOut=${amountOut.toString()}`)
      
      //
      return {
        amountOut,
        encode: (minAmountOut: ethers.BigNumber) => (
          this.contracts.beanstalk.interface.encodeFunctionData('addLiquidity', [
            _pool,
            _registry,
            amountInStep as any[], // could be 2 or 3 elems
            minAmountOut,
            FarmFromMode.INTERNAL_TOLERANT,
            FarmToMode.INTERNAL,
          ])
        ),
        decode: (data: string) => this.contracts.beanstalk.interface.decodeFunctionData('addLiquidity', data),
        data: {}
      };
    }
  }
}

  // ------------------------------------------

  // exchangeCryptoPool = (
  //   pool: string,
  //   tokenIn: string,
  //   tokenOut: string,
  // ) : ChainableFunction => {
  //   return async (amountInStep: ethers.BigNumber) => {
  //     const registry = this.contracts.curve.registries[CRYPTO_FACTORY];
  //     console.debug(`[step@swapCryptoPool] calling registry ${registry.address} get_coin_indices(${pool}, ${tokenIn}, ${tokenOut})`)
  //     const [i, j] = await registry.get_coin_indices(
  //       pool,
  //       tokenIn,
  //       tokenOut,
  //       { gasLimit: 10000000 }
  //     );
  //     console.debug(`[step@swapCryptoPool] i = ${i}, j = ${j}`)

  //     // FIXME: assumes pool = tricrypto2
  //     const amountOut = await this.contracts.curve.tricrypto2.get_dy(
  //       i,
  //       j,
  //       amountInStep,
  //       { gasLimit: 10000000 }
  //     );
  //     return {
  //       amountOut,
  //       encode: (minAmountOut: ethers.BigNumber) => (
  //         this.contracts.beanstalk.interface.encodeFunctionData('exchange', [
  //           pool,
  //           CRYPTO_FACTORY,
  //           tokenIn,
  //           tokenOut,
  //           amountInStep,
  //           minAmountOut,
  //           FarmFromMode.INTERNAL_TOLERANT,
  //           FarmToMode.INTERNAL,
  //         ])
  //       ),
  //       decode: (data: string) => this.contracts.beanstalk.interface.decodeFunctionData('exchange', data),
  //       data: {
  //         tokenIn,
  //         amountIn: amountInStep,
  //         tokenOut,
  //         amountOut,
  //         swap: {
  //           dex: 'curve',
  //           pool,
  //         }
  //       }
  //     };
  //   }
  // }

  // ------------------------------------------

  // swapTriCrypto : ChainableFunction = async (
  //   amountInStep: ethers.BigNumber
  // ) => {
  //   console.debug(`[step@swapTriCrypto] delegating to swapCryptoPool`)
  //   return this.exchangeCryptoPool(
  //     this.contracts.curve.tricrypto2.address,
  //     '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  //     '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  //   )(amountInStep);
  // }

  // swapBeanCrv3Pool : ChainableFunction = async (amountInStep: ethers.BigNumber) => {
  //   const pool      = this.contracts.curve.beanCrv3.address;
  //   const tokenIn   = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // USDT
  //   const tokenOut  = '0xDC59ac4FeFa32293A95889Dc396682858d52e5Db'; // BEAN
  //   const [i, j]    = await this.contracts.curve.registries[META_FACTORY].get_coin_indices(
  //     pool,
  //     tokenIn,
  //     tokenOut,
  //   );
  //   const amountOut = await this.contracts.curve.beanCrv3.callStatic['get_dy_underlying(int128,int128,uint256)'](
  //     i, // 3,  // i = USDT = coins[3] ([0=BEAN, 1=CRV3] => [0=BEAN, 1=DAI, 2=USDC, 3=USDT])
  //     j, // 0,  // j = BEAN = coins[0]
  //     amountInStep,
  //     { gasLimit: 10000000 }
  //   );
  //   return {
  //     amountOut,
  //     encode: (minAmountOut: ethers.BigNumber) => (
  //       this.contracts.beanstalk.interface.encodeFunctionData('exchangeUnderlying', [
  //         pool,
  //         tokenIn,
  //         tokenOut,
  //         amountInStep,
  //         minAmountOut,
  //         FarmFromMode.INTERNAL_TOLERANT,
  //         FarmToMode.INTERNAL,
  //       ])
  //     ),
  //     decode: (data: string) => this.contracts.beanstalk.interface.decodeFunctionData('exchangeUnderlying', data),
  //     data: {
  //       tokenIn,
  //       amountIn: amountInStep,
  //       tokenOut,
  //       amountOut,
  //       swap: {
  //         dex: 'curve',
  //         pool,
  //       }
  //     }
  //   };
  // }

  // addLiquidity3Pool : ChainableFunction = async (amountInStep: ethers.BigNumber) => {
  //   const pool = this.contracts.curve.pool3;
  //   const amountOut = await pool.callStatic.calc_token_amount(
  //     [0, 0, amountInStep], // [DAI, USDC, USDT]; assumes that amountInStep is USDT
  //     true, // _is_deposit
  //   );
  //   return {
  //     amountOut,
  //     encode: (minAmountOut: ethers.BigNumber) => (
  //       this.contracts.beanstalk.interface.encodeFunctionData('addLiquidity', [
  //         pool.address,
  //         POOL_REGISTRY,
  //         [0, 0, amountInStep],
  //         minAmountOut,
  //         FarmFromMode.INTERNAL_TOLERANT,
  //         FarmToMode.INTERNAL,
  //       ])
  //     ),
  //     decode: (data: string) => this.contracts.beanstalk.interface.decodeFunctionData('addLiquidity', data),
  //     data: {}
  //   };
  // }

  // addLiquidityBeanCrv3 : ChainableFunction = async (amountInStep: ethers.BigNumber) => {
  //   const pool = this.contracts.curve.beanCrv3;
  //   const amountOut = await pool.callStatic['calc_token_amount(uint256[2],bool)'](
  //     [0, amountInStep], // [BEAN, 3CRV]
  //     true // _is_deposit
  //   );
  //   return {
  //     amountOut,
  //     encode: (minAmountOut: ethers.BigNumber) => (
  //       this.contracts.beanstalk.interface.encodeFunctionData('addLiquidity', [
  //         pool.address,
  //         META_FACTORY,
  //         [0, amountInStep],
  //         minAmountOut,
  //         FarmFromMode.INTERNAL_TOLERANT,
  //         FarmToMode.INTERNAL,
  //       ])
  //     ),
  //     decode: (data: string) => this.contracts.beanstalk.interface.decodeFunctionData('addLiquidity', data),
  //     data: {}
  //   };
  // }
  
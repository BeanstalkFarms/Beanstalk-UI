import { ethers } from "ethers";
import { BeanstalkReplanted__factory, Curve3Pool__factory, CurveTriCrypto2Pool__factory, CurveRegistry__factory, CurveMetaFactory__factory, CurveCryptoFactory__factory, CurveMetaPool__factory, CurvePlainPool__factory } from "generated";
import { BEANSTALK_ADDRESSES, BEAN_CRV3_ADDRESSES, CRYPTO_FACTORY_ADDRESSES, META_FACTORY_ADDRESSES, POOL3_ADDRESSES, POOL_REGISTRY_ADDRESSES, TRICRYPTO2_ADDRESSES } from "constants/index";
import { Result } from "ethers/lib/utils";
import { BEAN, USDT, WETH } from "constants/tokens";
import { getChainConstant } from "util/Chain";

function assert(condition : boolean, message?: string) : asserts condition is true {
  if(!condition) throw Error(message || 'Assertion failed');
}

export enum FarmFromMode {
  EXTERNAL = '0',
  INTERNAL = '1',
  INTERNAL_EXTERNAL = '2',
  INTERNAL_TOLERANT = '3',
}
export enum FarmToMode {
  EXTERNAL = '0',
  INTERNAL = '1',
  DEPOSIT = '2'
}
export enum ClaimRewardsAction {
  MOW = '0',
  PLANT_AND_MOW = '1',
  ENROOT_AND_MOW = '2',
  CLAIM_ALL = '3',
}

export type ChainableFunctionResult = {
  amountOut: ethers.BigNumber;
  data?: any;
  encode: (minAmountOut: ethers.BigNumber) => string;
  decode: (data: string) => Result;
};
export type ChainableFunction = (amountIn: ethers.BigNumber) => Promise<ChainableFunctionResult>;

const getContracts = (provider: ethers.providers.BaseProvider) => {
  const chainId = provider.network.chainId;
  // Addressses
  const BEANSTALK       = getChainConstant(BEANSTALK_ADDRESSES, chainId)
  const POOL3           = getChainConstant(POOL3_ADDRESSES, chainId);
  const TRICRYPTO2      = getChainConstant(TRICRYPTO2_ADDRESSES, chainId)
  const BEAN_CRV3       = getChainConstant(BEAN_CRV3_ADDRESSES, chainId);
  const POOL_REGISTRY   = getChainConstant(POOL_REGISTRY_ADDRESSES, chainId);
  const META_FACTORY    = getChainConstant(META_FACTORY_ADDRESSES, chainId);
  const CRYPTO_FACTORY  = getChainConstant(CRYPTO_FACTORY_ADDRESSES, chainId);
  // Instances
  const poolRegistry    = CurveRegistry__factory.connect(POOL_REGISTRY, provider);
  const metaFactory     = CurveMetaFactory__factory.connect(META_FACTORY, provider);
  const cryptoFactory   = CurveCryptoFactory__factory.connect(CRYPTO_FACTORY, provider);

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
      registries: {
        poolRegistry,
        [POOL_REGISTRY]: poolRegistry,
        metaFactory,
        [META_FACTORY]: metaFactory,
        cryptoFactory,
        [CRYPTO_FACTORY]: cryptoFactory,
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
    this.provider  = provider;
    this.contracts = getContracts(provider);
  }

  // ------------------------------------------

  /**
   * Executes a sequence of contract calls to estimate the `amountOut` received of some token
   * after an arbitrary set of chained transactions.
   * @param fns array of chainable functions. Each accepts an `amountIn` and provides an `amountOut`.
   * @param initialArgs array of initial arguments, currently only contains [`amountIn`]
   * @returns struct containing the final `amountOut`
   */
  static async estimate(
    fns: ChainableFunction[],
    initialArgs: [amountIn: ethers.BigNumber]
  ) : Promise<{
    amountOut: ethers.BigNumber;
    steps: ChainableFunctionResult[];
  }> {
    let args = initialArgs;
    const steps : ChainableFunctionResult[] = [];
    // ratchet Promise.waterfall()
    for (let i = 0; i < fns.length; i += 1) {
      const step = await fns[i](...args);
      args = [step.amountOut];
      steps.push(step);
    }
    return {
      amountOut: args[0],
      steps,
    };
  }

  /**
   * Encode function calls with a predefined slippage amount.
   * @param steps from a previous call to `estimate()`
   * @param _slippage slippage as a percentage (ex 0.1 => 0.1%)
   * @returns array of strings containing encoded function data.
   */
  static encodeStepsWithSlippage(
    steps: ChainableFunctionResult[],
    _slippage: ethers.BigNumber
  ) {
    const fnData : string[] = [];
    for (let i = 0; i < steps.length; i += 1) {
      const amountOut = steps[i].amountOut;
      // slippage is calculated at each step
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
        this.contracts.curve.pools.tricrypto2.address,
        this.contracts.curve.registries.cryptoFactory.address,
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
        this.contracts.curve.pools.tricrypto2.address,
        this.contracts.curve.registries.cryptoFactory.address,
        WETH[1].address,
        USDT[1].address,
      ),
      // USDT -> deposit into pool3 for CRV3
      this.addLiquidity(
        this.contracts.curve.pools.pool3.address,
        this.contracts.curve.registries.poolRegistry.address,
        [0, 0, 1], // [DAI, USDC, USDT] use Tether from previous call
      ),
      // CRV3 -> deposit into beanCrv3 for BEAN:CRV3
      this.addLiquidity(
        this.contracts.curve.pools.beanCrv3.address,
        this.contracts.curve.registries.metaFactory.address,
        [0, 1],    // [BEAN, CRV3] use CRV3 from previous call
      ),
    ]
  }

  // ------------------------------------------

  exchange = (
    _pool     : string,
    _registry : string,
    _tokenIn  : string,
    _tokenOut : string,
    _fromMode : FarmFromMode = FarmFromMode.INTERNAL_TOLERANT,
    _toMode   : FarmToMode   = FarmToMode.INTERNAL,
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

      // FIXME: assumes exchange via tricrypto2
      const amountOut = await this.contracts.curve.pools.tricrypto2.get_dy(
        i,
        j,
        amountInStep,
        { gasLimit: 10000000 }
      );

      //
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
            _fromMode,
            _toMode,
          ])
        ),
        decode: (data: string) => this.contracts.beanstalk.interface.decodeFunctionData('exchange', data),
        data: {}
      }
    }
  }

  exchangeUnderlying = (
    _pool     : string,
    // _registry: keyof typeof this.contracts.curve.registries,
    _tokenIn  : string,
    _tokenOut : string,
    _fromMode : FarmFromMode = FarmFromMode.INTERNAL_TOLERANT,
    _toMode   : FarmToMode   = FarmToMode.INTERNAL,
  ) : ChainableFunction => {
    return async (amountInStep: ethers.BigNumber) => {
      // const registry = this.contracts.curve.registries[_registry];
      // if (!registry) throw new Error(`Unknown registry: ${_registry}`);
      const registry = this.contracts.curve.registries.metaFactory;
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
      
      //
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
            _fromMode,
            _toMode,
          ])
        ),
        decode: (data: string) => this.contracts.beanstalk.interface.decodeFunctionData('exchangeUnderlying', data),
        data: {}
      };

    }
  }

  addLiquidity(
    _pool     : string,
    _registry : string,
    _amounts  : (
      readonly   [number, number]
      | readonly [number, number, number]
    ),
    _fromMode : FarmFromMode = FarmFromMode.INTERNAL_TOLERANT,
    _toMode   : FarmToMode   = FarmToMode.INTERNAL,
  ) : ChainableFunction {
    return async (_amountInStep: ethers.BigNumber) => {
      // [0, 0, 1] => [0, 0, amountIn]
      const amountInStep = _amounts.map((k) => (k === 1 ? _amountInStep : ethers.BigNumber.from(0)));

      // Get amount out based on the selected pool
      const poolAddr = _pool.toLowerCase();
      const pools = this.contracts.curve.pools;
      let amountOut;
      if (poolAddr === pools.tricrypto2.address.toLowerCase()) {
        assert(amountInStep.length === 3);
        amountOut = await pools.tricrypto2.callStatic.calc_token_amount(
          amountInStep as [any, any, any], // [DAI, USDC, USDT]; assumes that amountInStep is USDT
          true, // _is_deposit
        );
      } else if (poolAddr === pools.pool3.address.toLowerCase()) {
        assert(amountInStep.length === 3);
        amountOut = await pools.pool3.callStatic.calc_token_amount(
          amountInStep as [any, any, any],
          true, // _is_deposit
        )
      } else if (_registry === this.contracts.curve.registries.metaFactory.address) {
        assert(amountInStep.length === 2);
        amountOut = await CurveMetaPool__factory.connect(_pool, this.provider)["calc_token_amount(uint256[2],bool)"](
          amountInStep as [any, any],
          true, // _is_deposit
        );
      } else if (_registry === this.contracts.curve.registries.cryptoFactory.address) {
        assert(amountInStep.length === 2);
        amountOut = await CurvePlainPool__factory.connect(_pool, this.provider).calc_token_amount(
          amountInStep as [any, any],
          true, // _is_deposit
        );
      }

      //
      if (!amountOut) throw new Error('No supported pool found');
      console.debug(`[step@addLiquidity] amounts.length=${_amounts.length} amountInStep=[${amountInStep.toString()}], amountOut=${amountOut.toString()}`)
      
      return {
        amountOut,
        encode: (minAmountOut: ethers.BigNumber) => (
          this.contracts.beanstalk.interface.encodeFunctionData('addLiquidity', [
            _pool,
            _registry,
            amountInStep as any[], // could be 2 or 3 elems
            minAmountOut,
            _fromMode,
            _toMode,
          ])
        ),
        decode: (data: string) => this.contracts.beanstalk.interface.decodeFunctionData('addLiquidity', data),
        data: {}
      };
    }
  }

  removeLiquidityOneToken(
    _pool     : string,
    _registry : string,
    _tokenOut : string,
    _fromMode : FarmFromMode = FarmFromMode.INTERNAL_TOLERANT,
    _toMode   : FarmToMode = FarmToMode.INTERNAL,
  ) : ChainableFunction {
    // _amountInStep is an an amount of LP token
    return async (_amountInStep: ethers.BigNumber) => {
      const registry = this.contracts.curve.registries.metaFactory;
      const coins = await registry.get_coins(_pool);
      const i = coins.findIndex((addr) => addr.toLowerCase() === _tokenOut.toLowerCase());
      
      // FIXME: only difference between this and addLiquidity is the boolean
      // Get amount out based on the selected pool
      const poolAddr = _pool.toLowerCase();
      const pools = this.contracts.curve.pools;
      let amountOut;
      if (poolAddr === pools.tricrypto2.address.toLowerCase()) {
        amountOut = await pools.tricrypto2.callStatic.calc_withdraw_one_coin(
          _amountInStep,
          i,
        );
      } else if (poolAddr === pools.pool3.address.toLowerCase()) {
        amountOut = await pools.pool3.callStatic.calc_withdraw_one_coin(
          _amountInStep,
          i,
        );
      } else if (_registry === this.contracts.curve.registries.metaFactory.address) {
        amountOut = await CurveMetaPool__factory.connect(_pool, this.provider)["calc_withdraw_one_coin(uint256,int128)"](
          _amountInStep,
          i,
        );
      } else if (_registry === this.contracts.curve.registries.cryptoFactory.address) {
        amountOut = await CurvePlainPool__factory.connect(_pool, this.provider).calc_withdraw_one_coin(
          _amountInStep,
          i,
        );
      }
      if (!amountOut) throw new Error('No supported pool found');

      console.debug(`[step@removeLiquidity] amountOut=${amountOut.toString()}`)

      return {
        amountOut,
        encode: (minAmountOut: ethers.BigNumber) => (
          this.contracts.beanstalk.interface.encodeFunctionData('removeLiquidityOneToken', [
            _pool,
            _registry,
            _tokenOut,
            _amountInStep,
            minAmountOut,
            _fromMode,
            _toMode,
          ])
        ),
        decode: (data: string) => this.contracts.beanstalk.interface.decodeFunctionData('removeLiquidityOneToken', data),
        data: {}
      };
    }
  }

  // removeLiquidity(
  //   _pool: string,
  //   _registry: string,
  //   _amounts: (
  //     readonly   [number, number]
  //     | readonly [number, number, number]
  //   ),
  //   _fromMode : FarmFromMode = FarmFromMode.INTERNAL_TOLERANT,
  //   _toMode   : FarmToMode = FarmToMode.INTERNAL,
  // ) : ChainableFunction {
  //   // _amountInStep is an an amount of LP token
  //   return async (_amountInStep: ethers.BigNumber) => {
  //     const i = _amounts.findIndex((k) => k === 1);

  //     // FIXME: only difference between this and addLiquidity is the boolean
  //     // Get amount out based on the selected pool
  //     const poolAddr = _pool.toLowerCase();
  //     const pools = this.contracts.curve.pools;
  //     let amountOut;
  //     if (poolAddr === pools.tricrypto2.address.toLowerCase()) {
  //       amountOut = await pools.tricrypto2.callStatic.calc_withdraw_one_coin(
  //         _amountInStep,
  //         i,
  //       );
  //     } else if (poolAddr === pools.pool3.address.toLowerCase()) {
  //       amountOut = await pools.pool3.callStatic.calc_withdraw_one_coin(
  //         _amountInStep,
  //         i,
  //       );
  //     } else if (_registry === this.contracts.curve.registries.metaFactory.address) {
  //       amountOut = await CurveMetaPool__factory.connect(_pool, this.provider)["calc_withdraw_one_coin(uint256,int128)"](
  //         _amountInStep,
  //         i,
  //       );
  //     } else if (_registry === this.contracts.curve.registries.cryptoFactory.address) {
  //       amountOut = await CurvePlainPool__factory.connect(_pool, this.provider).calc_withdraw_one_coin(
  //         _amountInStep,
  //         i,
  //       );
  //     }
  //     if (!amountOut) throw new Error('No supported pool found');

  //     console.debug(`[step@removeLiquidity] amounts.length=${_amounts.length}, amountOut=${amountOut.toString()}`)

  //     return {
  //       amountOut,
  //       encode: (minAmountOut: ethers.BigNumber) => (
  //         this.contracts.beanstalk.interface.encodeFunctionData('removeLiquidity', [
  //           _pool,
  //           _registry,
  //           _amountInStep,
  //           _amounts.map((k) => (k === 1 ? minAmountOut : ethers.BigNumber.from(0))), // [0, 0, 1] => [0, 0, minAmountOut]
  //           _fromMode,
  //           _toMode,
  //         ])
  //       ),
  //       decode: (data: string) => this.contracts.beanstalk.interface.decodeFunctionData('removeLiquidity', data),
  //       data: {}
  //     };
  //   }
  // }

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
  
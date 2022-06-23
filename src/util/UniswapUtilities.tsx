import BigNumber from 'bignumber.js';
import { BEAN, WETH, zeroBN } from 'constants/index';
import { account, MinBN, uniswapRouterContract } from './index';
import { handleCallbacks, TxnCallbacks } from './TxnUtilities';

const DEADLINE_FROM_NOW = 60 * 15;
const createDeadline = () => Math.ceil(Date.now() / 1000) + DEADLINE_FROM_NOW;

export enum SwapMode {
  Bean = 0,
  BeanEthereum,
  Ethereum,
  LP,
  BeanEthereumSwap,
}

// FIXME: move somewhere else when we're no longer exclusively using uniswap
export type SwapSettings = {
  claim: boolean;
  mode: SwapMode;
  slippage: BigNumber;
}

/** */
export const buyExactBeans = async (
  amountIn: string,
  amountOut: string,
  to: string | undefined,
  onResponse: TxnCallbacks['onResponse'],
) => handleCallbacks(
  () => uniswapRouterContract().swapETHForExactTokens(
    amountOut,
    [WETH.addr, BEAN.addr],
    to || account,          // custom destination if provided; otherwise, to connected wallet
    createDeadline(),
    { value: amountIn }
  ),
  { onResponse }
);

/**
 * 
 */
export const buyBeans = async (
  amountIn: string,
  amountOutMin: string,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  () => uniswapRouterContract().swapExactETHForTokens(
    amountOutMin,
    [WETH.addr, BEAN.addr],
    account,
    createDeadline(),
    { value: amountIn }
  ),
  { onResponse }
);

/**
 * 
 */
export const sellBeans = async (
  amountIn: string,
  amountOutMin: string,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  () => uniswapRouterContract().swapExactTokensForETH(
    amountIn,
    amountOutMin,
    [BEAN.addr, WETH.addr],
    account,
    createDeadline()
  ),
  { onResponse }
);

/** 
 * Used to calculate how much of an underlying reserve a given amount of LP tokens owns in an LP pool.
 * 
 * amount - the amount of LP tokens the farmer owns
 * reserve - the reserve of an asset in the lp pool
 * totalLP - the total lp tokens
 * returns the amount of reserve tokens the farmer owns.
 * Ownership of reserve tokens is proportional to ownership of LP tokens.
 */
export const tokenForLP = (amount, reserve, totalLP) =>
  amount.multipliedBy(reserve).dividedBy(totalLP);

/**
 * Used to calcuate the # of reserve tokens owned by a farmer for 2 assets in a pool (e.g. Beans + Eth)
 * Just calls tokenForLP twice.
 */
export const poolForLP = (amount, reserve1, reserve2, totalLP) => {
  if (
    amount.isLessThanOrEqualTo(0) ||
    reserve1.isLessThanOrEqualTo(0) ||
    reserve2.isLessThanOrEqualTo(0) ||
    totalLP.isLessThanOrEqualTo(0)
  ) {
    return [new BigNumber(0), new BigNumber(0)];
  }
  return [
    tokenForLP(amount, reserve1, totalLP),
    tokenForLP(amount, reserve2, totalLP),
  ];
};

/**
 * 
 * The opposite of tokenForLP. If a farmer owns/deposits X of reserve asset -> how many LP tokens do they 1 own/get. 
 * amount - the amount of the reserve asset the farmer has
 * reserve - the total amount of the reserve asset
 * totalLP - the total amount of the LP token
 * returns the amount of lp tokens that amount corresponds to.
 */
export const lpForToken = (amount, reserve, totalLP) =>
  amount.multipliedBy(totalLP).dividedBy(reserve);

/**
 * The opposite of poolForLP - used to calculate how many LP tokens a farmer gets if they deposit both reserve assets in a 2 asset pool.
 * e.g. if a farmer deposits amount1 of Beans and amount2 of Eth into an LP pool with reserve1 Beans, reserve2 Eth and totalLP LP tokens, it returns how many LP tokens the farmer gets.
 */
export const lpForPool = (amount1, reserve1, amount2, reserve2, totalLP) =>
  MinBN(
    lpForToken(amount1, reserve1, totalLP),
    lpForToken(amount2, reserve2, totalLP)
  );

/**
 * Gets the amount out from swapping in a Uniswap pool given the reserves and the amount in.
 * https://github.com/Uniswap/v2-periphery/blob/master/contracts/libraries/UniswapV2Library.sol
 */
export const getToAmount = (
  amountIn: BigNumber,
  reserveIn: BigNumber,
  reserveOut: BigNumber
) => {
  if (
    amountIn.isLessThanOrEqualTo(0) ||
    reserveIn.isLessThanOrEqualTo(0) ||
    reserveOut.isLessThanOrEqualTo(0)
  ) {
    return new BigNumber(0);
  }
  const amountInWithFee = amountIn.multipliedBy(997);
  const numerator = amountInWithFee.multipliedBy(reserveOut);
  const denominator = reserveIn.multipliedBy(1000).plus(amountInWithFee);
  return numerator.dividedBy(denominator);
};

/**
 * Gets the amount from swapping in a Uniswap pool given the reserves and the amount out.
 * https://github.com/Uniswap/v2-periphery/blob/master/contracts/libraries/UniswapV2Library.sol
 */
export const getFromAmount = (
  amountOut: BigNumber,
  reserveIn: BigNumber,
  reserveOut: BigNumber,
  decimals = 6
) => {
  if (
    amountOut.isLessThanOrEqualTo(0) ||
    reserveIn.isLessThanOrEqualTo(0) ||
    reserveOut.isLessThanOrEqualTo(0)
  ) {
    return new BigNumber(0);
  }
  if (amountOut.isGreaterThan(reserveOut)) return reserveOut;
  const numerator = reserveIn.multipliedBy(amountOut).multipliedBy(1000);
  const denominator = reserveOut.minus(amountOut).multipliedBy(997);
  return numerator.dividedBy(denominator).plus(10 ** (0 - decimals));
};

/**
 * Used to calculate the LP earned from from buying Beans from Eth and adding LP
 * Returns how many Beans to buy such that the remaining Eth is the exact proportion to add Beans/Eth into LP.
 */
export const getBuyAndAddLPAmount = (
  eth: BigNumber,
  ethReserve: BigNumber,
  beanReserve: BigNumber
) => {
  const fee = new BigNumber(0.997);
  const c = eth
    .multipliedBy(fee)
    .multipliedBy(beanReserve)
    .multipliedBy(beanReserve);
  const b = zeroBN
    .minus(fee.multipliedBy(2).multipliedBy(eth).multipliedBy(beanReserve))
    .minus(fee.multipliedBy(ethReserve).multipliedBy(beanReserve))
    .minus(ethReserve.multipliedBy(beanReserve));
  const a = fee.multipliedBy(eth).plus(fee.multipliedBy(ethReserve));
  const determinant = b
    .multipliedBy(b)
    .minus(a.multipliedBy(c).multipliedBy(4));

  const beans1 = zeroBN
    .minus(b.minus(determinant.sqrt()))
    .dividedBy(a.multipliedBy(2));
  const beans2 = zeroBN
    .minus(b.plus(determinant.sqrt()))
    .dividedBy(a.multipliedBy(2));
  const estBeans = getToAmount(eth, ethReserve, beanReserve);
  return estBeans
    .minus(beans1)
    .absoluteValue()
    .isLessThanOrEqualTo(estBeans.minus(beans2).absoluteValue())
    ? beans1
    : beans2;
};

/**
 * Used to calculate the LP earned from buying Eth from Beans and adding LP
 * Returns how many Eth to buy such that the remaining Bean is the exact proportion to add Beans/Eth into LP.
 */
export const calculateBeansToLP = (
  beans: BigNumber,
  beanReserve: BigNumber,
  ethReserve: BigNumber,
  totalLP: BigNumber
) => {
  let c = beanReserve.multipliedBy(
    beans.multipliedBy(3988000).plus(beanReserve.multipliedBy(3988009))
  );
  c = c.sqrt();
  const swapBeans = c.minus(beanReserve.multipliedBy(1997)).dividedBy(1994);
  const addEth = getToAmount(swapBeans, beanReserve, ethReserve);

  const newBeanReserve = beanReserve.plus(swapBeans);
  const addBeans = beans.minus(swapBeans);
  const lp = addBeans.multipliedBy(totalLP).dividedBy(newBeanReserve);
  return {
    swapBeans,
    addEth,
    addBeans,
    lp,
  };
};

/**
 * Used to calculate the maximum amount of Beans to sell to the peg and add LP.
 */
export const calculateMaxBeansToPeg = (
  beansToPeg: BigNumber,
  beanReserve: BigNumber,
  ethReserve: BigNumber
) => {
  const ethBought = getToAmount(beansToPeg, beanReserve, ethReserve);
  const newBeanReserve = beanReserve.plus(beansToPeg);
  const newEthReserve = ethReserve
    .multipliedBy(beanReserve)
    .dividedBy(newBeanReserve);
  const beansToAdd = ethBought
    .multipliedBy(newBeanReserve)
    .dividedBy(newEthReserve);
  return beansToPeg.plus(beansToAdd);
};

/**
 * Used to calculate the maximum amount of LP to remove and use the underlying Beans to buy the price to the peg.
 */
export const calculateLPToBeans = (
  lp: BigNumber,
  beanReserve: BigNumber,
  ethReserve: BigNumber,
  totalLP: BigNumber
) => {
  const beansRemoved = lp.multipliedBy(beanReserve).dividedBy(totalLP);
  const ethRemoved = lp.multipliedBy(ethReserve).dividedBy(totalLP);

  const newBeanReserve = beanReserve.minus(beansRemoved);
  const newEthReserve = ethReserve.minus(ethRemoved);

  const beansBought = getToAmount(ethRemoved, ethReserve, beanReserve);

  const beans = beansRemoved.plus(beansBought);
  return {
    newBeanReserve,
    newEthReserve,
    beansRemoved,
    ethRemoved,
    beansBought,
    beans,
  };
};

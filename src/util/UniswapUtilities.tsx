import BigNumber from 'bignumber.js';
import { BEAN, WETH, zeroBN } from 'constants/index';
import { account, MinBN, txCallback, uniswapRouterContract } from './index';

const DEADLINE_FROM_NOW = 60 * 15;
const createDeadline = () => Math.ceil(Date.now() / 1000) + DEADLINE_FROM_NOW;

export enum SwapMode {
  Bean = 0,
  BeanEthereum,
  Ethereum,
  LP,
  BeanEthereumSwap,
}

export const buyBeans = async (amountIn, amountOutMin, callback) => {
  await uniswapRouterContract()
    .swapExactETHForTokens(
      amountOutMin,
      [WETH.addr, BEAN.addr],
      account,
      createDeadline(),
      { value: amountIn }
    )
    .then((response) => {
      callback();
      response.wait().then(() => {
        txCallback();
      });
    });
};

export const sellBeans = async (amountIn, amountOutMin, callback) => {
  await uniswapRouterContract()
    .swapExactTokensForETH(
      amountIn,
      amountOutMin,
      [BEAN.addr, WETH.addr],
      account,
      createDeadline()
    )
    .then((response) => {
      callback();
      response.wait().then(() => {
        txCallback();
      });
    });
};

export const tokenForLP = (amount, reserve, totalLP) =>
  amount.multipliedBy(reserve).dividedBy(totalLP);

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

export const lpForToken = (amount, reserve, totalLP) =>
  amount.multipliedBy(totalLP).dividedBy(reserve);

export const lpForPool = (amount1, reserve1, amount2, reserve2, totalLP) =>
  MinBN(
    lpForToken(amount1, reserve1, totalLP),
    lpForToken(amount2, reserve2, totalLP)
  );

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

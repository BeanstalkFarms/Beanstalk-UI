import BigNumber from 'bignumber.js';
import {
  BUDGETS,
  BEAN,
  BEANSTALK,
  CURVE,
  ETH,
  STALK,
  UNI_V2_ETH_BEAN_LP,
  UNI_V2_USDC_ETH_LP,
  UNISWAP_V2_ROUTER,
  USDC,
} from 'constants/index';
import {
  account,
  beanstalkContractReadOnly,
  curveContractReadOnly,
  initializing,
  pairContractReadOnly,
  tokenContractReadOnly,
  toTokenUnitsBN,
  web3,
} from './index';

/* Client is responsible for calling execute() */
export const createLedgerBatch = () => new web3.BatchRequest();

const makeBatchedPromises = (batch, promisesAndResultHandlers) => {
  const batchedPromises = promisesAndResultHandlers.map(
    (methodAndHandler) =>
      new Promise((resolve, reject) => {
        batch.add(
          methodAndHandler[0].call.request({}, 'latest', (error, result) => {
            if (result !== undefined) resolve(methodAndHandler[1](result));
            else reject(error);
          })
        );
      })
  );
  return Promise.all(batchedPromises);
};

const identityResult = (result) => result;
const bigNumberResult = (result) => new BigNumber(result);
const tokenResult = (token) => (result) =>
  toTokenUnitsBN(new BigNumber(result), token.decimals);

export async function getEtherBalance() {
  return tokenResult(ETH)(await web3.eth.getBalance(account));
}

export async function getUSDCBalance() {
  return tokenResult(USDC)(await web3.eth.getBalance(account));
}

export async function getEthPrices() {
  try {
    // FIXME
    const ethPrice = await fetch('https://beanstalk-etherscan-proxy.vercel.app/api/etherscan?module=stats&action=ethprice')
      .then((response) => response.json())
      .then((res) => res.result.ethusd);
    const gas = await fetch('https://beanstalk-etherscan-proxy.vercel.app/api/etherscan?module=gastracker&action=gasoracle')
      .then((response) => response.json())
      .then((res) => ({
        safe: res.result.FastGasPrice,
        propose: res.result.SafeGasPrice,
        fast: res.result.ProposeGasPrice,
      }));
    return {
      ...gas,
      ethPrice,
    };
  } catch (e) {
    console.log(e);
  }
}

export async function getBlockTimestamp(blockNumber) {
  await initializing;
  return (await web3.eth.getBlock(blockNumber)).timestamp;
}

/* Batched Getters */
export const getAccountBalances = async (batch) => {
  const bean = tokenContractReadOnly(BEAN);
  const lp = tokenContractReadOnly(UNI_V2_ETH_BEAN_LP);
  const beanstalk = beanstalkContractReadOnly();
  const usdc = tokenContractReadOnly(USDC);

  return makeBatchedPromises(batch, [
    [bean.methods.allowance(account, UNISWAP_V2_ROUTER), bigNumberResult],
    [bean.methods.allowance(account, BEANSTALK.addr), bigNumberResult],
    [lp.methods.allowance(account, BEANSTALK.addr), bigNumberResult],
    [usdc.methods.allowance(account, BEANSTALK.addr), bigNumberResult],
    [beanstalk.methods.balanceOfEth(account), tokenResult(ETH)],
    [bean.methods.balanceOf(account), tokenResult(BEAN)],
    [lp.methods.balanceOf(account), tokenResult(UNI_V2_ETH_BEAN_LP)],
    [beanstalk.methods.balanceOfSeeds(account), tokenResult(BEANSTALK)],
    [beanstalk.methods.balanceOfStalk(account), tokenResult(STALK)],
    [beanstalk.methods.votedUntil(account), bigNumberResult],
    [beanstalk.methods.balanceOfFarmableBeans(account), tokenResult(BEANSTALK)],
    [beanstalk.methods.balanceOfGrownStalk(account), tokenResult(STALK)],
    [beanstalk.methods.balanceOfRoots(account), bigNumberResult],
    [usdc.methods.balanceOf(account), tokenResult(USDC)],
    [beanstalk.methods.wrappedBeans(account), tokenResult(BEAN)],
  ]);
};
export const getTotalBalances = async (batch) => {
  const bean = tokenContractReadOnly(BEAN);
  const lp = tokenContractReadOnly(UNI_V2_ETH_BEAN_LP);
  const beanstalk = beanstalkContractReadOnly();

  return makeBatchedPromises(batch, [
    [bean.methods.totalSupply(), tokenResult(BEAN)],
    [lp.methods.totalSupply(), tokenResult(UNI_V2_ETH_BEAN_LP)],
    [beanstalk.methods.totalSeeds(), tokenResult(BEANSTALK)],
    [beanstalk.methods.totalStalk(), tokenResult(STALK)],
    [beanstalk.methods.totalDepositedBeans(), tokenResult(BEAN)],
    [beanstalk.methods.totalDepositedLP(), tokenResult(UNI_V2_ETH_BEAN_LP)],
    [beanstalk.methods.totalWithdrawnBeans(), tokenResult(BEAN)],
    [beanstalk.methods.totalWithdrawnLP(), tokenResult(UNI_V2_ETH_BEAN_LP)],
    [beanstalk.methods.totalSoil(), tokenResult(BEANSTALK)],
    [beanstalk.methods.podIndex(), tokenResult(BEANSTALK)],
    [beanstalk.methods.harvestableIndex(), tokenResult(BEANSTALK)],
    [beanstalk.methods.totalRoots(), bigNumberResult],
    [
      beanstalk.methods.weather(),
      (stringWeather) => ({
        didSowBelowMin: stringWeather.didSowBelowMin,
        didSowFaster: stringWeather.didSowFaster,
        lastDSoil: tokenResult(BEAN)(stringWeather.lastDSoil),
        lastSoilPercent: bigNumberResult(stringWeather.lastSoilPercent),
        lastSowTime: bigNumberResult(stringWeather.lastSowTime),
        nextSowTime: bigNumberResult(stringWeather.nextSowTime),
        startSoil: tokenResult(BEAN)(stringWeather.startSoil),
        weather: bigNumberResult(stringWeather.yield),
      }),
    ],
    [
      beanstalk.methods.rain(),
      (stringRain) => ({
        raining: stringRain.raining,
        rainStart: bigNumberResult(stringRain.start),
      }),
    ],
    [
      beanstalk.methods.time(),
      (time) => ({
        season: bigNumberResult(time.current),
        start: bigNumberResult(time.start),
        period: bigNumberResult(time.period),
        timestamp: bigNumberResult(time.timestamp),
      }),
    ],
    // TO DO: Automate this:
    [bean.methods.balanceOf(BUDGETS[0]), tokenResult(BEAN)],
    [bean.methods.balanceOf(BUDGETS[1]), tokenResult(BEAN)],
    [bean.methods.balanceOf(BUDGETS[2]), tokenResult(BEAN)],
    [bean.methods.balanceOf(BUDGETS[3]), tokenResult(BEAN)],
    [bean.methods.balanceOf(CURVE.addr), tokenResult(BEAN)],
  ]);
};

/* TODO: batch BIP detail ledger reads */
export const getBips = async () => {
  const beanstalk = beanstalkContractReadOnly();
  const numberOfBips = bigNumberResult(
    await beanstalk.methods.numberOfBips().call()
  );
  const bips = [];
  for (let i = new BigNumber(0); i.isLessThan(numberOfBips); i = i.plus(1)) {
    const bip = await beanstalk.methods.bip(i.toString()).call();
    const bipRoots =
      bip.endTotalRoots.toString() === '0'
        ? await beanstalk.methods.rootsFor(i.toString()).call()
        : bip.roots;
    const bipDict = {
      id: i,
      executed: bip.executed,
      increaseBase: bip.increaseBase,
      pauseOrUnpause: bigNumberResult(bip.pauseOrUnpause),
      start: bigNumberResult(bip.start),
      period: bigNumberResult(bip.period),
      proposer: bip.propser,
      roots: bigNumberResult(bipRoots),
      endTotalRoots: bigNumberResult(bip.endTotalRoots),
      stalkBase: bigNumberResult(bip.stalkBase),
      timestamp: bigNumberResult(bip.timestamp),
      updated: bigNumberResult(bip.updated),
      active: false,
    };
    bips.push(bipDict);
  }

  let hasActiveBIP = false;
  const activeBips = await beanstalk.methods.activeBips().call();
  activeBips.forEach((id) => {
    hasActiveBIP = true;
    bips[parseInt(id, 10)].active = true;
  });
  return [bips, hasActiveBIP];
};

/* TODO: batch BIP detail ledger reads */
export const getFundraisers = async () => {
  const beanstalk = beanstalkContractReadOnly();
  let hasActiveFundraiser = false;
  const numberOfFundraisers = bigNumberResult(
    await beanstalk.methods.numberOfFundraisers().call()
  );
  const fundraisers = [];
  for (let i = new BigNumber(0); i.isLessThan(numberOfFundraisers); i = i.plus(1)) {
    const fundraiser = await beanstalk.methods.fundraiser(i.toString()).call();
    const fundraiserDict = {
      id: i,
      remaining: toTokenUnitsBN(fundraiser.remaining, USDC.decimals),
      total: toTokenUnitsBN(fundraiser.total, USDC.decimals),
      token: fundraiser.token,
    };
    if (fundraiserDict.remaining.isGreaterThan(0)) hasActiveFundraiser = true;
    fundraisers.push(fundraiserDict);
  }
  return [fundraisers, hasActiveFundraiser];
};

export const getPrices = async (batch) => {
  const beanstalk = beanstalkContractReadOnly();
  const referenceLPContract = pairContractReadOnly(UNI_V2_USDC_ETH_LP);
  const lpContract = pairContractReadOnly(UNI_V2_ETH_BEAN_LP);
  const curveContract = curveContractReadOnly();

  return makeBatchedPromises(batch, [
    // referenceTokenReserves
    [
      referenceLPContract.methods.getReserves(),
      (reserves) => [
        bigNumberResult(reserves._reserve0),
        bigNumberResult(reserves._reserve1),
      ],
    ],
    // tokenReserves
    [
      lpContract.methods.getReserves(),
      (reserves) => [
        bigNumberResult(reserves._reserve0),
        bigNumberResult(reserves._reserve1),
      ],
    ],
    // token0
    [
      lpContract.methods.token0(),
      identityResult,
    ],
    // twapPrices
    [
      beanstalk.methods.getTWAPPrices(),
      (prices) => [
        toTokenUnitsBN(prices[0], 18),
        toTokenUnitsBN(prices[1], 18),
      ],
    ],
    // beansToPeg
    [
      beanstalk.methods.beansToPeg(),
      (lp) => toTokenUnitsBN(lp, 6),
    ],
    // lpToPeg
    [
      beanstalk.methods.lpToPeg(),
      (lp) => toTokenUnitsBN(lp, 18),
    ],
    // Virtual Curve price
    [
      curveContract.methods.get_virtual_price(),
      (price) => toTokenUnitsBN(price, 18),
    ],
    // Curve Bean price
    [
      curveContract.methods.get_dy(0, 1, 1),
      (price) => toTokenUnitsBN(price, 12),
    ],
  ]);
};

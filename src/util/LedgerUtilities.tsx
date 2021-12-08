import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import {
  DEVELOPMENT_BUDGET,
  MARKETING_BUDGET,
  BEAN,
  BEANSTALK,
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
  initializing,
  pairContractReadOnly,
  tokenContractReadOnly,
  toTokenUnitsBN,
} from './index';

/* Client is responsible for calling execute() */
export const createLedgerBatch = (_ethereum) =>
  new Web3(_ethereum).BatchRequest();

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

export async function getEtherBalance(_ethereum) {
  return tokenResult(ETH)(await new Web3(_ethereum).eth.getBalance(account));
}

export async function getUSDCBalance(_ethereum) {
  return tokenResult(USDC)(await new Web3(_ethereum).eth.getBalance(account));
}

export async function getBlockTimestamp(blockNumber, _ethereum) {
  await initializing;
  return (await new Web3(_ethereum).eth.getBlock(blockNumber)).timestamp;
}

/* Batched Getters */
export const getAccountBalances = async (batch) => {
  const bean = tokenContractReadOnly(BEAN);
  const lp = tokenContractReadOnly(UNI_V2_ETH_BEAN_LP);
  const beanstalk = beanstalkContractReadOnly();
  const usdc = tokenContractReadOnly(USDC);

  return makeBatchedPromises(batch, [
    [bean.allowance(account, UNISWAP_V2_ROUTER), bigNumberResult],
    [bean.allowance(account, BEANSTALK.addr), bigNumberResult],
    [lp.allowance(account, BEANSTALK.addr), bigNumberResult],
    [usdc.allowance(account, BEANSTALK.addr), bigNumberResult],
    [beanstalk.balanceOfEth(account), tokenResult(ETH)],
    [bean.balanceOf(account), tokenResult(BEAN)],
    [lp.balanceOf(account), tokenResult(UNI_V2_ETH_BEAN_LP)],
    [beanstalk.balanceOfSeeds(account), tokenResult(BEANSTALK)],
    [beanstalk.balanceOfStalk(account), tokenResult(STALK)],
    [beanstalk.lockedUntil(account), bigNumberResult],
    [beanstalk.balanceOfFarmableBeans(account), tokenResult(BEANSTALK)],
    [beanstalk.balanceOfGrownStalk(account), tokenResult(STALK)],
    [beanstalk.balanceOfRoots(account), bigNumberResult],
    [usdc.balanceOf(account), tokenResult(USDC)],
  ]);
};
/* last balanceOfIncreaseStalk is balanceOfGrownStalk once transitioned */

export const getTotalBalances = async (batch) => {
  const bean = tokenContractReadOnly(BEAN);
  const lp = tokenContractReadOnly(UNI_V2_ETH_BEAN_LP);
  const beanstalk = beanstalkContractReadOnly();

  return makeBatchedPromises(batch, [
    [bean.totalSupply(), tokenResult(BEAN)],
    [lp.totalSupply(), tokenResult(UNI_V2_ETH_BEAN_LP)],
    [beanstalk.totalSeeds(), tokenResult(BEANSTALK)],
    [beanstalk.totalStalk(), tokenResult(STALK)],
    [beanstalk.totalDepositedBeans(), tokenResult(BEAN)],
    [beanstalk.totalDepositedLP(), tokenResult(UNI_V2_ETH_BEAN_LP)],
    [beanstalk.totalWithdrawnBeans(), tokenResult(BEAN)],
    [beanstalk.totalWithdrawnLP(), tokenResult(UNI_V2_ETH_BEAN_LP)],
    [beanstalk.totalSoil(), tokenResult(BEANSTALK)],
    [beanstalk.podIndex(), tokenResult(BEANSTALK)],
    [beanstalk.harvestableIndex(), tokenResult(BEANSTALK)],
    [beanstalk.totalRoots(), bigNumberResult],
    [
      beanstalk.weather(),
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
      beanstalk.rain(),
      (stringRain) => ({
        raining: stringRain.raining,
        rainStart: bigNumberResult(stringRain.start),
      }),
    ],
    [
      beanstalk.time(),
      (time) => ({
        season: bigNumberResult(time.current),
        start: bigNumberResult(time.start),
        period: bigNumberResult(time.period),
        timestamp: bigNumberResult(time.timestamp),
      }),
    ],
    [bean.balanceOf(DEVELOPMENT_BUDGET), tokenResult(BEAN)],
    [bean.balanceOf(MARKETING_BUDGET), tokenResult(BEAN)],
  ]);
};

/* TODO: batch BIP detail ledger reads */
export const getBips = async () => {
  const beanstalk = beanstalkContractReadOnly();
  const numberOfBips = bigNumberResult(await beanstalk.numberOfBips());
  const bips = [];
  for (let i = new BigNumber(0); i.isLessThan(numberOfBips); i = i.plus(1)) {
    const bip = await beanstalk.bip(i.toString());
    const bipRoots =
      bip.endTotalRoots.toString() === '0'
        ? await beanstalk.rootsFor(i.toString())
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
  const activeBips = await beanstalk.activeBips();
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
    await beanstalk.numberOfFundraisers()
  );
  const fundraisers = [];
  for (
    let i = new BigNumber(0);
    i.isLessThan(numberOfFundraisers);
    i = i.plus(1)
  ) {
    const fundraiser = await beanstalk.fundraiser(i.toString());
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

  return makeBatchedPromises(batch, [
    [
      referenceLPContract.getReserves(),
      (reserves) => [
        bigNumberResult(reserves._reserve0),
        bigNumberResult(reserves._reserve1),
      ],
    ],
    [
      lpContract.getReserves(),
      (reserves) => [
        bigNumberResult(reserves._reserve0),
        bigNumberResult(reserves._reserve1),
      ],
    ],
    [lpContract.token0(), identityResult],
    [
      beanstalk.getTWAPPrices(),
      (prices) => [
        toTokenUnitsBN(prices[0], 18),
        toTokenUnitsBN(prices[1], 18),
      ],
    ],
  ]);
};

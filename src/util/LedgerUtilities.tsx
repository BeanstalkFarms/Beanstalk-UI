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
  beanstalkContractReadOnly,
  initializing,
  pairContractReadOnly,
  tokenContractReadOnly,
  toTokenUnitsBN,
} from './index';

/* Client is responsible for calling execute() */
export const createLedgerBatch = (_ethereum) => {
  const web3 = new Web3(_ethereum);
  return new web3.BatchRequest();
};

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

export async function getEtherBalance(account, _ethereum) {
  return tokenResult(ETH)(await new Web3(_ethereum).eth.getBalance(account));
}

export async function getUSDCBalance(account, _ethereum) {
  return tokenResult(USDC)(await new Web3(_ethereum).eth.getBalance(account));
}

export async function getBlockTimestamp(blockNumber, _ethereum) {
  await initializing;
  return (await new Web3(_ethereum).eth.getBlock(blockNumber)).timestamp;
}

/* Batched Getters */
export const getAccountBalances = async (account, batch, _ethereum) => {
  const web3 = new Web3(_ethereum);
  const bean = tokenContractReadOnly(BEAN, web3);
  const lp = tokenContractReadOnly(UNI_V2_ETH_BEAN_LP, web3);
  const beanstalk = beanstalkContractReadOnly(web3);
  const usdc = tokenContractReadOnly(USDC, web3);

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
    [beanstalk.methods.lockedUntil(account), bigNumberResult],
    [beanstalk.methods.balanceOfFarmableBeans(account), tokenResult(BEANSTALK)],
    [beanstalk.methods.balanceOfGrownStalk(account), tokenResult(STALK)],
    [beanstalk.methods.balanceOfRoots(account), bigNumberResult],
    [usdc.methods.balanceOf(account), tokenResult(USDC)],
  ]);
};
/* last balanceOfIncreaseStalk is balanceOfGrownStalk once transitioned */

export const getTotalBalances = async (batch, _ethereum) => {
  const web3 = new Web3(_ethereum);
  const bean = tokenContractReadOnly(BEAN, web3);
  const lp = tokenContractReadOnly(UNI_V2_ETH_BEAN_LP, web3);
  const beanstalk = beanstalkContractReadOnly(web3);

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
    [bean.methods.balanceOf(DEVELOPMENT_BUDGET), tokenResult(BEAN)],
    [bean.methods.balanceOf(MARKETING_BUDGET), tokenResult(BEAN)],
  ]);
};

/* TODO: batch BIP detail ledger reads */
export const getBips = async (_ethereum) => {
  const web3 = new Web3(_ethereum);
  const beanstalk = beanstalkContractReadOnly(web3);
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
export const getFundraisers = async (_ethereum) => {
  const web3 = new Web3(_ethereum);
  const beanstalk = beanstalkContractReadOnly(web3);
  let hasActiveFundraiser = false;
  const numberOfFundraisers = bigNumberResult(
    await beanstalk.methods.numberOfFundraisers().call()
  );
  const fundraisers = [];
  for (
    let i = new BigNumber(0);
    i.isLessThan(numberOfFundraisers);
    i = i.plus(1)
  ) {
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

export const getPrices = async (batch, _ethereum) => {
  const web3 = new Web3(_ethereum);
  const beanstalk = beanstalkContractReadOnly(web3);
  const referenceLPContract = pairContractReadOnly(UNI_V2_USDC_ETH_LP, web3);
  const lpContract = pairContractReadOnly(UNI_V2_ETH_BEAN_LP, web3);

  return makeBatchedPromises(batch, [
    [
      referenceLPContract.methods.getReserves(),
      (reserves) => [
        bigNumberResult(reserves._reserve0),
        bigNumberResult(reserves._reserve1),
      ],
    ],
    [
      lpContract.methods.getReserves(),
      (reserves) => [
        bigNumberResult(reserves._reserve0),
        bigNumberResult(reserves._reserve1),
      ],
    ],
    [lpContract.methods.token0(), identityResult],
    [
      beanstalk.methods.getTWAPPrices(),
      (prices) => [
        toTokenUnitsBN(prices[0], 18),
        toTokenUnitsBN(prices[1], 18),
      ],
    ],
    [beanstalk.methods.beansToPeg(), (lp) => toTokenUnitsBN(lp, 6)],
    [beanstalk.methods.lpToPeg(), (lp) => toTokenUnitsBN(lp, 18)],
  ]);
};

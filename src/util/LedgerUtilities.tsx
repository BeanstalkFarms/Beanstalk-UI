import BigNumber from 'bignumber.js';

// FIXME: experimenting with type importing from web3.
// import { Contract } from "web3-eth-contract";
// import { Method } from 'web3-core-method';
import { BatchRequest } from 'web3-core';

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
  TokenMetadata,
} from 'constants/index';

import {
  account,
  beanstalkContractReadOnly,
  initializing,
  pairContractReadOnly,
  tokenContractReadOnly,
  toTokenUnitsBN,
  web3,
} from './index';

/* Client is responsible for calling execute() */
export const createLedgerBatch : () => BatchRequest = () => new web3.BatchRequest();

/**
 *
 */
const makeBatchedPromises = (
  batch: BatchRequest,
  promisesAndResultHandlers: [any, (result: any) => any][] // FIXME: figure out how to import type for Contract.myMethod
) => {
  const batchedPromises = promisesAndResultHandlers.map(
    (methodAndHandler) =>
      new Promise((resolve, reject) => {
        batch.add(
          methodAndHandler[0].call.request({}, 'latest', (error: any, result: any) => {
            if (result !== undefined) resolve(methodAndHandler[1](result));
            else reject(error);
          })
        );
      })
  );
  return Promise.all(batchedPromises);
};

/* Result functions */
const identityResult = (result: any) => result;
const bigNumberResult = (result: number) => new BigNumber(result);
const tokenResult = (token: TokenMetadata) => (result: any) =>
  toTokenUnitsBN(new BigNumber(result), token.decimals);

/* Balance and block functions */
export async function getEtherBalance() {
  return tokenResult(ETH)(await web3.eth.getBalance(account));
}
export async function getUSDCBalance() {
  return tokenResult(USDC)(await web3.eth.getBalance(account));
}
<<<<<<< HEAD
=======

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

>>>>>>> dev
export async function getBlockTimestamp(blockNumber) {
  await initializing;
  return (await web3.eth.getBlock(blockNumber)).timestamp;
}

/* Batched Getters */
export const getAccountBalances = async (batch: BatchRequest) => {
  const bean = tokenContractReadOnly(BEAN);
  const lp = tokenContractReadOnly(UNI_V2_ETH_BEAN_LP);
  const beanstalk = beanstalkContractReadOnly();
  const usdc = tokenContractReadOnly(USDC);

  return makeBatchedPromises(batch, [
    [bean.methods.allowance(account, UNISWAP_V2_ROUTER), bigNumberResult], /* 0 */
    [bean.methods.allowance(account, BEANSTALK.addr), bigNumberResult], /* 1 */
    [lp.methods.allowance(account, BEANSTALK.addr), bigNumberResult], /* 2 */
    [usdc.methods.allowance(account, BEANSTALK.addr), bigNumberResult], /* 3 */
    [beanstalk.methods.balanceOfEth(account), tokenResult(ETH)], /* 4 */
    [bean.methods.balanceOf(account), tokenResult(BEAN)], /* 5 */
    [lp.methods.balanceOf(account), tokenResult(UNI_V2_ETH_BEAN_LP)], /* 6 */
    [beanstalk.methods.balanceOfSeeds(account), tokenResult(BEANSTALK)], /* 7 */
    [beanstalk.methods.balanceOfStalk(account), tokenResult(STALK)], /* 8 */
    [beanstalk.methods.lockedUntil(account), bigNumberResult], /* 9 */
    [beanstalk.methods.balanceOfFarmableBeans(account), tokenResult(BEANSTALK)], /* 10 */
    [beanstalk.methods.balanceOfGrownStalk(account), tokenResult(STALK)], /* 11 */
    [beanstalk.methods.balanceOfRoots(account), bigNumberResult], /* 12 */
    [usdc.methods.balanceOf(account), tokenResult(USDC)], /* 13 */
  ]);
};
/* last balanceOfIncreaseStalk is balanceOfGrownStalk once transitioned */

export const getTotalBalances = async (batch: BatchRequest) => {
  const bean = tokenContractReadOnly(BEAN);
  const lp = tokenContractReadOnly(UNI_V2_ETH_BEAN_LP);
  const beanstalk = beanstalkContractReadOnly();

  return makeBatchedPromises(batch, [
    [bean.methods.totalSupply(), tokenResult(BEAN)], /* 0 */
    [lp.methods.totalSupply(), tokenResult(UNI_V2_ETH_BEAN_LP)], /* 1 */
    [beanstalk.methods.totalSeeds(), tokenResult(BEANSTALK)], /* 2 */
    [beanstalk.methods.totalStalk(), tokenResult(STALK)], /* 3 */
    [beanstalk.methods.totalDepositedBeans(), tokenResult(BEAN)], /* 4 */
    [beanstalk.methods.totalDepositedLP(), tokenResult(UNI_V2_ETH_BEAN_LP)], /* 5 */
    [beanstalk.methods.totalWithdrawnBeans(), tokenResult(BEAN)], /* 6 */
    [beanstalk.methods.totalWithdrawnLP(), tokenResult(UNI_V2_ETH_BEAN_LP)], /* 7 */
    [beanstalk.methods.totalSoil(), tokenResult(BEANSTALK)], /* 8 */
    [beanstalk.methods.podIndex(), tokenResult(BEANSTALK)], /* 9 */
    [beanstalk.methods.harvestableIndex(), tokenResult(BEANSTALK)], /* 10 */
    [beanstalk.methods.totalRoots(), bigNumberResult], /* 11 */
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
    ], /* 12 */
    [
      beanstalk.methods.rain(),
      (stringRain) => ({
        raining: stringRain.raining,
        rainStart: bigNumberResult(stringRain.start),
      }),
    ], /* 13 */
    [
      beanstalk.methods.time(),
      (time) => ({
        season: bigNumberResult(time.current),
        start: bigNumberResult(time.start),
        period: bigNumberResult(time.period),
        timestamp: bigNumberResult(time.timestamp),
      }),
    ], /* 14 */
    [bean.methods.balanceOf(DEVELOPMENT_BUDGET), tokenResult(BEAN)], /* 15 */
    [bean.methods.balanceOf(MARKETING_BUDGET), tokenResult(BEAN)], /* 16 */
  ]);
};

/* TODO: batch BIP detail ledger reads */
export const getBips = async () => {
  //
  const beanstalk = beanstalkContractReadOnly();
  const numberOfBips = bigNumberResult(await beanstalk.methods.numberOfBips().call());
  const bips = [];

  //
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

export const getPrices = async (batch: BatchRequest) => {
  const beanstalk = beanstalkContractReadOnly();
  const referenceLPContract = pairContractReadOnly(UNI_V2_USDC_ETH_LP);
  const lpContract = pairContractReadOnly(UNI_V2_ETH_BEAN_LP);

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
    [
      lpContract.methods.token0(),
      identityResult,
    ],
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
  ]);
};

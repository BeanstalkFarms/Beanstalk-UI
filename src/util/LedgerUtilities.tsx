import BigNumber from 'bignumber.js';
import { utils } from 'ethers';
import { BatchRequest } from 'web3-core';

import {
  BUDGETS,
  BEAN,
  CURVE,
  ETH,
  STALK,
  SEEDS,
  UNI_V2_ETH_BEAN_LP,
  UNI_V2_USDC_ETH_LP,
  USDC,
  supportedERC20Tokens,
  SupportedToken,
} from 'constants/index';
import {
  account,
  beanstalkContractReadOnly,
  beanstalkPriceContractReadOnly,
  beanCrv3ContractReadOnly,
  curveContractReadOnly,
  initializing,
  pairContractReadOnly,
  tokenContractReadOnly,
  tokenV2ContractReadOnly,
  toTokenUnitsBN,
  web3,
  chainId,
} from './index';

import { Beanstalk } from 'beanstalk-sdk';

/* Client is responsible for calling execute() */
export const createLedgerBatch = () => new web3.BatchRequest();

// FIXME: move these elsewhere.
export type Weather = {
  didSowBelowMin: boolean;
  didSowFaster: boolean;
  lastDSoil: BigNumber;
  lastSoilPercent: BigNumber;
  lastSowTime: BigNumber;
  nextSowTime: BigNumber;
  startSoil: BigNumber;
  weather: BigNumber;
}

export type Rain = {
  raining: boolean;
  rainStart: BigNumber;
}

export type Time = {
  season: BigNumber;
  start: BigNumber;
  period: BigNumber;
  timestamp: BigNumber;
}

export type BIP = {
  id: BigNumber;
  executed: boolean;
  pauseOrUnpause: BigNumber;
  start: BigNumber;
  period: BigNumber;
  proposer: string;
  roots: BigNumber;
  endTotalRoots: BigNumber;
  timestamp: BigNumber;
  updated: BigNumber;
  active: boolean;
}

export type Fundraiser = {
  id: BigNumber;
  remaining: BigNumber;
  total: BigNumber;
  token: string;
}

/**
 * Create a scoped `execute` function which accepts a Contract
 * method and executes it when the batch is committed. The promise
 * resolves with the raw result of the method. Downstream functions
 * can use a chain of `.then` calls to mutate the returned value accordingly.
 * 
 * This ensures that Typescript keeps track of any changes to variable type
 * during that chain.
 */
const setupBatch = (batch: BatchRequest) => (
  function execute(fn: any) {
    return new Promise<any>((resolve, reject) => {
      batch.add(
        (fn.call).request({}, 'latest', (error: any, result: any) => {
          if (result !== undefined) {
            return resolve(result);
          }
          return reject(error);
        })
      );
    });
  }
);

// Result handlers
const identityResult = (result: any) => result;
const bigNumberResult = (result: any) => new BigNumber(result);
const tokenResult = (token : SupportedToken) => (result: BigNumber.Value) =>
  toTokenUnitsBN(new BigNumber(result), token.decimals);

/* ------------------- */

export async function getBlockTimestamp(blockNumber: any) {
  await initializing;
  return (await web3.eth.getBlock(blockNumber)).timestamp;
}

export async function getEtherBalance() {
  return web3.eth.getBalance(account).then(tokenResult(ETH));
}

export async function getUSDCBalance() {
  return web3.eth.getBalance(account).then(tokenResult(USDC));
}

export async function getEthPrices() {
  try {
    const [
      gas,
      ethPrice,
    ] = await Promise.all([
      fetch('https://beanstalk-etherscan-proxy.vercel.app/api/etherscan?module=gastracker&action=gasoracle')
        .then((response) => response.json())
        .then((res) => ({
          safe: res.result.FastGasPrice,
          propose: res.result.SafeGasPrice,
          fast: res.result.ProposeGasPrice,
        })),
      fetch('https://beanstalk-etherscan-proxy.vercel.app/api/etherscan?module=stats&action=ethprice')
        .then((response) => response.json())
        .then((res) => res.result.ethusd),
    ]);

    return {
      ...gas,
      ethPrice,
    };
  } catch (e) {
    console.error(e);
  }
}

export const getPriceArray = async () => {
  const beanstalkPrice = beanstalkPriceContractReadOnly();
  const priceTuple = await beanstalkPrice.methods.price().call();
  return priceTuple;
};

export const getTokenBalances = async (batch: BatchRequest) => {
  const exec = setupBatch(batch);
  return Promise.all(
    supportedERC20Tokens.map((t) => 
      exec(tokenV2ContractReadOnly(t).methods.balanceOf(account)).then(tokenResult(t))
    )
  );
};

export const getVotes = async () => {
  const beanstalk = beanstalkContractReadOnly();
  const activeBips = await beanstalk.methods.activeBips().call();
  const vs = await Promise.all(activeBips.map((b) => beanstalk.methods.voted(account, b).call()));
  return activeBips.reduce((acc, b, i) => {
    if (vs[i]) acc.add(b.toString());
    return acc;
  }, new Set());
};

/*
 * TODO: batch BIP detail ledger reads
 */
export const getBips = async (
  // currentSeason: BigNumber
) : Promise<[BIP[], boolean]> => {
  const beanstalk = beanstalkContractReadOnly();
  const numberOfBips = bigNumberResult(
    await beanstalk.methods.numberOfBips().call()
  );

  let hasActiveBIP : boolean = false;
  const bips : BIP[] = [];
  for (let i = new BigNumber(0); i.isLessThan(numberOfBips); i = i.plus(1)) {
    const bip = await beanstalk.methods.bip(i.toString()).call();

    const start = bigNumberResult(bip.start);
    const period = bigNumberResult(bip.period);
    // const active = currentSeason.lte(start.plus(period)) && bip.executed === false;
    const bipRoots = bip.endTotalRoots.toString() === '0'
      ? await beanstalk.methods.rootsFor(i.toString()).call()
      : bip.roots;

    // roots - how many Roots have voted for the BIP
    // endTotalRoots - if the BIP has ended, how many total Roots existed at the end of the BIP 
    // -> used for calculating % voted for the BIP after the fact.
    const bipDict = {
      id: i,
      executed: bip.executed,
      pauseOrUnpause: bigNumberResult(bip.pauseOrUnpause),
      start: start,
      period: period,
      proposer: bip.propser, // FIXME: typo?
      roots: bigNumberResult(bipRoots),
      endTotalRoots: bigNumberResult(bip.endTotalRoots),
      timestamp: bigNumberResult(bip.timestamp),
      updated: bigNumberResult(bip.updated),
      active: false,
    };

    bips.push(bipDict);
  }

  // https://github.com/BeanstalkFarms/Beanstalk/blob/8e5833bccef7fd4e41fbda70567b902d33ca410d/protocol/contracts/farm/AppStorage.sol#L99
  const activeBips : string[] = await beanstalk.methods.activeBips().call();
  activeBips.forEach((id: string) => {
    hasActiveBIP = true;
    bips[parseInt(id, 10)].active = true;
  });
  
  return [bips, hasActiveBIP];
};

/*
 * TODO: batch BIP detail ledger reads
 */
export const getFundraisers = async () : Promise<[Fundraiser[], boolean]> => {
  const beanstalk = beanstalkContractReadOnly();
  let hasActiveFundraiser = false;
  const numberOfFundraisers = bigNumberResult(
    await beanstalk.methods.numberOfFundraisers().call()
  );

  const fundraisers : Fundraiser[] = [];
  for (let i = new BigNumber(0); i.isLessThan(numberOfFundraisers); i = i.plus(1)) {
    const fundraiser = await beanstalk.methods.fundraiser(i.toString()).call();
    const fundraiserDict = {
      id: i,
      remaining: toTokenUnitsBN(fundraiser.remaining, USDC.decimals),
      total: toTokenUnitsBN(fundraiser.total, USDC.decimals),
      token: fundraiser.token,
    };
    if (fundraiserDict.remaining.isGreaterThan(0)) {
      hasActiveFundraiser = true;
    }
    fundraisers.push(fundraiserDict);
  }

  return [fundraisers, hasActiveFundraiser];
};

/**
 * 
 */
export const getPrices = async (batch: BatchRequest) => {
  const beanstalk = beanstalkContractReadOnly();
    const referenceLPContract = pairContractReadOnly(UNI_V2_USDC_ETH_LP);
  const lpContract = pairContractReadOnly(UNI_V2_ETH_BEAN_LP);
  const bean3crvContract = beanCrv3ContractReadOnly();
  const curveContract = curveContractReadOnly();

  const exec = setupBatch(batch);

  let promises = [
    // referenceTokenReserves
    exec(referenceLPContract.methods.getReserves()).then(
      (reserves) => [
        bigNumberResult(reserves._reserve0),
        bigNumberResult(reserves._reserve1),
      ],
    ),
    // tokenReserves
    exec(lpContract.methods.getReserves()).then(
      (reserves) => [
        bigNumberResult(reserves._reserve0),
        bigNumberResult(reserves._reserve1),
      ],
    ),
    // token0
    exec(lpContract.methods.token0()).then(
      identityResult,
    ),
    // twapPrices
    // https://github.com/BeanstalkFarms/Beanstalk/blob/c4b536e5470894e3f668d166f144f813bd386784/protocol/contracts/farm/facets/OracleFacet.sol#L87
    exec(beanstalk.methods.getTWAPPrices()).then(
      (prices: [string, string]) : [beanPrice: BigNumber, usdcPrice: BigNumber] => [
        toTokenUnitsBN(prices[0], 18),
        toTokenUnitsBN(prices[1], 18),
      ],
    ),
    // beansToPeg
    // https://github.com/BeanstalkFarms/Beanstalk/blob/c4b536e5470894e3f668d166f144f813bd386784/protocol/contracts/libraries/LibConvert.sol#L70
    exec(beanstalk.methods.beansToPeg()).then(
      (beans: string) => toTokenUnitsBN(beans, BEAN.decimals),
    ),
    // lpToPeg
    // https://github.com/BeanstalkFarms/Beanstalk/blob/c4b536e5470894e3f668d166f144f813bd386784/protocol/contracts/libraries/LibConvert.sol#L79
    exec(beanstalk.methods.lpToPeg()).then(
      (lp: string) => toTokenUnitsBN(lp, UNI_V2_ETH_BEAN_LP.decimals),
    ),
  ];

  // Curve prices (only works on mainnet or dev)
  // https://besu.hyperledger.org/en/stable/Concepts/NetworkID-And-ChainID/
  if (chainId === 1 || chainId === 1337) {
    promises = promises.concat([
      // Curve virtual price
      exec(curveContract.methods.get_virtual_price()).then(
        (price: string) => toTokenUnitsBN(price, 18),
      ),
      // Curve Bean price
      exec(bean3crvContract.methods.get_dy(0, 1, 1)).then(
        (price: string) => toTokenUnitsBN(price, 12),
      ),
      // Bean3Crv Balances
      exec(bean3crvContract.methods.get_balances()).then(
        (prices: [string, string]) => [
          toTokenUnitsBN(prices[0], 6),
          toTokenUnitsBN(prices[1], 18),
        ],
      ),
      //
      exec(beanstalk.methods.curveToBDV(utils.parseEther('1'))).then(
        (r: string) => toTokenUnitsBN(r, 6)
      ),
    ]);
  } else {
    promises = promises.concat([
      // 
      exec(lpContract.methods.balanceOf('0x0000000000000000000000000000000000000000')).then(
        () => new BigNumber(0),
      ),
      // Curve Bean price
      exec(lpContract.methods.balanceOf('0x0000000000000000000000000000000000000000')).then(
        () => new BigNumber(0),
      ),
      // Bean3Crv Balances
      exec(lpContract.methods.balanceOf('0x0000000000000000000000000000000000000000')).then(
        () => [new BigNumber(0), new BigNumber(0)],
      ),
      //
      exec(lpContract.methods.balanceOf('0x0000000000000000000000000000000000000000')).then(
        () => new BigNumber(1),
      ),
    ]);
  }

  return Promise.all(promises);
};

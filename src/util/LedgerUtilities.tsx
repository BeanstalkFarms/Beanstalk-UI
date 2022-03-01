import BigNumber from 'bignumber.js';
import { utils } from 'ethers';
import { BatchRequest } from 'web3-core';

import {
  BUDGETS,
  BEAN,
  BEANSTALK,
  CURVE,
  ETH,
  STALK,
  SEEDS,
  UNI_V2_ETH_BEAN_LP,
  UNI_V2_USDC_ETH_LP,
  UNISWAP_V2_ROUTER,
  USDC,
  supportedERC20Tokens,
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

/* Client is responsible for calling execute() */
export const createLedgerBatch = () => new web3.BatchRequest();

/* */
type PromiseHandlerTuple = readonly [
  any, // FIXME: should be type of callable contract handler
  (s: any) => any,
]
const makeBatchedPromises = (
  batch: BatchRequest,
  promisesAndResultHandlers: readonly PromiseHandlerTuple[]
) => {
  const batchedPromises = promisesAndResultHandlers.map(
    (methodAndHandler) =>
      new Promise<any>((resolve, reject) => {
        batch.add(
          (methodAndHandler[0].call).request({}, 'latest', (error: any, result: any) => {
            if (result !== undefined) resolve(methodAndHandler[1](result));
            else reject(error);
          })
        );
      })
  );
  return Promise.all(batchedPromises);
};

//
const identityResult = (result: any) => result;
const bigNumberResult = (result: any) => new BigNumber(result);
const tokenResult = (token) => (result: any) =>
  toTokenUnitsBN(new BigNumber(result), token.decimals);

export async function getEtherBalance() {
  return tokenResult(ETH)(await web3.eth.getBalance(account));
}

export async function getUSDCBalance() {
  return tokenResult(USDC)(await web3.eth.getBalance(account));
}

export async function getEthPrices() {
  try {
    const [
      ethPrice,
      gas
    ] = await Promise.all([
      fetch('https://beanstalk-etherscan-proxy.vercel.app/api/etherscan?module=stats&action=ethprice')
        .then((response) => response.json())
        .then((res) => res.result.ethusd),
      fetch('https://beanstalk-etherscan-proxy.vercel.app/api/etherscan?module=gastracker&action=gasoracle')
        .then((response) => response.json())
        .then((res) => ({
          safe: res.result.FastGasPrice,
          propose: res.result.SafeGasPrice,
          fast: res.result.ProposeGasPrice,
        }))
    ]);
    return {
      ...gas,
      ethPrice,
    };
  } catch (e) {
    console.log(e);
  }
}

export async function getBlockTimestamp(blockNumber: any) {
  await initializing;
  return (await web3.eth.getBlock(blockNumber)).timestamp;
}

/* Batched Getters */
export const getAccountBalances = async (batch: BatchRequest) => {
  const bean = tokenContractReadOnly(BEAN);
  const lp = tokenContractReadOnly(UNI_V2_ETH_BEAN_LP);
  const beanstalk = beanstalkContractReadOnly();
  const usdc = tokenContractReadOnly(USDC);
  const curve = beanCrv3ContractReadOnly();

  return makeBatchedPromises(batch, [
    [bean.methods.allowance(account, UNISWAP_V2_ROUTER), bigNumberResult],
    [bean.methods.allowance(account, BEANSTALK), bigNumberResult],
    [lp.methods.allowance(account, BEANSTALK), bigNumberResult],
    [usdc.methods.allowance(account, BEANSTALK), bigNumberResult],
    [curve.methods.allowance(account, BEANSTALK), bigNumberResult],
    [beanstalk.methods.balanceOfEth(account), tokenResult(ETH)],
    [bean.methods.balanceOf(account), tokenResult(BEAN)],
    [lp.methods.balanceOf(account), tokenResult(UNI_V2_ETH_BEAN_LP)],
    [curve.methods.balanceOf(account), tokenResult(CURVE)],
    [beanstalk.methods.balanceOfSeeds(account), tokenResult(SEEDS)],
    [beanstalk.methods.balanceOfStalk(account), tokenResult(STALK)],
    [beanstalk.methods.votedUntil(account), bigNumberResult],
    [beanstalk.methods.balanceOfFarmableBeans(account), tokenResult(BEAN)],
    [beanstalk.methods.balanceOfGrownStalk(account), tokenResult(STALK)],
    [beanstalk.methods.balanceOfRoots(account), bigNumberResult],
    [usdc.methods.balanceOf(account), tokenResult(USDC)],
    [beanstalk.methods.wrappedBeans(account), tokenResult(BEAN)],
  ]);
};

/* Beanstalk Price Getters */
export const getPriceArray = async () => {
  const beanstalkPrice = beanstalkPriceContractReadOnly();
  const priceTuple = await beanstalkPrice.methods.price().call();

  return priceTuple;
};
/* last balanceOfIncreaseStalk is balanceOfGrownStalk once transitioned */

export const getTokenBalances = async (batch: BatchRequest) =>
  makeBatchedPromises(batch, supportedERC20Tokens.map((t) => [
    tokenV2ContractReadOnly(t).methods.balanceOf(account), tokenResult(t)
  ]));

//
export const getTotalBalances = async (batch: BatchRequest) => {
  const bean = tokenContractReadOnly(BEAN);
  const lp = tokenContractReadOnly(UNI_V2_ETH_BEAN_LP);
  const beanstalk = beanstalkContractReadOnly();
  const curve = beanCrv3ContractReadOnly();

  return makeBatchedPromises(batch, [
    [bean.methods.totalSupply(), tokenResult(BEAN)],
    [lp.methods.totalSupply(), tokenResult(UNI_V2_ETH_BEAN_LP)],
    [curve.methods.totalSupply(), tokenResult(CURVE)],
    [beanstalk.methods.totalSeeds(), tokenResult(SEEDS)],
    [beanstalk.methods.totalStalk(), tokenResult(STALK)],
    [beanstalk.methods.totalDepositedBeans(), tokenResult(BEAN)],
    [beanstalk.methods.totalDepositedLP(), tokenResult(UNI_V2_ETH_BEAN_LP)],
    [beanstalk.methods.getTotalDeposited(CURVE.addr), tokenResult(CURVE)],
    [beanstalk.methods.totalWithdrawnBeans(), tokenResult(BEAN)],
    [beanstalk.methods.totalWithdrawnLP(), tokenResult(UNI_V2_ETH_BEAN_LP)],
    [beanstalk.methods.getTotalWithdrawn(CURVE.addr), tokenResult(CURVE)],
    [beanstalk.methods.totalSoil(), tokenResult(BEAN)],
    [beanstalk.methods.podIndex(), tokenResult(BEAN)],
    [beanstalk.methods.harvestableIndex(), tokenResult(BEAN)],
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
    [beanstalk.methods.withdrawSeasons(), bigNumberResult]
  ] as const);
};

export const votes = async () => {
  const beanstalk = beanstalkContractReadOnly();
  const activeBips = await beanstalk.methods.activeBips().call();
  const vs = await Promise.all(activeBips.map((b) => beanstalk.methods.voted(account, b).call()));
  return activeBips.reduce((acc, b, i) => {
    if (vs[i]) acc.add(b.toString());
    return acc;
  }, new Set());
};

//
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
  // @DEPRECATED
  // increaseBase: any;
  // stalkBase: BigNumber;
}

/*
 * TODO: batch BIP detail ledger reads
 */
export const getBips = async () : Promise<[BIP[], boolean]> => {
  const beanstalk = beanstalkContractReadOnly();
  const numberOfBips = bigNumberResult(
    await beanstalk.methods.numberOfBips().call()
  );

  const bips : BIP[] = [];
  for (let i = new BigNumber(0); i.isLessThan(numberOfBips); i = i.plus(1)) {
    const bip = await beanstalk.methods.bip(i.toString()).call();
    const bipRoots =
      bip.endTotalRoots.toString() === '0'
        ? await beanstalk.methods.rootsFor(i.toString()).call()
        : bip.roots;
    
    // @DEPRECATED: "increaseBase", "stalkBase"
    // roots - how many Roots have voted for the BIP
    // endTotalRoots - if the BIP has ended, how many total Roots existed at the end of the BIP -> used for calculating % voted for the BIP after the fact.
    const bipDict = {
      id: i,
      executed: bip.executed,
      pauseOrUnpause: bigNumberResult(bip.pauseOrUnpause),
      start: bigNumberResult(bip.start),
      period: bigNumberResult(bip.period),
      proposer: bip.propser,
      roots: bigNumberResult(bipRoots),
      endTotalRoots: bigNumberResult(bip.endTotalRoots),
      timestamp: bigNumberResult(bip.timestamp),
      updated: bigNumberResult(bip.updated),
      active: false,
      // @DEPRECATED
      // increaseBase: bip.increaseBase,
      // stalkBase: bigNumberResult(bip.stalkBase),
    };

    bips.push(bipDict);
  }

  // https://github.com/BeanstalkFarms/Beanstalk/blob/8e5833bccef7fd4e41fbda70567b902d33ca410d/protocol/contracts/farm/AppStorage.sol#L99
  let hasActiveBIP : boolean = false;
  const activeBips : string[] = await beanstalk.methods.activeBips().call();
  activeBips.forEach((id: string) => {
    hasActiveBIP = true;
    bips[parseInt(id, 10)].active = true;
  });
  
  return [bips, hasActiveBIP];
};

export type Fundraiser = {
  id: BigNumber;
  remaining: BigNumber;
  total: BigNumber;
  token: string;
}

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
      hasActiveFundraiser = true
    };
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

  let batchCall = [
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
  ];
  if (chainId === 1 || chainId === 1337) {
    batchCall = batchCall.concat(
      [
        [
          curveContract.methods.get_virtual_price(),
          (price) => toTokenUnitsBN(price, 18),
        ],
        // Curve Bean price
        [
          bean3crvContract.methods.get_dy(0, 1, 1),
          (price) => toTokenUnitsBN(price, 12),
        ],
        // Bean3Crv Balances
        [
          bean3crvContract.methods.get_balances(),
          (prices) => [
            toTokenUnitsBN(prices[0], 6),
            toTokenUnitsBN(prices[1], 18),
          ],
        ],
        [beanstalk.methods.curveToBDV(utils.parseEther('1')), (r) => toTokenUnitsBN(r, 6)]
      ]
    );
  } else {
    batchCall = batchCall.concat(
      [
        [
          lpContract.methods.balanceOf('0x0000000000000000000000000000000000000000'),
          () => new BigNumber(0),
        ],
        // Curve Bean price
        [
          lpContract.methods.balanceOf('0x0000000000000000000000000000000000000000'),
          () => new BigNumber(0),
        ],
        // Bean3Crv Balances
        [
          lpContract.methods.balanceOf('0x0000000000000000000000000000000000000000'),
          () => [new BigNumber(0), new BigNumber(0)],
        ],
        [
          lpContract.methods.balanceOf('0x0000000000000000000000000000000000000000'),
          () => new BigNumber(1),
        ],
      ]
    );
  }

  return makeBatchedPromises(batch, batchCall);
};

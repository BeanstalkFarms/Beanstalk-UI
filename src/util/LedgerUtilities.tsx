import BigNumber from 'bignumber.js'
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
} from '../constants'
import {
  account,
  beanstalkContractReadOnly,
  initializing,
  pairContractReadOnly,
  tokenContractReadOnly,
  toTokenUnitsBN,
  web3
} from './index'

  /* Client is responsible for calling execute() */
export const createLedgerBatch = () => (
  new web3.BatchRequest()
)

const makeBatchedPromises = (batch, promisesAndResultHandlers) => {
  const batchedPromises = promisesAndResultHandlers.map(methodAndHandler => (
    new Promise((resolve, reject) => {
      batch.add(methodAndHandler[0].call.request({}, 'latest', (error, result) => {
        if (result !== undefined)
          resolve(methodAndHandler[1](result))
        else
          reject(error)
      }))
    })
  ))
  return Promise.all(batchedPromises)
}

const identityResult = (result) => ( result )
const bigNumberResult = (result) => ( new BigNumber(result) )
const tokenResult = (token) => (
  result => toTokenUnitsBN(new BigNumber(result), token.decimals)
)

export async function getEtherBalance() {
  return tokenResult(ETH)(await web3.eth.getBalance(account))
}

export async function getBlockTimestamp(blockNumber) {
  await initializing
  return (await web3.eth.getBlock(blockNumber)).timestamp
}

  /* Batched Getters */
export const getAccountBalances = async (batch) => {
  const bean = tokenContractReadOnly(BEAN)
  const lp = tokenContractReadOnly(UNI_V2_ETH_BEAN_LP)
  const beanstalk = beanstalkContractReadOnly()

  return makeBatchedPromises(batch, [
    [bean.methods.allowance(account, UNISWAP_V2_ROUTER), bigNumberResult],
    [bean.methods.allowance(account, BEANSTALK.addr), bigNumberResult],
    [lp.methods.allowance(account, BEANSTALK.addr), bigNumberResult],
    [beanstalk.methods.balanceOfEth(account), tokenResult(ETH)],
    [bean.methods.balanceOf(account), tokenResult(BEAN)],
    [lp.methods.balanceOf(account), tokenResult(UNI_V2_ETH_BEAN_LP)],
    [beanstalk.methods.balanceOfSeeds(account), tokenResult(BEANSTALK)],
    [beanstalk.methods.balanceOfStalk(account), tokenResult(STALK)],
    [beanstalk.methods.lockedUntil(account), bigNumberResult],
    [beanstalk.methods.balanceOfFarmableBeans(account), tokenResult(BEANSTALK)],
    [beanstalk.methods.balanceOfFarmableStalk(account), tokenResult(STALK)],
    [beanstalk.methods.balanceOfGrownStalk(account), tokenResult(STALK)],
    [beanstalk.methods.balanceOfRoots(account), bigNumberResult],
  ])
}
/* last balanceOfIncreaseStalk is balanceOfGrownStalk once transitioned */

export const getTotalBalances = async (batch) => {
  const bean = tokenContractReadOnly(BEAN)
  const lp = tokenContractReadOnly(UNI_V2_ETH_BEAN_LP)
  const beanstalk = beanstalkContractReadOnly()

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
      stringWeather => ({
        didSowBelowMin: stringWeather.didSowBelowMin,
        didSowFaster: stringWeather.didSowFaster,
        lastDSoil: tokenResult(BEAN)(stringWeather.lastDSoil),
        lastSoilPercent: bigNumberResult(stringWeather.lastSoilPercent),
        lastSowTime: bigNumberResult(stringWeather.lastSowTime),
        nextSowTime: bigNumberResult(stringWeather.nextSowTime),
        startSoil: tokenResult(BEAN)(stringWeather.startSoil),
        weather: bigNumberResult(stringWeather.yield),
      })
    ],
    [
      beanstalk.methods.rain(),
      stringRain => ({
        raining: stringRain.raining,
        rainStart: bigNumberResult(stringRain.start),
      })
    ],
    [
      beanstalk.methods.time(),
      time => ({
        season: bigNumberResult(time.current),
        start: bigNumberResult(time.start),
        period: bigNumberResult(time.period),
        timestamp: bigNumberResult(time.timestamp),
      })
    ],
    [bean.methods.balanceOf(DEVELOPMENT_BUDGET), tokenResult(BEAN)],
    [bean.methods.balanceOf(MARKETING_BUDGET), tokenResult(BEAN)],
  ])
}

  /* TODO: batch BIP detail ledger reads */
export const getBips = async () => {
  const beanstalk = beanstalkContractReadOnly()
  const numberOfBips = bigNumberResult(await beanstalk.methods.numberOfBips().call())
  var bips = []
  for (var i = new BigNumber(0); i.isLessThan(numberOfBips); i = i.plus(1)) {
    const bip = await beanstalk.methods.bip(i.toString()).call()
    const bipRoots = (
      bip.endTotalRoots.toString() === '0'
        ? await beanstalk.methods.rootsFor(i.toString()).call()
        : bip.roots
    )
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
      active: false
    }
    bips.push(bipDict)
  }

  let hasActiveBIP = false
  const activeBips = await beanstalk.methods.activeBips().call()
  activeBips.forEach(id => {
    hasActiveBIP = true
    bips[parseInt(id)].active = true
  })
  return [bips, hasActiveBIP]
}

export const getPrices = async (batch) => {
  const beanstalk = beanstalkContractReadOnly()
  const referenceLPContract = pairContractReadOnly(UNI_V2_USDC_ETH_LP)
  const lpContract = pairContractReadOnly(UNI_V2_ETH_BEAN_LP)

  return makeBatchedPromises(batch, [
    [
      referenceLPContract.methods.getReserves(),
      reserves => [bigNumberResult(reserves._reserve0), bigNumberResult(reserves._reserve1)]
    ],
    [
      lpContract.methods.getReserves(),
      reserves => [bigNumberResult(reserves._reserve0), bigNumberResult(reserves._reserve1)]
    ],
    [lpContract.methods.token0(), identityResult],
    [
      beanstalk.methods.getTWAPPrices(),
      prices => [toTokenUnitsBN(prices[0], 18), toTokenUnitsBN(prices[1], 18)]
    ],
  ])
}

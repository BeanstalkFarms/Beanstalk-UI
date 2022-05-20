import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactDOM from 'react-dom';
import BigNumber from 'bignumber.js';
import { EventData } from 'web3-eth-contract';

import {
  updateBeanstalkBeanAllowance,
  updateBeanstalkLPAllowance,
  updateUniswapBeanAllowance,
  updateBeanstalkUSDCAllowance,
  updateBeanstalkCurveAllowance,
  updateBeanstalkBeanlusdAllowance,
} from 'state/allowances/actions';
import { setUserBalance } from 'state/userBalance/actions';
import { setTotalBalance } from 'state/totalBalance/actions';
import { setSeason } from 'state/season/actions';
import { setWeather } from 'state/weather/actions';
import { setPrices } from 'state/prices/actions';
import { setBeansPerSeason } from 'state/beansPerSeason/actions';
import {
  setInitialized,
  setMetamaskFailure,
  setLastCross,
  setBips,
  setHasActiveBIP,
  setFundraisers,
  setHasActiveFundraiser,
  setContractEvents,
} from 'state/general/actions';
import { lastCrossQuery, apyQuery, farmableMonthTotalQuery } from 'graph/index';
import { AppState } from 'state';
import { BASE_SLIPPAGE, BEAN, BEAN_TO_SEEDS, BEAN_TO_STALK, CURVE, SupportedToken, UNI_V2_ETH_BEAN_LP, WETH } from 'constants/index';
import {
  addRewardedCrates,
  createLedgerBatch,
  getAccountBalances,
  getBips,
  getFundraisers,
  getEtherBalance,
  // getUSDCBalance,
  getPrices,
  getTotalBalances,
  initialize,
  initializeCallback,
  initializeEventListener,
  parseWithdrawals,
  parsePlots,
  toBaseUnitBN,
  toTokenUnitsBN,
  account,
  getEthPrices,
  getPriceArray,
  getVotes,
  benchmarkStart,
  benchmarkEnd,
} from 'util/index';
import { updateBeanPools } from 'state/v2/bean/pools/actions';
import { BeanEthUniswapPool } from 'constants/v2/pools';
import { updateSiloAssets, updateUserTokenBalances } from 'state/v2/farmer/silo/actions';
import { Bean } from 'constants/tokensv2';
import { BeanEthUniswapLP } from 'constants/v2/tokens';
import { UserBalanceState } from './reducer';

type EventParsingParameters = [
  season: AppState['season']['season'],
  harvestableIndex: AppState['weather']['harvestableIndex'],
  farmableBeanBalance: AppState['userBalance']['farmableBeanBalance'],
  grownStalkBalance: AppState['userBalance']['grownStalkBalance'],
  claimableEthBalance: AppState['userBalance']['claimableEthBalance'],
  beanClaimableBalance: AppState['userBalance']['beanClaimableBalance'],
  beanReserve: AppState['prices']['beanReserve'],
  ethReserve: AppState['prices']['ethReserve'],
]

type AsyncReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => Promise<infer U> ? U :
  T extends (...args: any) => infer U ? U :
  any
;

type TokenReserveTuple = [
  beanReserve: AppState['prices']['beanReserve'],
  ethReserve:  AppState['prices']['ethReserve']
];

/**
 *
 */
function lpReservesForTokenReserves(
  tokenReserves: TokenReserveTuple,
  token0: SupportedToken['addr']
) : [
  beanReserve: BigNumber,
  ethReserve: BigNumber,
  rawBeanReserve: BigNumber,
  rawEthReserve: BigNumber
] {
  const rawBeanReserve =
    token0 === BEAN.addr ? tokenReserves[0] : tokenReserves[1];
  const rawEthReserve =
    token0 !== BEAN.addr ? tokenReserves[0] : tokenReserves[1];
  const beanReserve = toTokenUnitsBN(rawBeanReserve, BEAN.decimals);
  const ethReserve = toTokenUnitsBN(rawEthReserve, WETH.decimals);

  return [beanReserve, ethReserve, rawBeanReserve, rawEthReserve];
}

/**
 * A React component that returns nothing but handle loading of data
 * and passage of that data into Redux.
 */
export default function Updater() {
  const zeroBN = new BigNumber(0);
  const dispatch = useDispatch();

  // Global state
  const userBalance = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
  const season = useSelector<AppState, AppState['season']>(
    (state) => state.season
  );
  const weather = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );
  const prices = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  // Parameters used between
  const eventParsingParametersRef = useRef([
    season.season,
    weather.harvestableIndex,
    userBalance.farmableBeanBalance,
    userBalance.grownStalkBalance,
    userBalance.claimableEthBalance,
    userBalance.beanClaimableBalance,
    prices.beanReserve,
    prices.ethReserve,
  ] as const); // 'as const' forces this into a tuple instead of array

  useEffect(() => {
    // -- Processors

    /**
     *
     */
    function processAccountBalances(
      accountBalances: AsyncReturnType<typeof getAccountBalances>,
      ethBalance: BigNumber,
      votedBips: Set<any>,
    ) : void {
      const [
        // Allowances
        uniswapBeanAllowance,
        beanstalkBeanAllowance,
        beanstalkLPAllowance,
        beanstalkUSDCAllowance,
        beanstalkCurveAllowance,
        beanstalkBeanlusdAllowance,
        // Balances
        claimableEthBalance, // 6 indexed
        beanBalance,
        lpBalance,
        curveBalance,
        beanlusdBalance,
        seedBalance,
        stalkBalance,
        // @DEPRECATED
        // Leaving this here to prevent reshuffling of numerically-indexed eventParsingParameters.
        // eslint-disable-next-line
        lockedUntil,
        farmableBeanBalance, // 14 indexed
        grownStalkBalance, // 15 indexed
        rootsBalance,
        usdcBalance,
        beanWrappedBalance, // 18 indexed
      ] = accountBalances;

      // V2
      const farmableStalkBalance = farmableBeanBalance.times(BEAN_TO_STALK);
      const activeStalkBalance   = stalkBalance.plus(farmableStalkBalance);
      const farmableSeedBalance  = farmableBeanBalance.times(BEAN_TO_SEEDS);
      dispatch(updateSiloAssets({
        stalk: {
          total:  activeStalkBalance.plus(grownStalkBalance),
          active: activeStalkBalance,
          earned: farmableStalkBalance,
          grown:  grownStalkBalance,
        },
        seeds: {
          total:  seedBalance.plus(farmableSeedBalance),
          active: seedBalance,
          earned: farmableSeedBalance,
          grown:  new BigNumber(0),
        },
        // TODO: roots
        roots: {
          total:  new BigNumber(0),
          active: new BigNumber(0),
          earned: new BigNumber(0),
          grown:  new BigNumber(0),
        }
      }));

      // @DEPRECATED
      // const locked = lockedUntil.isGreaterThanOrEqualTo(currentSeason);
      // const lockedSeasons = lockedUntil.minus(currentSeason);

      // ALLOWANCES:
      // Any contract that transfers ERC-20 tokens on the farmer's behalf needs to be approved to do so.
      // For example, when you deposit Beans, Beanstalk transfers the farmer's circulating Beans to the Beanstalk contract.
      // The farmer needs to approve Beanstalk to do this.
      // Note: Ethereum is NOT an ERC-20 and thus it doesn't require approval. Instead Ethereum is sent as a part of the transaction.
      // You can read more here: https://brogna.medium.com/token-allowance-dc553f7d38b3
      // There are 4 types of allowances each necessary in different cases
      dispatch(updateUniswapBeanAllowance(uniswapBeanAllowance));       // Needed for selling Beans on Uniswap
      dispatch(updateBeanstalkBeanAllowance(beanstalkBeanAllowance));   // Needed for depositing Beans, adding LP + Depositing from Beans or Bean/Eth, sowing in Beanstalk
      dispatch(updateBeanstalkLPAllowance(beanstalkLPAllowance));       // Needed for depositing LP from circulating
      dispatch(updateBeanstalkUSDCAllowance(beanstalkUSDCAllowance));   // Needed for contributing to a fundraiser.
      dispatch(updateBeanstalkCurveAllowance(beanstalkCurveAllowance)); // Needed for interacting with Curve.
      dispatch(updateBeanstalkBeanlusdAllowance(beanstalkBeanlusdAllowance)); // Needed for interacting with Curve.
      dispatch(setUserBalance({
        // Silo
        beanBalance,
        lpBalance,
        curveBalance,
        beanlusdBalance,
        seedBalance,
        stalkBalance,
        farmableBeanBalance,
        grownStalkBalance,
        // Farm / Field
        beanWrappedBalance,
        claimableEthBalance,
        ethBalance,
        // Governance
        votedBips,
        rootsBalance,
        // locked, @DEPRECATED
        // lockedSeasons, @DEPRECATED
        usdcBalance,
      }));
    }

    /**
     *
     */
    function processTotalBalances(
      totalBalances: any[], // FIXME
      bipInfo: AsyncReturnType<typeof getBips>,
      fundraiserInfo: AsyncReturnType<typeof getFundraisers>
    ) {
      const [
        // Silo
        totalBeans,
        totalLP,
        totalCrv3,
        totalBeanlusd,
        totalSeeds,
        totalStalk,
        totalSiloBeans,
        totalSiloLP,
        totalSiloCurve,
        totalSiloBeanlusd,
        totalTransitBeans,
        totalTransitLP,
        totalTransitCurve,
        totalTransitBeanlusd,
        // Field
        soil,
        podIndex,
        harvestableIndex, // 16 indexed
        totalRoots,
        _weather,
        rain,
        _season, // 20 indexed
        // Budgets
        // FIXME: Automate budget beans
        budget0,
        budget1,
        budget2,
        budget3,
        // More
        totalCurveBeans,
        totalBeanlusdBeans,
        withdrawSeasons,
      ] = totalBalances;

      // Calculations
      const totalBudgetBeans = (
        budget0
          .plus(budget1)
          .plus(budget2)
          .plus(budget3)
      );
      const [bips, hasActiveBIP] = bipInfo;
      const [fundraisers, hasActiveFundraiser] = fundraiserInfo;
      const totalPods = podIndex.minus(harvestableIndex);

      // V2
      dispatch(updateBeanPools([
        {
          address: BeanEthUniswapPool.address,
          pool: {
            total: totalLP,
          }
        },
      ]));

      // V1
      // Dispatchers
      dispatch(setTotalBalance({
        totalBeans,
        totalBudgetBeans,
        totalLP,
        totalCurveBeans,
        totalCrv3,
        totalBeanlusdBeans,
        totalBeanlusd,
        totalSiloBeans,
        totalSiloLP,
        totalSiloCurve,
        totalSiloBeanlusd,
        totalTransitBeans,
        totalTransitLP,
        totalTransitCurve,
        totalTransitBeanlusd,
        totalSeeds,
        totalStalk,
        totalPods,
        totalRoots,
        withdrawSeasons,
      }));
      dispatch(setWeather({
        ..._weather,
        ...rain,
        harvestableIndex,
        soil,
      }));
      dispatch(setBips(bips));
      dispatch(setHasActiveBIP(hasActiveBIP));
      dispatch(setFundraisers(fundraisers));
      dispatch(setHasActiveFundraiser(hasActiveFundraiser));
      dispatch(setSeason(_season));

      return _season.season;
    }

    /**
     *
     */
    function processPrices(
      _prices: AsyncReturnType<typeof getPrices>
    ) : TokenReserveTuple {
      const [
        referenceTokenReserves,   // reserves tuple
        tokenReserves,            // reserves tuple
        token0,                   //
        twapPrices,               // prices tuple
        beansToPeg,               //
        lpToPeg,                  //
        curveVirtualPrice,        //
        beanCrv3Price,            //
        beanCrv3Reserve,          //
        curveToBDV,               //
        beanlusdVirtualPrice,     //
        beanlusdPrice,            //
        beanlusdReserve,          //
        beanlusdToBDV,            //
        lusdCrv3Price,            //
        ethPrices,                //
        priceTuple,               //
      ] = _prices;

      // Calculations
      const usdcMultiple = new BigNumber(10).exponentiatedBy(12);
      const [
        beanReserve,    // bignumber with decimals
        ethReserve,     // bignumber with decimals
        rawBeanReserve, // bignumber, no decimals
        rawEthReserve   // bignumber, no decimals
      ] = lpReservesForTokenReserves(
        tokenReserves,
        token0
      );

      // Uniswap:
      // price = (eth/bean)/10^12
      const beanEthPrice = rawEthReserve
        .dividedBy(rawBeanReserve)
        .dividedBy(usdcMultiple);
      const usdcEthPrice = referenceTokenReserves[1]
        .dividedBy(referenceTokenReserves[0])
        .dividedBy(usdcMultiple);
      const beanPrice = beanEthPrice
        .dividedBy(usdcEthPrice);
      const usdcPrice = usdcEthPrice;

      const curveTuple = priceTuple.ps[0];
      const uniTuple = priceTuple.ps[1];
      const beanlusdTuple = priceTuple.ps[priceTuple.ps.length > 2 ? 2 : 1];

      // V2
      dispatch(updateBeanPools([
        {
          address: BeanEthUniswapPool.address,
          pool: {
            price: beanEthPrice,
            reserves: [beanReserve, ethReserve],
            deltaB: toTokenUnitsBN(curveTuple.deltaB, 6), // FIXME: 6 hardcoded
            totalCrosses: new BigNumber(0),               // FIXME: not tracked yet
          }
        },
      ]));

      // V1
      dispatch(setPrices({
        //
        beanPrice,
        usdcPrice,
        beanTWAPPrice: twapPrices[0],
        usdcTWAPPrice: twapPrices[1],
        //
        beanReserve,
        ethReserve,
        //
        beansToPeg,
        lpToPeg,
        //
        curveVirtualPrice,
        beanCrv3Price,
        beanCrv3Reserve: beanCrv3Reserve[0],
        crv3Reserve: beanCrv3Reserve[1],
        curveToBDV,
        //
        beanlusdToBDV,
        beanlusdVirtualPrice,
        beanlusdPrice,
        beanlusdReserve: beanlusdReserve[0],
        lusdReserve: beanlusdReserve[1],
        lusdCrv3Price,
        //
        ethPrices,
        priceTuple: {
          deltaB: toTokenUnitsBN(priceTuple.deltaB, 6),
          liquidity: toTokenUnitsBN(priceTuple.liquidity, 6),
          price: toTokenUnitsBN(priceTuple.price, 6),
        },
        curveTuple: {
          balances: curveTuple.balances,
          deltaB: toTokenUnitsBN(curveTuple.deltaB, 6),
          liquidity: toTokenUnitsBN(curveTuple.liquidity, 6),
          price: toTokenUnitsBN(curveTuple.price, 6),
          pool: curveTuple.pool,
          tokens: curveTuple.tokens,
        },
        uniTuple: {
          balances: uniTuple.balances,
          deltaB: toTokenUnitsBN(uniTuple.deltaB, 6),
          liquidity: toTokenUnitsBN(uniTuple.liquidity, 6),
          price: toTokenUnitsBN(uniTuple.price, 6),
          pool: uniTuple.pool,
          tokens: uniTuple.tokens,
        },
        beanlusdTuple: {
          balances: beanlusdTuple.balances,
          deltaB: toTokenUnitsBN(beanlusdTuple.deltaB, 6),
          liquidity: toTokenUnitsBN(beanlusdTuple.liquidity, 6),
          price: toTokenUnitsBN(beanlusdTuple.price, 6),
          pool: beanlusdTuple.pool,
          tokens: beanlusdTuple.tokens,
        },
      }));

      return [beanReserve, ethReserve];
    }

    /**
     *
     */
    function processEvents(
      events: EventData[],
      eventParsingParameters: EventParsingParameters,
    ) : void {
      const startTime = benchmarkStart('EVENT PROCESSOR');

      // These get piped into redux 1:1 and so need to match
      // the type defined in UserBalanceState.
      let userLPSeedDeposits : UserBalanceState['lpSeedDeposits'] = {};
      let userLPDeposits : UserBalanceState['lpDeposits'] = {};
      let lpWithdrawals : UserBalanceState['lpWithdrawals'] = {};
      let userCurveDeposits : UserBalanceState['curveDeposits'] = {};
      let userCurveBDVDeposits : UserBalanceState['curveBDVDeposits'] = {};
      let curveWithdrawals : UserBalanceState['curveWithdrawals'] = {};
      let userBeanlusdDeposits : UserBalanceState['beanlusdDeposits'] = {};
      let userBeanlusdBDVDeposits : UserBalanceState['beanlusdBDVDeposits'] = {};
      let beanlusdWithdrawals : UserBalanceState['beanlusdWithdrawals'] = {};
      let userPlots : UserBalanceState['plots'] = {};
      let userBeanDeposits : UserBalanceState['beanDeposits'] = {};
      let beanWithdrawals : UserBalanceState['beanWithdrawals'] = {};
      const votedBips : UserBalanceState['votedBips'] = new Set();

      // 1.
      // This object expansion used below is super slow.
      // Let's move to a library like `immutable` or rewrite
      // these to use less expansions.
      // TODO: what's the standard here these days?
      //
      // 2.
      // I've extracted the `EventData` type from web3 library, but
      // each of the events below needs to have defined `returnValues`.
      // TODO: figure out if we should auto-generate these, or write them by hand.
      // If we write by hand what's the best paradigm?
      // See `src/state/marketplace/reducer.ts` for an example I built recently. -SC
      events.forEach((event) => {
        if (event.event === 'BeanDeposit') {
          // `season` is a base-10 numerical string.
          const s = parseInt(event.returnValues.season, 10);
          // numbers on Etherum are always returned as ints,
          // so this conversion turns `returnValues.beans`
          const beans = toTokenUnitsBN(
            new BigNumber(event.returnValues.beans),
            BEAN.decimals
          );
          // Override the bean deposit for season `s`.
          // If a prior deposit exists, add `beans` to that
          // deposit. Otherwise, a new item is created.
          userBeanDeposits = {
            ...userBeanDeposits,
            [s]:
              userBeanDeposits[s] !== undefined
                ? userBeanDeposits[s].plus(beans)
                : beans,
          };
          if (userBeanDeposits[s].isEqualTo(0)) delete userBeanDeposits[s];
        } else if (event.event === 'BeanRemove') {
          // FIXME: define crates contract return value
          event.returnValues.crates.forEach((s, i) => {
            const beans = toTokenUnitsBN(
              event.returnValues.crateBeans[i],
              BEAN.decimals
            );
            userBeanDeposits = {
              ...userBeanDeposits,
              [s]:
                userBeanDeposits[s] !== undefined
                  ? userBeanDeposits[s].minus(beans)
                  : beans,
            };
            if (userBeanDeposits[s].isEqualTo(0)) delete userBeanDeposits[s];
          });
        } else if (event.event === 'BeanWithdraw') {
          const s = parseInt(event.returnValues.season, 10);
          const beans = toTokenUnitsBN(
            new BigNumber(event.returnValues.beans),
            BEAN.decimals
          );
          beanWithdrawals = {
            ...beanWithdrawals,
            [s]:
              beanWithdrawals[s] !== undefined
                ? beanWithdrawals[s].plus(beans)
                : beans,
          };
        } else if (event.event === 'Sow') {
          const s = toTokenUnitsBN(
            new BigNumber(event.returnValues.index),
            BEAN.decimals
          );
          userPlots[s.toString()] = toTokenUnitsBN(
            event.returnValues.pods,
            BEAN.decimals // QUESTION: why is this BEAN.decimals and not PODS? are they the same?
          );
        } else if (event.event === 'PlotTransfer') {
          // The account received a Plot
          if (event.returnValues.to.toLowerCase() === account) {
            const index = toTokenUnitsBN(
              new BigNumber(event.returnValues.id),
              BEAN.decimals
            );
            userPlots[index.toString()] = toTokenUnitsBN(
              event.returnValues.pods,
              BEAN.decimals
            );
          }
          // The account sent a Plot
          else {
            // Numerical "index" of the plot.
            // Absolute, with respect to Pod 0.
            const index = toTokenUnitsBN(
              new BigNumber(event.returnValues.id),
              BEAN.decimals
            );
            // String version of `idx`, used to key
            // objects. This prevents duplicate toString() calls
            // and resolves Typescript errors.
            const indexStr = index.toString();
            // Size of the Plot, in pods
            const pods = toTokenUnitsBN(
              new BigNumber(event.returnValues.pods),
              BEAN.decimals
            );

            let i = 0;
            let found = false;

            // If we've located the plot in a prior event
            if (userPlots[indexStr] !== undefined) {
              // Send partial plot
              if (!pods.isEqualTo(userPlots[indexStr])) {
                const newStartIndex = index.plus(pods);
                userPlots[newStartIndex.toString()] = userPlots[indexStr].minus(pods);
              }
              delete userPlots[indexStr];
            }

            // QUESTION: what's going on here?
            // FIXME: lots of Object.keys calls while the array itself is being
            // modified.
            else {
              while (found === false && i < Object.keys(userPlots).length) {
                const startIndex = new BigNumber(Object.keys(userPlots)[i]);
                const endIndex = new BigNumber(
                  startIndex.plus(userPlots[startIndex.toString()])
                );
                if (startIndex.isLessThanOrEqualTo(index) && endIndex.isGreaterThan(index)) {
                  userPlots[startIndex.toString()] = new BigNumber(index.minus(startIndex));
                  if (!index.isEqualTo(endIndex)) {
                    const s2    = index.plus(pods);
                    if (!s2.isEqualTo(endIndex)) {
                      const s2Str = s2.toString();
                      userPlots[s2Str] = endIndex.minus(s2);
                      if (userPlots[s2Str].isEqualTo(0)) delete userPlots[s2Str];
                    }
                  }
                  found = true;
                }
                i += 1;
              }
            }
          }
        } else if (event.event === 'LPDeposit') {
          const s = parseInt(event.returnValues.season, 10);
          const lp = toTokenUnitsBN(
            new BigNumber(event.returnValues.lp),
            UNI_V2_ETH_BEAN_LP.decimals
          );
          const seeds = toTokenUnitsBN(
            new BigNumber(event.returnValues.seeds),
            BEAN.decimals
          );
          userLPDeposits = {
            ...userLPDeposits,
            [s]:
              userLPDeposits[s] !== undefined ? userLPDeposits[s].plus(lp) : lp,
          };
          userLPSeedDeposits = {
            ...userLPSeedDeposits,
            [s]:
              userLPSeedDeposits[s] !== undefined
                ? userLPSeedDeposits[s].plus(seeds)
                : seeds,
          };
        } else if (event.event === 'LPRemove') {
          event.returnValues.crates.forEach((s, i) => {
            const lp = toTokenUnitsBN(
              event.returnValues.crateLP[i],
              UNI_V2_ETH_BEAN_LP.decimals
            );
            const seeds = userLPSeedDeposits[s]
              .multipliedBy(lp)
              .dividedBy(userLPDeposits[s]);
            userLPDeposits = {
              ...userLPDeposits,
              [s]: userLPDeposits[s].minus(lp),
            };
            userLPSeedDeposits = {
              ...userLPSeedDeposits,
              [s]: userLPSeedDeposits[s].minus(seeds),
            };
            if (userLPDeposits[s].isEqualTo(0)) delete userLPDeposits[s];
            if (userLPSeedDeposits[s].isEqualTo(0)) {
              delete userLPSeedDeposits[s];
            }
          });
        } else if (event.event === 'LPWithdraw') {
          const s = parseInt(event.returnValues.season, 10);
          const lp = toTokenUnitsBN(
            new BigNumber(event.returnValues.lp),
            UNI_V2_ETH_BEAN_LP.decimals
          );
          lpWithdrawals = {
            ...lpWithdrawals,
            [s]:
              lpWithdrawals[s] !== undefined ? lpWithdrawals[s].plus(lp) : lp,
          };
        } else if (event.event === 'Deposit') {
          const s = parseInt(event.returnValues.season, 10);
          const t = event.returnValues.token;
          const lp = toTokenUnitsBN(
            new BigNumber(event.returnValues.amount),
            UNI_V2_ETH_BEAN_LP.decimals
          );
          const bdv = toTokenUnitsBN(
            new BigNumber(event.returnValues.bdv),
            BEAN.decimals
          );
          if (t === CURVE.addr) {
            userCurveDeposits = {
              ...userCurveDeposits,
              [s]:
                userCurveDeposits[s] !== undefined ? userCurveDeposits[s].plus(lp) : lp,
            };
            userCurveBDVDeposits = {
              ...userCurveBDVDeposits,
              [s]:
                userCurveBDVDeposits[s] !== undefined
                  ? userCurveBDVDeposits[s].plus(bdv)
                  : bdv,
            };
          } else {
            userBeanlusdDeposits = {
              ...userBeanlusdDeposits,
              [s]:
                userBeanlusdDeposits[s] !== undefined ? userBeanlusdDeposits[s].plus(lp) : lp,
            };
            userBeanlusdBDVDeposits = {
              ...userBeanlusdBDVDeposits,
              [s]:
                userBeanlusdBDVDeposits[s] !== undefined
                  ? userBeanlusdBDVDeposits[s].plus(bdv)
                  : bdv,
            };
          }
        } else if (event.event === 'RemoveSeason') {
          const s = parseInt(event.returnValues.season, 10);
          const t = event.returnValues.token;
          const lp = toTokenUnitsBN(
            event.returnValues.amount,
            UNI_V2_ETH_BEAN_LP.decimals
          );
          if (t === CURVE.addr) {
            const bdv = userCurveBDVDeposits[s]
              .multipliedBy(lp)
              .dividedBy(userCurveDeposits[s]);
            userCurveDeposits = {
              ...userCurveDeposits,
              [s]: userCurveDeposits[s].minus(lp),
            };
            userCurveBDVDeposits = {
              ...userCurveBDVDeposits,
              [s]: userCurveBDVDeposits[s].minus(bdv),
            };
            if (userCurveDeposits[s].isEqualTo(0)) delete userCurveDeposits[s];
            if (userCurveBDVDeposits[s].isEqualTo(0)) delete userCurveBDVDeposits[s];
          } else {
            const bdv = userBeanlusdBDVDeposits[s]
              .multipliedBy(lp)
              .dividedBy(userBeanlusdBDVDeposits[s]);
            userBeanlusdBDVDeposits = {
              ...userBeanlusdBDVDeposits,
              [s]: userBeanlusdBDVDeposits[s].minus(lp),
            };
            userBeanlusdBDVDeposits = {
              ...userBeanlusdBDVDeposits,
              [s]: userBeanlusdBDVDeposits[s].minus(bdv),
            };
            if (userBeanlusdDeposits[s].isEqualTo(0)) delete userBeanlusdDeposits[s];
            if (userBeanlusdBDVDeposits[s].isEqualTo(0)) delete userBeanlusdBDVDeposits[s];
          }
        } else if (event.event === 'RemoveSeasons') {
          const t = event.returnValues.token;
          event.returnValues.seasons.forEach((s, i) => {
            const lp = toTokenUnitsBN(
              event.returnValues.amounts[i],
              UNI_V2_ETH_BEAN_LP.decimals
            );
            if (t === CURVE.addr) {
              const bdv = userCurveBDVDeposits[s]
                .multipliedBy(lp)
                .dividedBy(userCurveDeposits[s]);
              userCurveDeposits = {
                ...userCurveDeposits,
                [s]: userCurveDeposits[s].minus(lp),
              };
              userCurveBDVDeposits = {
                ...userCurveBDVDeposits,
                [s]: userCurveBDVDeposits[s].minus(bdv),
              };
              if (userCurveDeposits[s].isEqualTo(0)) delete userCurveDeposits[s];
              if (userCurveBDVDeposits[s].isEqualTo(0)) delete userCurveBDVDeposits[s];
            } else {
              const bdv = userBeanlusdBDVDeposits[s]
                .multipliedBy(lp)
                .dividedBy(userBeanlusdDeposits[s]);
              userBeanlusdDeposits = {
                ...userBeanlusdDeposits,
                [s]: userBeanlusdDeposits[s].minus(lp),
              };
              userBeanlusdBDVDeposits = {
                ...userBeanlusdBDVDeposits,
                [s]: userBeanlusdBDVDeposits[s].minus(bdv),
              };
              if (userBeanlusdDeposits[s].isEqualTo(0)) delete userBeanlusdDeposits[s];
              if (userBeanlusdBDVDeposits[s].isEqualTo(0)) delete userBeanlusdBDVDeposits[s];
            }
          });
        } else if (event.event === 'Withdraw') {
          const s = parseInt(event.returnValues.season, 10);
          const t = event.returnValues.token;
          const lp = toTokenUnitsBN(
            new BigNumber(event.returnValues.amount),
            UNI_V2_ETH_BEAN_LP.decimals
          );
          if (t === CURVE.addr) {
            curveWithdrawals = {
              ...curveWithdrawals,
              [s]:
                curveWithdrawals[s] !== undefined ? curveWithdrawals[s].plus(lp) : lp,
            };
          } else {
            beanlusdWithdrawals = {
              ...beanlusdWithdrawals,
              [s]:
                beanlusdWithdrawals[s] !== undefined ? beanlusdWithdrawals[s].plus(lp) : lp,
            };
          }
        } else if (event.event === 'ClaimSeason') {
          const t = event.returnValues.token;
          if (t === CURVE.addr) {
            delete curveWithdrawals[event.returnValues.season];
          } else {
            delete beanlusdWithdrawals[event.returnValues.season];
          }
        } else if (event.event === 'ClaimSeasons') {
          const t = event.returnValues.token;
          if (t === CURVE.addr) {
            event.returnValues.seasons.forEach((s) => {
              delete curveWithdrawals[s];
            });
          } else {
            event.returnValues.seasons.forEach((s) => {
              delete beanlusdWithdrawals[s];
            });
          }
        } else if (event.event === 'Harvest') {
          let beansClaimed = toTokenUnitsBN(
            event.returnValues.beans,
            BEAN.decimals
          );
          let plots = event.returnValues.plots
            .slice()
            .map((p) => toTokenUnitsBN(p, BEAN.decimals));
          plots = plots.sort((a, b) => a.minus(b));

          plots.forEach((index) => {
            if (beansClaimed.isLessThan(userPlots[index])) {
              const partialIndex = beansClaimed.plus(index);
              userPlots = {
                ...userPlots,
                [partialIndex]: userPlots[index].minus(beansClaimed),
              };
            } else {
              beansClaimed = beansClaimed.minus(userPlots[index]);
            }
            delete userPlots[index];
          });
        } else if (event.event === 'BeanClaim') {
          event.returnValues.withdrawals.forEach(
            (s) => delete beanWithdrawals[s]
          );
        } else if (event.event === 'LPClaim') {
          event.returnValues.withdrawals.forEach(
            (s) => delete lpWithdrawals[s]
          );
        } else if (event.event === 'Vote') {
          votedBips.add(event.returnValues.bip);
        } else if (event.event === 'Unvote') {
          votedBips.delete(event.returnValues.bip);
        }
      });
      
      console.log(`[userBalance/updater]: Setting ${events.length} contract events`);

      dispatch(setContractEvents(events));

      // Variables named during conversation with Publius 2/28
      // These are instantaneous values pulled from contract functions
      // that are used for certain calculations during event processing.
      // ---
      // s = season
      // hi = harvestableindex
      // fb = farmable beans
      // gs = grown stalk
      // ce = claiamble ether
      // cb = wrapped beans
      // br = Bean reserve
      // er = ETH reserve
      const [sz, hi, fb, gs, ce, cb, br, er] =
        eventParsingParameters !== undefined
          ? eventParsingParameters
          : eventParsingParametersRef.current;

      // @publius
      const rawBeanDeposits = { ...userBeanDeposits };
      userBeanDeposits = addRewardedCrates(userBeanDeposits, sz, fb);
      const beanDepositsBalance = Object.values(userBeanDeposits).reduce(
        (a, c) => a.plus(c),
        zeroBN
      );
      const lpDepositsBalance = Object.values(userLPDeposits).reduce(
        (a, c) => a.plus(c),
        zeroBN
      );
      const curveDepositsBalance = Object.values(userCurveDeposits).reduce(
        (a, c) => a.plus(c),
        zeroBN
      );
      const beanlusdDepositsBalance = Object.values(userBeanlusdDeposits).reduce(
        (a, c) => a.plus(c),
        zeroBN
      );
      const [podBalance, harvestablePodBalance, plots, harvestablePlots] =
        parsePlots(userPlots, hi);

      //
      const [
        beanTransitBalance,
        beanReceivableBalance,
        userBeanWithdrawals,
        userBeanReceivableCrates,
      ] = parseWithdrawals(beanWithdrawals, sz);
      const [
        lpTransitBalance,
        lpReceivableBalance,
        userLPWithdrawals,
        userLPReceivableCrates,
      ] = parseWithdrawals(lpWithdrawals, sz);
      const [
        curveTransitBalance,
        curveReceivableBalance,
        userCurveWithdrawals,
        userCurveReceivableCrates,
      ] = parseWithdrawals(curveWithdrawals, sz);
      const [
        beanlusdTransitBalance,
        beanlusdReceivableBalance,
        userBeanlusdWithdrawals,
        userBeanlusdReceivableCrates,
      ] = parseWithdrawals(beanlusdWithdrawals, sz);

      //
      const minReceivables = [br, er].map((reserve) =>
        reserve.multipliedBy(BASE_SLIPPAGE).toFixed(0)
      );

      // Build the Claimable struct
      const userBeanReceivableCratesSeasons = Object.keys(userBeanReceivableCrates);
      const claimable = [
        userBeanReceivableCratesSeasons.map((b) => b.toString()),
        Object.keys(userLPReceivableCrates).map((b) => b.toString()),
        Object.keys(harvestablePlots).map((b) =>
          toBaseUnitBN(b, BEAN.decimals).toString()
        ),
        ce.isGreaterThan(0),
        true,
        minReceivables[0],
        minReceivables[1],
      ];

      // vs
      const beanDepositSeasons = Object.keys(userBeanDeposits);
      const lpDepositSeasons   = Object.keys(userLPDeposits);
      dispatch(updateUserTokenBalances({
        // For now we're mapping this explicitly.
        // Later it will be a simple call to the Subgraph
        // with a mapping.
        [Bean.address]: {
          deposited: beanDepositsBalance,
          deposits: beanDepositSeasons.map((s) => ({
            season: new BigNumber(s),
            amount: userBeanDeposits[s],
            bdv: new BigNumber(-1),
            stalk: new BigNumber(-1),
            seeds: new BigNumber(-1),
          })),
          withdrawn: beanTransitBalance,
          withdrawals: userBeanReceivableCratesSeasons.map((s) => ({
            season: new BigNumber(s),
            amount: userBeanReceivableCrates[s],
            bdv: new BigNumber(-1),
            stalk: new BigNumber(-1),
            seeds: new BigNumber(-1),
          }))
        },
        [BeanEthUniswapLP.address]: {
          deposited: lpDepositsBalance,
          deposits: lpDepositSeasons.map((s) => ({
            season: new BigNumber(s),
            amount: userLPDeposits[s],
            bdv: new BigNumber(-1),
            stalk: new BigNumber(-1),
            seeds: new BigNumber(-1),
          })),
        }
      }));

      // vs
      dispatch(setUserBalance({
        // -- Silo
        // Deposits
        // [Seed/BDV deposits]
        // Flow: Silo -> Transit -> Receivable
        beanDeposits: userBeanDeposits,
        beanSiloBalance: beanDepositsBalance,
        beanTransitBalance: beanTransitBalance,
        beanReceivableBalance: beanReceivableBalance,
        beanWithdrawals: userBeanWithdrawals,
        beanReceivableCrates: userBeanReceivableCrates,
        //
        lpDeposits: userLPDeposits,                 // Deposit Map: Season => Token (Bean:ETH LP)
        lpSeedDeposits: userLPSeedDeposits,         // Deposit Map: Season => Seeds
        lpSiloBalance: lpDepositsBalance,           // Sum of `lpDeposits`
        lpWithdrawals: userLPWithdrawals,           // Withdrawal Map: Season => Token (Bean:ETH LP)
        lpTransitBalance: lpTransitBalance,         // Sum of `lpWithdrawals`
        lpReceivableCrates: userLPReceivableCrates, // Claimable Map: Season => Token (Bean:ETH LP)
        lpReceivableBalance: lpReceivableBalance,   // Sum of `lpReceivableCrates`
        // 
        curveDeposits: userCurveDeposits,
        curveBDVDeposits: userCurveBDVDeposits,
        curveSiloBalance: curveDepositsBalance,
        curveTransitBalance: curveTransitBalance,
        curveReceivableBalance: curveReceivableBalance,
        curveWithdrawals: userCurveWithdrawals,
        curveReceivableCrates: userCurveReceivableCrates,
        // 
        beanlusdDeposits: userBeanlusdDeposits,
        beanlusdBDVDeposits: userBeanlusdBDVDeposits,
        beanlusdSiloBalance: beanlusdDepositsBalance,
        beanlusdTransitBalance: beanlusdTransitBalance,
        beanlusdReceivableBalance: beanlusdReceivableBalance,
        beanlusdWithdrawals: userBeanlusdWithdrawals,
        beanlusdReceivableCrates: userBeanlusdReceivableCrates,
        // Farm
        beanClaimableBalance: beanReceivableBalance.plus(
          harvestablePodBalance
        ).plus(cb),
        // Field
        podBalance: podBalance,
        plots: plots,
        harvestablePodBalance: harvestablePodBalance,
        harvestablePlots: harvestablePlots,
        hasClaimable: beanReceivableBalance
          .plus(harvestablePodBalance)
          .plus(lpReceivableBalance)
          .plus(curveReceivableBalance)
          .plus(beanlusdReceivableBalance)
          .plus(cb)
          .plus(ce)
          .isGreaterThan(0),
        claimable: claimable,
        rawBeanDeposits: rawBeanDeposits,
        farmableBeanBalance: fb,
        grownStalkBalance: gs,
      }));

      benchmarkEnd('EVENT PROCESSOR', startTime);
    }

    // -- Updaters

    /**
     *
     */
    async function updateBalancesAndPrices() : Promise<[Function, EventParsingParameters]> {
      const startTime = benchmarkStart('ALL BALANCES');

      // Create a new web3.BatchRequest. Provide this to batched
      // getter functions, which return a single Promise.all()
      // that resolves when the batch is executed and returns
      // values.
      const batch = createLedgerBatch();
      const accountBalancePromises = getAccountBalances(batch);
      const totalBalancePromises = getTotalBalances(batch);
      const pricePromises = getPrices(batch);
      batch.execute();

      const [
        bipInfo,                // 0
        fundraiserInfo,         // 1
        ethBalance,             // 2
        accountBalances,        // 3
        totalBalances,          // 4
        _prices,                // 5
        // usdcBalance,         // 6
        votedBips,              // 7
        ethPrices,              // 8
        priceTuple,             // 9
      ] = await Promise.all([
        getBips(),              // 0
        getFundraisers(),       // 1
        getEtherBalance(),      // 2
        accountBalancePromises, // 3: uses `exec` -> tuple
        totalBalancePromises,   // 4: uses `exec` -> tuple
        pricePromises,          // 5: uses `exec` -> tuplex
        // getUSDCBalance(),    // 6
        getVotes(),             // 7
        getEthPrices(),         // 8
        getPriceArray()         // 9
      ]).catch((err) => {
        console.error('userBalance/updater: updateBalancesAndPrices failed', err);
        throw err;
      }).then((result) => {
        console.log('userBalance/updater: updateBalancesAndPrices returned result', result);
        return result;
      });

      //
      benchmarkEnd('ALL BALANCES', startTime);

      //
      const [
        beanReserve,
        ethReserve
      ] = lpReservesForTokenReserves(
        _prices[1], // tokenReserves
        _prices[2]  // token0
      );

      // Parameters needed to parse events
      const eventParsingParameters : EventParsingParameters = [
        totalBalances[20].season  /* season */,
        totalBalances[16]         /* harvestableIndex */,
        accountBalances[14]       /* farmableBeanBalance */,
        accountBalances[15]       /* grownStalkBalance */,
        accountBalances[6]        /* claimableEthBalance */,
        accountBalances[18],      /* wrappedBeans */
        beanReserve,
        ethReserve,
      ];

      return [
        () => {
          processAccountBalances(
            accountBalances,
            ethBalance,
            votedBips,
          );
          processTotalBalances(
            totalBalances,
            bipInfo,
            fundraiserInfo
          );
          processPrices([
            ..._prices,
            ethPrices,
            priceTuple,
          ]);
        },
        eventParsingParameters,
      ];
    }

    /**
     *
     */
    async function updateTotalBalances() {
      const startTime = benchmarkStart('TOTALS');

      //
      const batch = createLedgerBatch();
      const totalBalancePromises = getTotalBalances(batch);
      batch.execute();

      const [
        bipInfo,
        fundraiserInfo,
        totalBalances
      ] = await Promise.all([
        getBips(),
        getFundraisers(),
        totalBalancePromises,
      ]);

      ReactDOM.unstable_batchedUpdates(() => {
        processTotalBalances(
          totalBalances,
          bipInfo,
          fundraiserInfo
        );
      });

      benchmarkEnd('TOTALS', startTime);
    }

    /**
     *
     */
    async function updatePrices() {
      const startTime = benchmarkStart('PRICES');

      //
      const batch = createLedgerBatch();
      const pricePromises = getPrices(batch);
      batch.execute();

      const [
        _prices,
        ethPrices,
        priceTuple
      ] = await Promise.all([
        pricePromises,
        getEthPrices(),
        getPriceArray(),
      ]);

      ReactDOM.unstable_batchedUpdates(() => {
        processPrices([
          ..._prices,
          ethPrices,
          priceTuple
        ]);
      });

      benchmarkEnd('PRICES', startTime);
    }

    // -- Subgraph queries

    /**
     *
     */
    async function getLastCross() {
      const lastCrossInitializer = await lastCrossQuery();
      dispatch(setLastCross(lastCrossInitializer));
    }

    /**
     *
     */
    async function getAPYs() {
      dispatch(setBeansPerSeason(await apyQuery()));
    }

    /**
     *
     */
    async function getFarmableMonthTotal() {
      dispatch(setBeansPerSeason({
        farmableMonthTotal: await farmableMonthTotalQuery()
      }));
    }

    // -- Start

    /**
     *
     */
    async function start() {
      let startTime = benchmarkStart('*INIT*');

      // Ensures we're connected to a wallet.
      if (await initialize()) {
        benchmarkEnd('*INIT*', startTime);
        startTime = benchmarkStart('**WEBSITE**');

        // After each transaction, run this transaction callback.
        // This refreshes all balances after we complete a txn.
        initializeCallback(async () => {
          const [updateBalanceState] = await updateBalancesAndPrices();
          ReactDOM.unstable_batchedUpdates(() => {
            updateBalanceState();
          });
        });

        //
        const [balanceInitializers, eventInitializer] = await Promise.all([
          //
          updateBalancesAndPrices(),
          // Listen for events on the Beanstalk contract. When a new event occurs:
          // - run `processEvents` with the new event
          // - call `updatePrices` and `updateTotals` to get new info from the contract
          initializeEventListener(processEvents, updatePrices, updateTotalBalances),
        ]);

        //
        ReactDOM.unstable_batchedUpdates(() => {
          const [
            updateBalanceState,
            eventParsingParameters
          ] = balanceInitializers;

          //
          updateBalanceState();
          processEvents(eventInitializer, eventParsingParameters);

          /** */
          dispatch(setInitialized(true));
        });
        
        benchmarkEnd('**WEBSITE**', startTime);
      } else {
        dispatch(setMetamaskFailure(true));
      }
    }

    // -- Run things
    start();
    getLastCross();
    getAPYs();
    getFarmableMonthTotal();

    // eslint-disable-next-line
  }, []);

  return null;
}

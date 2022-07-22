import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactDOM from 'react-dom';
import BigNumber from 'bignumber.js';
import { EventData } from 'web3-eth-contract';
import { Beanstalk, BUDGETS, MulticallResult, UNISWAP_V2_ROUTER } from 'beanstalk-sdk';

import {
  updateBeanstalkBeanAllowance,
  updateBeanstalkLPAllowance,
  updateUniswapBeanAllowance,
  updateBeanstalkUSDCAllowance,
  updateBeanstalkCurveAllowance,
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
import { BASE_SLIPPAGE, BEAN, BEANSTALK, CURVE, ETH, SEEDS, STALK, SupportedToken, UNI_V2_ETH_BEAN_LP, USDC, WETH } from 'constants/index';
import {
  addRewardedCrates,
  createLedgerBatch,
  getBips,
  getFundraisers,
  getEtherBalance,
  // getUSDCBalance,
  getPrices,
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
      accountBalances: MulticallResult,
      ethBalance: BigNumber,
      votedBips: Set<any>,
    ) : void {
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
      dispatch(updateUniswapBeanAllowance(toTokenUnitsBN(accountBalances[BEAN.addr].allowance[`${account},${UNISWAP_V2_ROUTER}`], BEAN.decimals)));       // Needed for selling Beans on Uniswap
      dispatch(updateBeanstalkBeanAllowance(toTokenUnitsBN(accountBalances[BEAN.addr].allowance[`${account},${BEANSTALK}`], BEAN.decimals)));   // Needed for depositing Beans, adding LP + Depositing from Beans or Bean/Eth, sowing in Beanstalk
      dispatch(updateBeanstalkLPAllowance(toTokenUnitsBN(accountBalances[UNI_V2_ETH_BEAN_LP.addr].allowance, UNI_V2_ETH_BEAN_LP.decimals)));       // Needed for depositing LP from circulating
      dispatch(updateBeanstalkUSDCAllowance(toTokenUnitsBN(accountBalances[USDC.addr].allowance, USDC.decimals)));   // Needed for contributing to a fundraiser.
      dispatch(updateBeanstalkCurveAllowance(toTokenUnitsBN(accountBalances[CURVE.addr].allowance, CURVE.decimals))); // Needed for interacting with Curve.
      dispatch(setUserBalance({
        claimableEthBalance: toTokenUnitsBN(accountBalances[BEANSTALK].balanceOfEth, ETH.decimals),
        ethBalance: ethBalance,
        beanBalance: toTokenUnitsBN(accountBalances[BEAN.addr].balanceOf, BEAN.decimals),
        lpBalance: toTokenUnitsBN(accountBalances[UNI_V2_ETH_BEAN_LP.addr].balanceOf, UNI_V2_ETH_BEAN_LP.decimals),
        curveBalance: toTokenUnitsBN(accountBalances[CURVE.addr].balanceOf, CURVE.decimals),
        seedBalance: toTokenUnitsBN(accountBalances[BEANSTALK].balanceOfSeeds, SEEDS.decimals),
        stalkBalance: toTokenUnitsBN(accountBalances[BEANSTALK].balanceOfStalk, STALK.decimals),
        // locked, @DEPRECATED
        // lockedSeasons, @DEPRECATED
        farmableBeanBalance: toTokenUnitsBN(accountBalances[BEANSTALK].balanceOfFarmableBeans, BEAN.decimals),
        grownStalkBalance: toTokenUnitsBN(accountBalances[BEANSTALK].balanceOfGrownStalk, STALK.decimals),
        rootsBalance: accountBalances[BEANSTALK].balanceOfRoots,
        usdcBalance: toTokenUnitsBN(accountBalances[USDC.addr].balanceOf, USDC.decimals),
        beanWrappedBalance: toTokenUnitsBN(accountBalances[BEANSTALK].wrappedBeans, BEAN.decimals),
        //
        votedBips,
      }));
    }

    /**
     * 
     */
    function processTotalBalances(
      totalBalances: MulticallResult,
      bipInfo: AsyncReturnType<typeof getBips>,
      fundraiserInfo: AsyncReturnType<typeof getFundraisers>
    ) {

      // Calculations
      const totalBudgetBeans = new BigNumber(0);
      BUDGETS.forEach((budgetAddress) => {
        totalBudgetBeans.plus(totalBalances[BEAN.addr].balanceOf[budgetAddress]);
      });
      
      const [bips, hasActiveBIP] = bipInfo;
      const [fundraisers, hasActiveFundraiser] = fundraiserInfo;
      const podLine = totalBalances[BEANSTALK].podIndex.minus(totalBalances[BEANSTALK].harvestableIndex);

      // Dispatchers
      // NOTE(funderberker): The naming convention of TotalBalanceState does not match the rest of
      //  the protocol. It should be updated.
      dispatch(setTotalBalance({
        totalBeans: toTokenUnitsBN(totalBalances[BEAN.addr].totalSupply, BEAN.decimals),
        totalBudgetBeans: toTokenUnitsBN(totalBudgetBeans, BEAN.decimals),
        totalLP: toTokenUnitsBN(totalBalances[UNI_V2_ETH_BEAN_LP.addr].totalSupply, UNI_V2_ETH_BEAN_LP.decimals),
        totalCurveBeans: toTokenUnitsBN(totalBalances[BEAN.addr].balanceOf[CURVE.addr], CURVE.decimals),
        totalCrv3: toTokenUnitsBN(totalBalances[CURVE.addr].totalSupply, CURVE.decimals),
        totalSiloBeans: toTokenUnitsBN(totalBalances[BEANSTALK].totalDepositedBeans, BEAN.decimals),
        totalSiloLP: toTokenUnitsBN(totalBalances[BEANSTALK].totalDepositedLP, UNI_V2_ETH_BEAN_LP.decimals),
        totalSiloCurve: toTokenUnitsBN(totalBalances[BEANSTALK].getTotalDeposited, CURVE.decimals), // Will need to use argument key after more generalized pools are incorporated.
        totalTransitBeans: toTokenUnitsBN(totalBalances[BEANSTALK].totalWithdrawnBeans, BEAN.decimals),
        totalTransitLP: toTokenUnitsBN(totalBalances[BEANSTALK].totalWithdrawnLP, UNI_V2_ETH_BEAN_LP.decimals),
        totalTransitCurve: toTokenUnitsBN(totalBalances[BEANSTALK].getTotalWithdrawn, CURVE.decimals), // Will need to use argument key after more generalized pools are incorporated.
        totalSeeds: toTokenUnitsBN(totalBalances[BEANSTALK].totalSeeds, SEEDS.decimals),
        totalStalk: toTokenUnitsBN(totalBalances[BEANSTALK].totalStalk, STALK.decimals),
        totalPods: toTokenUnitsBN(podLine, BEAN.decimals),
        totalRoots: toTokenUnitsBN(totalBalances[BEANSTALK].totalRoots, SEEDS.decimals),
        withdrawSeasons: totalBalances[BEANSTALK].withdrawnSeasons,
      }));
      dispatch(setWeather({
        ...totalBalances[BEANSTALK].weather,
        ...totalBalances[BEANSTALK].rain,
        harvestableIndex: toTokenUnitsBN(totalBalances[BEANSTALK].harvestableIndex, BEAN.decimals),
        soil: toTokenUnitsBN(totalBalances[BEANSTALK].soil, BEAN.decimals)
      }));
      dispatch(setBips(bips));
      dispatch(setHasActiveBIP(hasActiveBIP));
      dispatch(setFundraisers(fundraisers));
      dispatch(setHasActiveFundraiser(hasActiveFundraiser));
      dispatch(setSeason({ season: totalBalances[BEANSTALK].season }));

      return totalBalances[BEANSTALK].season;
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
        ethPrices,                //
        priceTuple,               //
      ] = _prices;

      // Calculations
      const usdcMultiple = new BigNumber(10).exponentiatedBy(12);
      const [
        beanReserve,
        ethReserve,
        rawBeanReserve,
        rawEthReserve
      ] = lpReservesForTokenReserves(
        tokenReserves,
        token0
      );
      const beanEthPrice = rawEthReserve
        .dividedBy(rawBeanReserve)
        .dividedBy(usdcMultiple);
      const usdcEthPrice = referenceTokenReserves[1]
        .dividedBy(referenceTokenReserves[0])
        .dividedBy(usdcMultiple);
      const beanPrice = beanEthPrice
        .dividedBy(usdcEthPrice);
      const usdcPrice = usdcEthPrice;

      //
      const curveTuple = priceTuple.ps[0];
      const uniTuple = priceTuple.ps[1];

      //
      dispatch(setPrices({
        beanPrice,
        usdcPrice,
        ethReserve,
        beanReserve,
        beansToPeg,
        lpToPeg,
        beanTWAPPrice: twapPrices[0],
        usdcTWAPPrice: twapPrices[1],
        curveVirtualPrice,
        beanCrv3Price,
        beanCrv3Reserve: beanCrv3Reserve[0],
        crv3Reserve: beanCrv3Reserve[1],
        curveToBDV,
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
          if (event.returnValues.to === account) {
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
                if (startIndex.isLessThanOrEqualTo(index) && endIndex.isGreaterThanOrEqualTo(index)) {
                  userPlots[startIndex.toString()] = new BigNumber(index.minus(startIndex));
                  if (!index.isEqualTo(endIndex)) {
                    const s2    = index.plus(pods);
                    const s2Str = s2.toString();
                    userPlots[s2Str] = endIndex.minus(s2);
                    if (userPlots[s2Str].isEqualTo(0)) {
                      delete userPlots[s2Str];
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
          const curve = toTokenUnitsBN(
            new BigNumber(event.returnValues.amount),
            UNI_V2_ETH_BEAN_LP.decimals
          );
          const bdv = toTokenUnitsBN(
            new BigNumber(event.returnValues.bdv),
            BEAN.decimals
          );
          userCurveDeposits = {
            ...userCurveDeposits,
            [s]:
              userCurveDeposits[s] !== undefined ? userCurveDeposits[s].plus(curve) : curve,
          };
          userCurveBDVDeposits = {
            ...userCurveBDVDeposits,
            [s]:
              userCurveBDVDeposits[s] !== undefined
                ? userCurveBDVDeposits[s].plus(bdv)
                : bdv,
          };
        } else if (event.event === 'RemoveSeason') {
          const s = parseInt(event.returnValues.season, 10);
          const curve = toTokenUnitsBN(
            event.returnValues.amount,
            UNI_V2_ETH_BEAN_LP.decimals
          );
          const bdv = userCurveBDVDeposits[s]
            .multipliedBy(curve)
            .dividedBy(userCurveDeposits[s]);
          userCurveDeposits = {
            ...userCurveDeposits,
            [s]: userCurveDeposits[s].minus(curve),
          };
          userCurveBDVDeposits = {
            ...userCurveBDVDeposits,
            [s]: userCurveBDVDeposits[s].minus(bdv),
          };
          if (userCurveDeposits[s].isEqualTo(0)) delete userCurveDeposits[s];
          if (userCurveBDVDeposits[s].isEqualTo(0)) {
            delete userCurveBDVDeposits[s];
          }
        } else if (event.event === 'RemoveSeasons') {
          event.returnValues.seasons.forEach((s, i) => {
            const curve = toTokenUnitsBN(
              event.returnValues.amounts[i],
              UNI_V2_ETH_BEAN_LP.decimals
            );
            const bdv = userCurveBDVDeposits[s]
              .multipliedBy(curve)
              .dividedBy(userCurveDeposits[s]);
            userCurveDeposits = {
              ...userCurveDeposits,
              [s]: userCurveDeposits[s].minus(curve),
            };
            userCurveBDVDeposits = {
              ...userCurveBDVDeposits,
              [s]: userCurveBDVDeposits[s].minus(bdv),
            };
            if (userCurveDeposits[s].isEqualTo(0)) delete userCurveDeposits[s];
            if (userCurveBDVDeposits[s].isEqualTo(0)) {
              delete userCurveBDVDeposits[s];
            }
          });
        } else if (event.event === 'Withdraw') {
          const s = parseInt(event.returnValues.season, 10);
          const curve = toTokenUnitsBN(
            new BigNumber(event.returnValues.amount),
            UNI_V2_ETH_BEAN_LP.decimals
          );
          curveWithdrawals = {
            ...curveWithdrawals,
            [s]:
              curveWithdrawals[s] !== undefined ? curveWithdrawals[s].plus(curve) : curve,
          };
        } else if (event.event === 'ClaimSeason') {
          delete curveWithdrawals[event.returnValues.season];
        } else if (event.event === 'ClaimSeasons') {
          event.returnValues.seasons.forEach((s) => {
            delete curveWithdrawals[s];
          });
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
        } else if (event.event === 'Proposal' || event.event === 'Vote') {
          votedBips.add(event.returnValues.bip);
        } else if (event.event === 'Unvote') {
          votedBips.delete(event.returnValues.bip);
        }
      });
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
      const [s, hi, fb, gs, ce, cb, br, er] =
        eventParsingParameters !== undefined
          ? eventParsingParameters
          : eventParsingParametersRef.current;

      // @publius
      const rawBeanDeposits = { ...userBeanDeposits };
      userBeanDeposits = addRewardedCrates(userBeanDeposits, s, fb);
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
      const [podBalance, harvestablePodBalance, plots, harvestablePlots] =
        parsePlots(userPlots, hi);

      //
      const [
        beanTransitBalance,
        beanReceivableBalance,
        userBeanWithdrawals,
        userBeanReceivableCrates,
      ] = parseWithdrawals(beanWithdrawals, s);
      const [
        lpTransitBalance,
        lpReceivableBalance,
        userLPWithdrawals,
        userLPReceivableCrates,
      ] = parseWithdrawals(lpWithdrawals, s);
      const [
        curveTransitBalance,
        curveReceivableBalance,
        userCurveWithdrawals,
        userCurveReceivableCrates,
      ] = parseWithdrawals(curveWithdrawals, s);
      
      //
      const minReceivables = [br, er].map((reserve) =>
        reserve.multipliedBy(BASE_SLIPPAGE).toFixed(0)
      );

      // Build the Claimable struct
      const claimable = [
        Object.keys(userBeanReceivableCrates).map((b) => b.toString()),
        Object.keys(userLPReceivableCrates).map((b) => b.toString()),
        Object.keys(harvestablePlots).map((b) =>
          toBaseUnitBN(b, BEAN.decimals).toString()
        ),
        ce.isGreaterThan(0),
        true,
        minReceivables[0],
        minReceivables[1],
      ];

      dispatch(setUserBalance({
        beanSiloBalance: beanDepositsBalance,
        podBalance: podBalance,
        harvestablePodBalance: harvestablePodBalance,
        beanTransitBalance: beanTransitBalance,
        beanReceivableBalance: beanReceivableBalance,
        lpTransitBalance: lpTransitBalance,
        lpReceivableBalance: lpReceivableBalance,
        lpSiloBalance: lpDepositsBalance,
        curveTransitBalance: curveTransitBalance,
        curveReceivableBalance: curveReceivableBalance,
        curveSiloBalance: curveDepositsBalance,
        plots: plots,
        harvestablePlots: harvestablePlots,
        beanDeposits: userBeanDeposits,
        lpDeposits: userLPDeposits,
        lpSeedDeposits: userLPSeedDeposits,
        curveDeposits: userCurveDeposits,
        curveBDVDeposits: userCurveBDVDeposits,
        beanWithdrawals: userBeanWithdrawals,
        beanReceivableCrates: userBeanReceivableCrates,
        lpWithdrawals: userLPWithdrawals,
        lpReceivableCrates: userLPReceivableCrates,
        curveWithdrawals: userCurveWithdrawals,
        curveReceivableCrates: userCurveReceivableCrates,
        beanClaimableBalance: beanReceivableBalance.plus(
          harvestablePodBalance
        ).plus(cb),
        hasClaimable: beanReceivableBalance
          .plus(harvestablePodBalance)
          .plus(lpReceivableBalance)
          .plus(curveReceivableBalance)
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

      const beanstalk = new Beanstalk();

      // Create a new web3.BatchRequest. Provide this to batched
      // getter functions, which return a single Promise.all()
      // that resolves when the batch is executed and returns
      // values.
      const batch = createLedgerBatch();
      const accountBalances = await beanstalk.getAccountBalances(account);
      const totalBalances = beanstalk.getTotalBalances();
      const pricePromises = getPrices(batch);
      batch.execute(); 

      const [
        bipInfo,                // 0
        fundraiserInfo,         // 1
        ethBalance,             // 2
        _prices,                // 5
        // usdcBalance,            // 6
        votedBips,              // 7
        ethPrices,              // 8
        priceTuple,             // 9
      ] = await Promise.all([
        getBips(), // 0
        getFundraisers(),       // 1
        getEtherBalance(),      // 2
        pricePromises,          // 5: uses `exec` -> tuple
        // getUSDCBalance(),       // 6
        getVotes(),                // 7
        getEthPrices(),         // 8
        getPriceArray()         // 9
      ]);

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
        totalBalances[BEANSTALK].season,
        totalBalances[BEANSTALK].harvestableIndex,
        toTokenUnitsBN(accountBalances[BEANSTALK].balanceOfFarmableBeans, BEAN.decimals)    /* farmableBeanBalance */,
        toTokenUnitsBN(accountBalances[BEANSTALK].balanceOfGrownStalk, STALK.decimals)      /* grownStalkBalance */,
        toTokenUnitsBN(accountBalances[BEANSTALK].balanceOfEth, ETH.decimals)        /* claimableEthBalance */,
        toTokenUnitsBN(accountBalances[BEANSTALK].wrappedBeans, BEAN.decimals),      /* wrappedBeans */
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
      const beanstalk = new Beanstalk();
      const totalBalances = beanstalk.getTotalBalances();
      batch.execute();

      const [
        bipInfo,
        fundraiserInfo,
      ] = await Promise.all([
        getBips(),
        getFundraisers(),
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

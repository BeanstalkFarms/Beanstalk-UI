import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactDOM from 'react-dom';
import BigNumber from 'bignumber.js';
import {
  updateBeanstalkBeanAllowance,
  updateBeanstalkLPAllowance,
  updateUniswapBeanAllowance,
  updateBeanstalkUSDCAllowance,
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
import { lastCrossQuery, apyQuery } from 'graph/index';
import { AppState } from 'state';
import { BASE_SLIPPAGE, BEAN, UNI_V2_ETH_BEAN_LP, WETH } from 'constants/index';
import {
  addRewardedCrates,
  createLedgerBatch,
  getAccountBalances,
  getBips,
  getFundraisers,
  getEtherBalance,
  getUSDCBalance,
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
} from 'util/index';

export default function Updater() {
  const zeroBN = new BigNumber(0);
  const dispatch = useDispatch();

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

  const eventParsingParametersRef = useRef([]);
  eventParsingParametersRef.current = [
    season.season,
    weather.harvestableIndex,
    userBalance.farmableBeanBalance,
    userBalance.grownStalkBalance,
    userBalance.claimableEthBalance,
    prices.beanReserve,
    prices.ethReserve,
  ];

  const benchmarkStart = (operation) => {
    console.log(`LOADING ${operation}`);
    return Date.now();
  };

  const benchmarkEnd = (operation, startTime) => {
    console.log(
      `LOADED ${operation} (${(Date.now() - startTime) / 1e3} seconds)`
    );
  };

  useEffect(() => {
    function processAccountBalances(
      accountBalances,
      ethBalance,
      lpReserves,
      currentSeason
    ) {
      const [
        uniswapBeanAllowance,
        beanstalkBeanAllowance,
        beanstalkLPAllowance,
        beanstalkUSDCAllowance,
        claimableEthBalance,
        beanBalance,
        lpBalance,
        seedBalance,
        stalkBalance,
        lockedUntil,
        farmableBeanBalance,
        grownStalkBalance,
        rootsBalance,
        usdcBalance,
      ] = accountBalances;
      const locked = lockedUntil.isGreaterThanOrEqualTo(currentSeason);
      const lockedSeasons = lockedUntil.minus(currentSeason);

      dispatch(updateUniswapBeanAllowance(uniswapBeanAllowance));
      dispatch(updateBeanstalkBeanAllowance(beanstalkBeanAllowance));
      dispatch(updateBeanstalkLPAllowance(beanstalkLPAllowance));
      dispatch(updateBeanstalkUSDCAllowance(beanstalkUSDCAllowance));

      dispatch(
        setUserBalance({
          claimableEthBalance,
          ethBalance,
          beanBalance,
          lpBalance,
          seedBalance,
          stalkBalance,
          locked,
          lockedSeasons,
          farmableBeanBalance,
          grownStalkBalance,
          rootsBalance,
          usdcBalance,
        })
      );
    }

    function processTotalBalances(totalBalances, bipInfo, fundraiserInfo) {
      const [
        totalBeans,
        totalLP,
        totalSeeds,
        totalStalk,
        totalSiloBeans,
        totalSiloLP,
        totalTransitBeans,
        totalTransitLP,
        soil,
        podIndex,
        harvestableIndex,
        totalRoots,
        _weather,
        rain,
        _season,
        develpomentBudget,
        marketingBudget,
      ] = totalBalances;
      const totalBudgetBeans = develpomentBudget.plus(marketingBudget);
      const [bips, hasActiveBIP] = bipInfo;
      const [fundraisers, hasActiveFundraiser] = fundraiserInfo;
      const totalPods = podIndex.minus(harvestableIndex);
      dispatch(
        setTotalBalance({
          totalBeans,
          totalBudgetBeans,
          totalLP,
          totalSiloBeans,
          totalSiloLP,
          totalTransitBeans,
          totalTransitLP,
          totalSeeds,
          totalStalk,
          totalPods,
          totalRoots,
        })
      );
      dispatch(
        setWeather({
          ..._weather,
          ...rain,
          harvestableIndex,
          soil,
        })
      );
      dispatch(setBips(bips));
      dispatch(setHasActiveBIP(hasActiveBIP));
      dispatch(setFundraisers(fundraisers));
      dispatch(setHasActiveFundraiser(hasActiveFundraiser));
      dispatch(setSeason(_season));
      return _season.season;
    }

    function lpReservesForTokenReserves(tokenReserves, token0) {
      const rawBeanReserve =
        token0 === BEAN.addr ? tokenReserves[0] : tokenReserves[1];
      const rawEthReserve =
        token0 !== BEAN.addr ? tokenReserves[0] : tokenReserves[1];
      const beanReserve = toTokenUnitsBN(rawBeanReserve, BEAN.decimals);
      const ethReserve = toTokenUnitsBN(rawEthReserve, WETH.decimals);
      return [beanReserve, ethReserve, rawBeanReserve, rawEthReserve];
    }
    function processPrices(_prices) {
      const [
        referenceTokenReserves,
        tokenReserves,
        token0,
        twapPrices,
        beansToPeg,
        lpToPeg,
      ] = _prices;
      const usdcMultiple = new BigNumber(10).exponentiatedBy(12);
      const [beanReserve, ethReserve, rawBeanReserve, rawEthReserve] =
        lpReservesForTokenReserves(tokenReserves, token0);
      const beanEthPrice = rawEthReserve
        .dividedBy(rawBeanReserve)
        .dividedBy(usdcMultiple);
      const usdcEthPrice = referenceTokenReserves[1]
        .dividedBy(referenceTokenReserves[0])
        .dividedBy(usdcMultiple);
      const beanPrice = beanEthPrice.dividedBy(usdcEthPrice);
      const usdcPrice = usdcEthPrice;

      dispatch(
        setPrices({
          beanPrice,
          usdcPrice,
          ethReserve,
          beanReserve,
          beanTWAPPrice: twapPrices[0],
          usdcTWAPPrice: twapPrices[1],
          beansToPeg,
          lpToPeg,
        })
      );
      return [beanReserve, ethReserve];
    }

    async function processEvents(events, eventParsingParameters) {
      const startTime = benchmarkStart('EVENT PROCESSOR');

      let userLPSeedDeposits = {};
      let userLPDeposits = {};
      let lpWithdrawals = {};
      let userPlots = {};
      let userBeanDeposits = {};
      let beanWithdrawals = {};
      const votedBips = new Set();

      events.forEach((event) => {
        if (event.event === 'BeanDeposit') {
          const s = parseInt(event.returnValues.season, 10);
          const beans = toTokenUnitsBN(
            new BigNumber(event.returnValues.beans),
            BEAN.decimals
          );
          userBeanDeposits = {
            ...userBeanDeposits,
            [s]:
              userBeanDeposits[s] !== undefined
                ? userBeanDeposits[s].plus(beans)
                : beans,
          };
          if (userBeanDeposits[s].isEqualTo(0)) delete userBeanDeposits[s];
        } else if (event.event === 'BeanRemove') {
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
          const s = parseInt(event.returnValues.index, 10) / 1e6;
          userPlots[s] = toTokenUnitsBN(event.returnValues.pods, BEAN.decimals);
        } else if (event.event === 'PlotTransfer') {
          if (event.returnValues.to === account) {
            const s = parseInt(event.returnValues.id, 10) / 1e6;
            userPlots[s] = toTokenUnitsBN(
              event.returnValues.pods,
              BEAN.decimals
            );
          } else {
            const s = parseInt(event.returnValues.id, 10) / 1e6;
            const pods = toTokenUnitsBN(event.returnValues.pods, BEAN.decimals);
            let i = 0;
            let found = false;
            if (userPlots[s] !== undefined) {
              if (!pods.isEqualTo(userPlots[s])) {
                const newStartIndex =
                  s + parseInt(event.returnValues.pods, 10) / 1e6;
                userPlots[newStartIndex] = userPlots[s].minus(pods);
              }
              delete userPlots[s];
            } else {
              while (found === false && i < Object.keys(userPlots).length) {
                const startIndex = parseFloat(Object.keys(userPlots)[i]);
                const endIndex = startIndex + parseFloat(userPlots[startIndex]);
                if (startIndex <= s && endIndex >= s) {
                  userPlots[startIndex] = new BigNumber(s - startIndex);
                  if (s !== endIndex) {
                    const s2 = s + parseInt(event.returnValues.pods, 10) / 1e6;
                    userPlots[s2] = new BigNumber(endIndex).minus(
                      new BigNumber(s2)
                    );
                    if (userPlots[s2].isEqualTo(0)) delete userPlots[s2];
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
        } else if (event.event === 'Harvest') {
          let beansClaimed = toTokenUnitsBN(
            event.returnValues.beans,
            BEAN.decimals
          );
          let plots = event.returnValues.plots
            .slice()
            .map((p) => parseInt(p, 10) / 1e6);
          plots = plots.sort((a, b) => a - b);

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

      const [s, hi, fb, gs, ce, br, er] =
        eventParsingParameters !== undefined
          ? eventParsingParameters
          : eventParsingParametersRef.current;

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
      const [podBalance, harvestablePodBalance, plots, harvestablePlots] =
        parsePlots(userPlots, hi);

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
      const minReceivables = [br, er].map((reserve) =>
        reserve.multipliedBy(BASE_SLIPPAGE).toFixed(0)
      );
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

      dispatch(
        setUserBalance({
          beanSiloBalance: beanDepositsBalance,
          podBalance: podBalance,
          harvestablePodBalance: harvestablePodBalance,
          beanTransitBalance: beanTransitBalance,
          beanReceivableBalance: beanReceivableBalance,
          lpTransitBalance: lpTransitBalance,
          lpReceivableBalance: lpReceivableBalance,
          lpSiloBalance: lpDepositsBalance,
          plots: plots,
          harvestablePlots: harvestablePlots,
          beanDeposits: userBeanDeposits,
          lpDeposits: userLPDeposits,
          lpSeedDeposits: userLPSeedDeposits,
          beanWithdrawals: userBeanWithdrawals,
          beanReceivableCrates: userBeanReceivableCrates,
          lpWithdrawals: userLPWithdrawals,
          lpReceivableCrates: userLPReceivableCrates,
          votedBips: votedBips,
          beanClaimableBalance: beanReceivableBalance.plus(
            harvestablePodBalance
          ),
          hasClaimable: beanReceivableBalance
            .plus(harvestablePodBalance)
            .plus(lpReceivableBalance)
            .plus(ce)
            .isGreaterThan(0),
          claimable: claimable,
          rawBeanDeposits: rawBeanDeposits,
          farmableBeanBalance: fb,
          grownStalkBalance: gs,
        })
      );

      benchmarkEnd('EVENT PROCESSOR', startTime);
    }

    async function updateTotalBalances() {
      const startTime = benchmarkStart('ALL BALANCES');
      const batch = createLedgerBatch();
      const totalBalancePromises = getTotalBalances(batch);
      const pricePromises = getPrices(batch);
      batch.execute();

      const [bipInfo, fundraiserInfo, totalBalances, _prices] =
        await Promise.all([
          getBips(),
          getFundraisers(),
          totalBalancePromises,
          pricePromises,
        ]);
      benchmarkEnd('ALL BALANCES', startTime);
      const [beanReserve, ethReserve] = lpReservesForTokenReserves(
        _prices[1],
        _prices[2]
      ); /* tokenReserves, token0 */
      const eventParsingParameters = [
        totalBalances[14].season /* season */,
        totalBalances[10] /* harvestableIndex */,
        beanReserve,
        ethReserve,
      ];

      return [
        () => {
          processTotalBalances(totalBalances, bipInfo, fundraiserInfo);
        },
        eventParsingParameters,
      ];
    }

    async function updateAllBalances() {
      const startTime = benchmarkStart('ALL BALANCES');
      const batch = createLedgerBatch();
      const accountBalancePromises = getAccountBalances(batch);
      const totalBalancePromises = getTotalBalances(batch);
      const pricePromises = getPrices(batch);
      batch.execute();

      const [
        bipInfo,
        fundraiserInfo,
        ethBalance,
        accountBalances,
        totalBalances,
        _prices,
        usdcBalance,
      ] = await Promise.all([
        getBips(),
        getFundraisers(),
        getEtherBalance(),
        accountBalancePromises,
        totalBalancePromises,
        pricePromises,
        getUSDCBalance(),
      ]);
      benchmarkEnd('ALL BALANCES', startTime);
      const [beanReserve, ethReserve] = lpReservesForTokenReserves(
        _prices[1],
        _prices[2]
      ); /* tokenReserves, token0 */
      const eventParsingParameters = [
        totalBalances[14].season /* season */,
        totalBalances[10] /* harvestableIndex */,
        accountBalances[10] /* farmableBeanBalance */,
        accountBalances[11] /* grownStalkBalance */,
        accountBalances[4] /* claimableEthBalance */,
        beanReserve,
        ethReserve,
      ];

      return [
        () => {
          const currentSeason = processTotalBalances(
            totalBalances,
            bipInfo,
            fundraiserInfo
          );
          const lpReserves = processPrices(_prices);
          processAccountBalances(
            accountBalances,
            ethBalance,
            lpReserves,
            currentSeason,
            usdcBalance
          );
        },
        eventParsingParameters,
      ];
    }

    async function updateTotals() {
      const startTime = benchmarkStart('TOTALS');
      const batch = createLedgerBatch();
      const totalBalancePromises = getTotalBalances(batch);

      batch.execute();

      const [bipInfo, fundraiserInfo, totalBalances] = await Promise.all([
        getBips(),
        getFundraisers(),
        totalBalancePromises,
      ]);
      ReactDOM.unstable_batchedUpdates(() => {
        processTotalBalances(totalBalances, bipInfo, fundraiserInfo);
      });
      benchmarkEnd('TOTALS', startTime);
    }

    async function updatePrices() {
      const startTime = benchmarkStart('PRICES');
      const batch = createLedgerBatch();
      const pricePromises = getPrices(batch);
      batch.execute();

      const _prices = await pricePromises;
      ReactDOM.unstable_batchedUpdates(() => {
        processPrices(_prices);
      });
      benchmarkEnd('PRICES', startTime);
    }

    async function getLastCross() {
      const lastCrossInitializer = await lastCrossQuery();
      dispatch(setLastCross(lastCrossInitializer));
    }

    async function getAPYs() {
      dispatch(setBeansPerSeason(await apyQuery()));
    }

    async function start() {
      let startTime = benchmarkStart('*INIT*');
      let updateBalances: Function;
      let dispatchMetamaskError: Function | null;
      if (await initialize()) {
        // Metamask is connected, updateAllBalances
        updateBalances = updateAllBalances;
      } else {
        // Metamask is not connected, only updateTotalBalances
        updateBalances = updateTotalBalances;
        dispatchMetamaskError = () => dispatch(setMetamaskFailure(2));
      }

      benchmarkEnd('*INIT*', startTime);
      startTime = benchmarkStart('**WEBSITE**');

      initializeCallback(async () => {
        const [updateBalanceState] = await updateBalances();
        ReactDOM.unstable_batchedUpdates(() => {
          updateBalanceState();
        });
      });
      const [balanceInitializers, eventInitializer] = await Promise.all([
        updateBalances(),
        initializeEventListener(processEvents, updatePrices, updateTotals),
      ]);
      ReactDOM.unstable_batchedUpdates(() => {
        const [updateBalanceState, eventParsingParameters] =
          balanceInitializers;
        updateBalanceState();
        processEvents(eventInitializer, eventParsingParameters);
        dispatch(setInitialized(true));
        if (dispatchMetamaskError) dispatchMetamaskError();
      });
      benchmarkEnd('**WEBSITE**', startTime);
    }

    start();
    getLastCross();
    getAPYs();

    // eslint-disable-next-line
  }, []);

  return null;
}

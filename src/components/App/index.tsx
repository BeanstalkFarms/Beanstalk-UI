/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import BigNumber from 'bignumber.js';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CssBaseline, Box } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import store from 'state';
import {
  updateBeanstalkBeanAllowance,
  updateBeanstalkLPAllowance,
  updateUniswapBeanAllowance
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
  setContractEvents
} from 'state/general/actions';
import { AppState } from 'state';
import BeanLogo from '../../img/bean-logo.svg';
import { lastCrossQuery, apyQuery } from '../../graph';
import { BASE_SLIPPAGE, BEAN, UNI_V2_ETH_BEAN_LP, WETH } from '../../constants';
import {
  addRewardedCrates,
  createLedgerBatch,
  getAccountBalances,
  getBips,
  getEtherBalance,
  getPrices,
  getTotalBalances,
  initialize,
  initializeCallback,
  initializeEventListener,
  parseWithdrawals,
  parsePlots,
  poolForLP,
  toBaseUnitBN,
  toTokenUnitsBN,
  account
} from '../../util';
import About from '../About';
import Analytics from '../Analytics';
import Field from '../Field';
import MetamasklessModule from './MetamasklessModule';
import { NavigationBar } from '../Navigation';
import NFTs from '../NFT';
import Silo from '../Silo';
import theme from './theme';
import Trade from '../Trade';

import Main from './main.tsx';
import './App.css';

export default function App() {
  const initBN = new BigNumber(-1);
  const zeroBN = new BigNumber(0);
  const dispatch = useDispatch();
  const userBalance = useSelector<AppState, AppState['userBalance']>(
    state => state.userBalance
  );
  const totalBalance = useSelector<AppState, AppState['totalBalance']>(
    state => state.totalBalance
  );
  const season = useSelector<AppState, AppState['season']>(
    state => state.season
  );
  const weather = useSelector<AppState, AppState['weather']>(
    state => state.weather
  );
  const prices = useSelector<AppState, AppState['prices']>(
    state => state.prices
  );
  const beansPerSeason = useSelector<AppState, AppState['beansPerSeason']>(
    state => state.beansPerSeason
  );

  const {
    initialized,
    metamaskFailure,
    lastCross,
    bips,
    hasActiveBIP,
    contractEvents
  } = useSelector<AppState, AppState['general']>(state => state.general);

  const defaultNavMapping = [
    {
      path: 'silo',
      title: 'SILO',
      component: () => (
        <Silo
          key="silo"
          poolForLPRatio={poolForLPRatio}
          season={season.season}
          totalLP={totalBalance.totalLP}
          updateExpectedPrice={updateExpectedPrice}
          {...prices}
          {...totalBalance}
          {...userBalance}
          beansPerSeason={beansPerSeason}
        />
      )
    },
    {
      path: 'field',
      title: 'FIELD',
      component: () => (
        <Field
          key="field"
          beanReserve={prices.beanReserve}
          ethReserve={prices.ethReserve}
          unripenedPods={totalBalance.totalPods}
          updateExpectedPrice={updateExpectedPrice}
          {...prices}
          {...userBalance}
          {...weather}
          beansPerSeason={beansPerSeason}
        />
      )
    },
    {
      path: 'trade',
      title: 'TRADE',
      component: () => (
        <Trade
          key="trade"
          lastCross={lastCross}
          poolForLPRatio={poolForLPRatio}
          {...prices}
          {...totalBalance}
          {...userBalance}
        />
      )
    },
    {
      path: 'nft',
      title: 'BeaNFTs',
      component: () => (
        <NFTs
          key="beanft"
          {...prices}
          {...totalBalance}
          {...season}
          {...userBalance}
          {...weather}
        />
      )
    },
    {
      path: 'analytics',
      title: 'ANALYTICS',
      component: () => (
        <Analytics
          key="analytics"
          bips={bips}
          hasActiveBIP={hasActiveBIP}
          poolForLPRatio={poolForLPRatio}
          userRoots={userBalance.rootsBalance}
          votedBips={userBalance.votedBips}
          beanReserve={prices.beanReserve}
          ethReserve={prices.ethReserve}
          unripenedPods={totalBalance.totalPods}
          updateExpectedPrice={updateExpectedPrice}
          {...prices}
          {...totalBalance}
          {...season}
          {...userBalance}
          {...weather}
        />
      )
    },
    {
      path: 'about',
      title: 'ABOUT',
      component: () => <About key="about" />
    }
  ];

  BigNumber.set({ EXPONENTIAL_AT: [-12, 20] });

  const updateExpectedPrice = (sellEth: BigNumber, buyBeans: BigNumber) => {
    const endPrice = prices.ethReserve
      .plus(sellEth)
      .dividedBy(prices.beanReserve.minus(buyBeans))
      .dividedBy(prices.usdcPrice);
    return prices.beanPrice.plus(endPrice).dividedBy(2);
  };

  const poolForLPRatio = (amount: BigNumber) => {
    if (amount.isLessThanOrEqualTo(0)) return [zeroBN, zeroBN];
    return poolForLP(
      amount,
      prices.beanReserve,
      prices.ethReserve,
      totalBalance.totalLP
    );
  };

  const eventParsingParametersRef = useRef([]);
  eventParsingParametersRef.current = [
    season.season,
    weather.harvestableIndex,
    userBalance.farmableBeanBalance,
    userBalance.farmableStalkBalance,
    userBalance.grownStalkBalance,
    userBalance.claimableEthBalance,
    prices.beanReserve,
    prices.ethReserve
  ];

  const benchmarkStart = operation => {
    console.log(`LOADING ${operation}`);
    return Date.now();
  };
  const benchmarkEnd = (operation, startTime) => {
    console.log(
      `LOADED ${operation} (${(Date.now() - startTime) / 1e3} seconds)`
    );
  };

  useEffect(() => {
    const zeroBN = new BigNumber(0);

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
        claimableEthBalance,
        beanBalance,
        lpBalance,
        seedBalance,
        stalkBalance,
        lockedUntil,
        farmableBeanBalance,
        farmableStalkBalance,
        grownStalkBalance,
        rootsBalance
      ] = accountBalances;
      const locked = lockedUntil.isGreaterThanOrEqualTo(currentSeason);
      const lockedSeasons = lockedUntil.minus(currentSeason);
      const minReceivables = lpReserves.map(reserve =>
        reserve.multipliedBy(BASE_SLIPPAGE).toFixed(0)
      );

      dispatch(updateUniswapBeanAllowance(uniswapBeanAllowance));
      dispatch(updateBeanstalkBeanAllowance(beanstalkBeanAllowance));
      dispatch(updateBeanstalkLPAllowance(beanstalkLPAllowance));

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
          farmableStalkBalance,
          grownStalkBalance,
          rootsBalance,
          claimable: [
            userBalance.claimable[0],
            userBalance.claimable[1],
            userBalance.claimable[2],
            userBalance.claimable[3],
            userBalance.claimable[4],
            minReceivables[0],
            minReceivables[1]
          ]
        })
      );
    }

    function processTotalBalances(totalBalances, bipInfo) {
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
        weather,
        rain,
        season,
        develpomentBudget,
        marketingBudget
      ] = totalBalances;
      const totalBudgetBeans = develpomentBudget.plus(marketingBudget);
      const [bips, hasActiveBIP] = bipInfo;
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
          totalRoots
        })
      );
      dispatch(
        setWeather({
          ...weather,
          ...rain,
          harvestableIndex,
          soil
        })
      );
      dispatch(setBips(bips));
      dispatch(setHasActiveBIP(hasActiveBIP));
      dispatch(setSeason(season));
      return season.season;
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
    function processPrices(prices) {
      const [referenceTokenReserves, tokenReserves, token0, twapPrices] =
        prices;
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
          usdcTWAPPrice: twapPrices[1]
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

      events.forEach(event => {
        if (event.event === 'BeanDeposit') {
          const s = parseInt(event.returnValues.season);
          const beans = toTokenUnitsBN(
            new BigNumber(event.returnValues.beans),
            BEAN.decimals
          );
          userBeanDeposits = {
            ...userBeanDeposits,
            [s]:
              userBeanDeposits[s] !== undefined
                ? userBeanDeposits[s].plus(beans)
                : beans
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
                  : beans
            };
            if (userBeanDeposits[s].isEqualTo(0)) delete userBeanDeposits[s];
          });
        } else if (event.event === 'BeanWithdraw') {
          const s = parseInt(event.returnValues.season);
          const beans = toTokenUnitsBN(
            new BigNumber(event.returnValues.beans),
            BEAN.decimals
          );
          beanWithdrawals = {
            ...beanWithdrawals,
            [s]:
              beanWithdrawals[s] !== undefined
                ? beanWithdrawals[s].plus(beans)
                : beans
          };
        } else if (event.event === 'Sow') {
          const s = parseInt(event.returnValues.index) / 1e6;
          userPlots[s] = toTokenUnitsBN(event.returnValues.pods, BEAN.decimals);
        } else if (event.event === 'PlotTransfer') {
          if (event.returnValues.to === account) {
            const s = parseInt(event.returnValues.id) / 1e6;
            userPlots[s] = toTokenUnitsBN(
              event.returnValues.pods,
              BEAN.decimals
            );
          } else {
            const s = parseInt(event.returnValues.id) / 1e6;
            const pods = toTokenUnitsBN(event.returnValues.pods, BEAN.decimals);
            let i = 0;
            let found = false;
            if (userPlots[s] !== undefined) {
              if (!pods.isEqualTo(userPlots[s])) {
                const newStartIndex =
                  s + parseInt(event.returnValues.pods) / 1e6;
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
                    const s2 = s + parseInt(event.returnValues.pods) / 1e6;
                    userPlots[s2] = new BigNumber(endIndex).minus(
                      new BigNumber(s2)
                    );
                    if (userPlots[s2].isEqualTo(0)) delete userPlots[s2];
                  }
                  found = true;
                }
                i++;
              }
            }
          }
        } else if (event.event === 'LPDeposit') {
          const s = parseInt(event.returnValues.season);
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
              userLPDeposits[s] !== undefined ? userLPDeposits[s].plus(lp) : lp
          };
          userLPSeedDeposits = {
            ...userLPSeedDeposits,
            [s]:
              userLPSeedDeposits[s] !== undefined
                ? userLPSeedDeposits[s].plus(seeds)
                : seeds
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
              [s]: userLPDeposits[s].minus(lp)
            };
            userLPSeedDeposits = {
              ...userLPSeedDeposits,
              [s]: userLPSeedDeposits[s].minus(seeds)
            };
            if (userLPDeposits[s].isEqualTo(0)) delete userLPDeposits[s];
            if (userLPSeedDeposits[s].isEqualTo(0))
              delete userLPSeedDeposits[s];
          });
        } else if (event.event === 'LPWithdraw') {
          const s = parseInt(event.returnValues.season);
          const lp = toTokenUnitsBN(
            new BigNumber(event.returnValues.lp),
            UNI_V2_ETH_BEAN_LP.decimals
          );
          lpWithdrawals = {
            ...lpWithdrawals,
            [s]: lpWithdrawals[s] !== undefined ? lpWithdrawals[s].plus(lp) : lp
          };
        } else if (event.event === 'Harvest') {
          let beansClaimed = toTokenUnitsBN(
            event.returnValues.beans,
            BEAN.decimals
          );
          let plots = event.returnValues.plots
            .slice()
            .map(p => parseInt(p) / 1e6);
          plots = plots.sort((a, b) => a - b);

          plots.forEach(index => {
            if (beansClaimed.isLessThan(userPlots[index])) {
              const partialIndex = beansClaimed.plus(index);
              userPlots = {
                ...userPlots,
                [partialIndex]: userPlots[index].minus(beansClaimed)
              };
            } else {
              beansClaimed = beansClaimed.minus(userPlots[index]);
            }
            delete userPlots[index];
          });
        } else if (event.event === 'BeanClaim') {
          event.returnValues.withdrawals.forEach(
            s => delete beanWithdrawals[s]
          );
        } else if (event.event === 'LPClaim') {
          event.returnValues.withdrawals.forEach(s => delete lpWithdrawals[s]);
        } else if (event.event === 'Proposal' || event.event === 'Vote') {
          votedBips.add(event.returnValues.bip);
        } else if (event.event === 'Unvote') {
          votedBips.delete(event.returnValues.bip);
        }
      });
      dispatch(setContractEvents(events));

      const [s, hi, fb, fs, gs, ce, br, er] =
        eventParsingParameters !== undefined
          ? eventParsingParameters
          : eventParsingParametersRef.current;

      const rawBeanDeposits = { ...userBeanDeposits };
      userBeanDeposits = addRewardedCrates(userBeanDeposits, s, fb, fs);
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
        userBeanReceivableCrates
      ] = parseWithdrawals(beanWithdrawals, s);
      const [
        lpTransitBalance,
        lpReceivableBalance,
        userLPWithdrawals,
        userLPReceivableCrates
      ] = parseWithdrawals(lpWithdrawals, s);
      const minReceivables = [br, er].map(reserve =>
        reserve.multipliedBy(BASE_SLIPPAGE).toFixed(0)
      );
      const claimable = [
        Object.keys(userBeanReceivableCrates).map(b => b.toString()),
        Object.keys(userLPReceivableCrates).map(b => b.toString()),
        Object.keys(harvestablePlots).map(b =>
          toBaseUnitBN(b, BEAN.decimals).toString()
        ),
        ce.isGreaterThan(0),
        true,
        minReceivables[0],
        minReceivables[1]
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
          farmableStalkBalance: fs,
          grownStalkBalance: gs
        })
      );

      benchmarkEnd('EVENT PROCESSOR', startTime);
    }

    async function updateAllBalances() {
      const startTime = benchmarkStart('ALL BALANCES');
      const batch = createLedgerBatch();
      const accountBalancePromises = getAccountBalances(batch);
      const totalBalancePromises = getTotalBalances(batch);
      const pricePromises = getPrices(batch);
      batch.execute();

      const [bipInfo, ethBalance, accountBalances, totalBalances, prices] =
        await Promise.all([
          getBips(),
          getEtherBalance(),
          accountBalancePromises,
          totalBalancePromises,
          pricePromises
        ]);
      benchmarkEnd('ALL BALANCES', startTime);

      const [beanReserve, ethReserve] = lpReservesForTokenReserves(
        prices[1],
        prices[2]
      ); /* tokenReserves, token0 */
      const eventParsingParameters = [
        totalBalances[14].season /* season */,
        totalBalances[10] /* harvestableIndex */,
        accountBalances[9] /* farmableBeanBalance */,
        accountBalances[10] /* farmableStalkBalance */,
        accountBalances[11] /* grownStalkBalance */,
        accountBalances[3] /* claimableEthBalance */,
        beanReserve,
        ethReserve
      ];

      return [
        () => {
          const currentSeason = processTotalBalances(totalBalances, bipInfo);
          const lpReserves = processPrices(prices);
          processAccountBalances(
            accountBalances,
            ethBalance,
            lpReserves,
            currentSeason
          );
        },
        eventParsingParameters
      ];
    }

    async function updateTotals() {
      const startTime = benchmarkStart('TOTALS');
      const batch = createLedgerBatch();
      const totalBalancePromises = getTotalBalances(batch);

      batch.execute();

      const [bipInfo, totalBalances] = await Promise.all([
        getBips(),
        totalBalancePromises
      ]);
      ReactDOM.unstable_batchedUpdates(() => {
        processTotalBalances(totalBalances, bipInfo);
      });
      benchmarkEnd('TOTALS', startTime);
    }

    async function updatePrices() {
      const startTime = benchmarkStart('PRICES');
      const batch = createLedgerBatch();
      const pricePromises = getPrices(batch);
      batch.execute();

      const prices = await pricePromises;
      ReactDOM.unstable_batchedUpdates(() => {
        processPrices(prices);
      });
      benchmarkEnd('PRICES', startTime);
    }

    async function start() {
      let startTime = benchmarkStart('*INIT*');
      if (await initialize()) {
        benchmarkEnd('*INIT*', startTime);
        startTime = benchmarkStart('**WEBSITE**');

        initializeCallback(async () => {
          const [updateBalanceState] = await updateAllBalances();
          ReactDOM.unstable_batchedUpdates(() => {
            updateBalanceState();
          });
        });
        const [
          balanceInitializers,
          eventInitializer,
          lastCrossInitializer,
          apyInitializer
        ] = await Promise.all([
          updateAllBalances(),
          initializeEventListener(
            processEvents,
            updatePrices,
            updateTotals,
            setContractEvents
          ),
          lastCrossQuery(),
          apyQuery()
        ]);
        ReactDOM.unstable_batchedUpdates(() => {
          const [updateBalanceState, eventParsingParameters] =
            balanceInitializers;
          updateBalanceState();
          dispatch(setLastCross(lastCrossInitializer));
          dispatch(setBeansPerSeason(apyInitializer));
          processEvents(eventInitializer, eventParsingParameters);
          dispatch(setInitialized(true));
        });
        benchmarkEnd('**WEBSITE**', startTime);
      } else {
        dispatch(setMetamaskFailure(true));
      }
    }

    start();

    // eslint-disable-next-line
  }, []);

  let app;
  if (metamaskFailure > -1) {
    app = <MetamasklessModule />;
  } else if (!initialized) {
    const { innerHeight: height } = window;
    app = (
      <Box style={{ height: height - 60, overflow: 'hidden' }}>
        <Box style={{ marginTop: height / 2 - 125 }}>
          <Box className="Loading-logo">
            <img
              style={{ verticalAlign: 'middle' }}
              height="250px"
              src={BeanLogo}
              alt="bean.money"
            />
          </Box>
        </Box>
      </Box>
    );
  } else {
    const navMapping = [...defaultNavMapping];
    if (hasActiveBIP) {
      navMapping.splice(5, 0, {
        path: 'governance',
        title: 'BIPs',
        component: () => <></>
      });
    }
    app = (
      <>
        <NavigationBar
          links={navMapping}
          beanPrice={prices.beanPrice}
          events={contractEvents}
          poolForLPRatio={poolForLPRatio}
          {...totalBalance}
          {...userBalance}
        />
        {navMapping.map((navItem, index) => (
          <Box key={index}>{navItem.component()}</Box>
        ))}
      </>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box className="App">
        <Main>{app}</Main>
      </Box>
    </ThemeProvider>
  );
}

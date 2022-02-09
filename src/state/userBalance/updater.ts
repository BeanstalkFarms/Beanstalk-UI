import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactDOM from 'react-dom';
import BigNumber from 'bignumber.js';
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
  getEthPrices,
  votes,
} from 'util/index';
import { UserBalanceState } from './reducer';

//
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
    userBalance.beanClaimableBalance,
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
    //
    function processAccountBalances(
      accountBalances,
      ethBalance,
      lpReserves,
      currentSeason,
      votedBips
    ) {
      const [
        uniswapBeanAllowance,
        beanstalkBeanAllowance,
        beanstalkLPAllowance,
        beanstalkUSDCAllowance,
        beanstalkCurveAllowance,
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
        beanWrappedBalance,
      ] = accountBalances;
      const locked = lockedUntil.isGreaterThanOrEqualTo(currentSeason);
      const lockedSeasons = lockedUntil.minus(currentSeason);

      dispatch(updateUniswapBeanAllowance(uniswapBeanAllowance));
      dispatch(updateBeanstalkBeanAllowance(beanstalkBeanAllowance));
      dispatch(updateBeanstalkLPAllowance(beanstalkLPAllowance));
      dispatch(updateBeanstalkUSDCAllowance(beanstalkUSDCAllowance));
      dispatch(updateBeanstalkCurveAllowance(beanstalkCurveAllowance));
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
          beanWrappedBalance,
          votedBips,
        })
      );
    }

    //
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
        // Automate this:
        budget0,
        budget1,
        budget2,
        budget3,
        totalCurveBeans,
        withdrawSeasons,
      ] = totalBalances;
      const totalBudgetBeans = budget0.plus(budget1).plus(budget2).plus(budget3);
      const [bips, hasActiveBIP] = bipInfo;
      const [fundraisers, hasActiveFundraiser] = fundraiserInfo;
      const totalPods = podIndex.minus(harvestableIndex);
      dispatch(
        setTotalBalance({
          totalBeans,
          totalBudgetBeans,
          totalCurveBeans,
          totalLP,
          totalSiloBeans,
          totalSiloLP,
          totalTransitBeans,
          totalTransitLP,
          totalSeeds,
          totalStalk,
          totalPods,
          totalRoots,
          withdrawSeasons,
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

    //
    function lpReservesForTokenReserves(tokenReserves, token0) {
      const rawBeanReserve =
        token0 === BEAN.addr ? tokenReserves[0] : tokenReserves[1];
      const rawEthReserve =
        token0 !== BEAN.addr ? tokenReserves[0] : tokenReserves[1];
      const beanReserve = toTokenUnitsBN(rawBeanReserve, BEAN.decimals);
      const ethReserve = toTokenUnitsBN(rawEthReserve, WETH.decimals);
      return [beanReserve, ethReserve, rawBeanReserve, rawEthReserve];
    }

    //
    function processPrices(_prices) {
      const [
        referenceTokenReserves,
        tokenReserves,
        token0,
        twapPrices,
        beansToPeg,
        lpToPeg,
        curveVirtualPrice,
        beanCrv3Price,
        beanCrv3Reserve,
        ethPrices,
      ] = _prices;

      //
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

      //
      dispatch(
        setPrices({
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
          ethPrices,
        })
      );
      return [beanReserve, ethReserve];
    }

    async function processEvents(events, eventParsingParameters) {
      const startTime = benchmarkStart('EVENT PROCESSOR');

      let userLPSeedDeposits = {};
      let userLPDeposits = {};
      let lpWithdrawals = {};
      let userPlots : UserBalanceState['plots'] = {};
      let userBeanDeposits = {};
      let beanWithdrawals = {};
      const votedBips = new Set();

      /** New events from Plot Marketplace:
       * ListingCreated
       * ListingCancelled
       * BuyOfferCreated
       * BuyOfferCancelled
       * BuyOfferAccepted
      */
      // TODO: PlotTransfer will now need to update listing data too
      // will need to split up listings into two listings if listing not fully purchased
      // set state accordingly and adjust index
      // TODO: all event handling logic needs to exist not filtered on address for individual listings and buy offers
      // but full marketplace since, should not be filtering based on address for these events but grabbing them all
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
          const s = toTokenUnitsBN(
            new BigNumber(event.returnValues.index),
            BEAN.decimals
          );
          userPlots[s] = toTokenUnitsBN(
            event.returnValues.pods,
            BEAN.decimals // QUESTION: why is this BEAN.decimals and not PODS? are they the same?
          );
        } else if (event.event === 'PlotTransfer') {
          if (event.returnValues.to === account) {
            const s = toTokenUnitsBN(
              new BigNumber(event.returnValues.id),
              BEAN.decimals
            );
            userPlots[s] = toTokenUnitsBN(
              event.returnValues.pods,
              BEAN.decimals
            );
          } else {
            const s = toTokenUnitsBN(
              new BigNumber(event.returnValues.id),
              BEAN.decimals
            );
            const pods = toTokenUnitsBN(
              new BigNumber(event.returnValues.pods),
              BEAN.decimals
            );
            let i = 0;
            let found = false;
            if (userPlots[s] !== undefined) {
              if (!pods.isEqualTo(userPlots[s])) {
                const newStartIndex = s.plus(pods);
                userPlots[newStartIndex] = userPlots[s].minus(pods);
              }
              delete userPlots[s];
            } else {
              while (found === false && i < Object.keys(userPlots).length) {
                const startIndex = new BigNumber(Object.keys(userPlots)[i]);
                const endIndex = new BigNumber(
                  startIndex.plus(userPlots[startIndex])
                );
                if (startIndex.isLessThanOrEqualTo(s) && endIndex.isGreaterThanOrEqualTo(s)) {
                  userPlots[startIndex] = new BigNumber(s.minus(startIndex));
                  if (!s.isEqualTo(endIndex)) {
                    const s2 = s.plus(pods);
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

      const [s, hi, fb, gs, ce, cb, br, er] =
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
          beanClaimableBalance: beanReceivableBalance.plus(
            harvestablePodBalance
          ).plus(cb),
          hasClaimable: beanReceivableBalance
            .plus(harvestablePodBalance)
            .plus(lpReceivableBalance)
            .plus(cb)
            .plus(ce)
            .isGreaterThan(0),
          claimable: claimable,
          rawBeanDeposits: rawBeanDeposits,
          farmableBeanBalance: fb,
          grownStalkBalance: gs,
          // listings: listings,
          // buyOffers: buyOffers,
        })
      );

      benchmarkEnd('EVENT PROCESSOR', startTime);
    }

    async function updateAllBalances() : Promise<[Function, any]> {
      const startTime = benchmarkStart('ALL BALANCES');
      const batch = createLedgerBatch();
      const accountBalancePromises = getAccountBalances(batch);
      const totalBalancePromises = getTotalBalances(batch);
      const pricePromises = getPrices(batch);
      batch.execute();

      const [bipInfo, fundraiserInfo, ethBalance, accountBalances, totalBalances, _prices, usdcBalance, votedBips] =
        await Promise.all([
          getBips(),
          getFundraisers(),
          getEtherBalance(),
          accountBalancePromises,
          totalBalancePromises,
          pricePromises,
          // getListings()
          getUSDCBalance(),
          votes(),
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
        accountBalances[14], /* wrappedBeans */
        beanReserve,
        ethReserve,
      ];
      const ethPrices = await getEthPrices();

      return [
        () => {
          const currentSeason = processTotalBalances(totalBalances, bipInfo, fundraiserInfo);
          const lpReserves = processPrices([
            ..._prices,
            ethPrices,
          ]);
          processAccountBalances(
            accountBalances,
            ethBalance,
            lpReserves,
            currentSeason,
            votedBips,
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
      const ethPrices = await getEthPrices();
      ReactDOM.unstable_batchedUpdates(() => {
        processPrices([..._prices, ethPrices]);
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
      if (await initialize()) {
        benchmarkEnd('*INIT*', startTime);
        startTime = benchmarkStart('**WEBSITE**');

        // After each transaction, run this transaction callback.
        // This refreshes all balances after we complete a txn.
        initializeCallback(async () => {
          const [updateBalanceState] = await updateAllBalances();
          ReactDOM.unstable_batchedUpdates(() => {
            updateBalanceState();
          });
        });

        //
        const [balanceInitializers, eventInitializer] = await Promise.all([
          updateAllBalances(),
          initializeEventListener(processEvents, updatePrices, updateTotals),
        ]);

        //
        ReactDOM.unstable_batchedUpdates(() => {
          const [updateBalanceState, eventParsingParameters] =
            balanceInitializers;
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

    start();
    getLastCross();
    getAPYs();

    // eslint-disable-next-line
  }, []);

  return null;
}

import React from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { APY_CALCULATION } from 'constants/index';
import {
  BaseModule,
  Grid,
  HeaderLabelList,
  siloStrings,
  // HeaderLabelList,
} from 'components/Common';
import { displayBN, getAPYs, poolForLP } from 'util/index';
import TokenDataTable from './TokenDataTable';

export default function Silo() {
  // Hide APY's for now since they are misleading
  // Fetch and calculate APYs
  const totalBalance = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );
  const { farmableMonth } = useSelector<AppState, AppState['beansPerSeason']>(
    (state) => state.beansPerSeason
  );
  const { season } = useSelector<AppState, AppState['season']>(
    (state) => state.season
  );

  const userBalance = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  // on each render, grab APY array
  const apys = getAPYs(
    farmableMonth,
    parseFloat(totalBalance.totalStalk),
    parseFloat(totalBalance.totalSeeds)
  );

  const [beanAPY, lpAPY] = apys;

  const {
    lpBalance,
    lpSiloBalance,
    lpTransitBalance,
    lpReceivableBalance,
    curveBalance,
    curveSiloBalance,
    curveTransitBalance,
    curveReceivableBalance,
    beanBalance,
    beanReceivableBalance,
    beanTransitBalance,
    beanWrappedBalance,
    beanSiloBalance,
    harvestablePodBalance
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const {
    totalLP,
    totalCrv3,
  } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  const {
    beanReserve,
    ethReserve,
    beanPrice,
    beanCrv3Price,
    curveVirtualPrice,
    beanCrv3Reserve,
    crv3Reserve,
  } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  // START LOGIC COPIED FROM BALANCES/index
  // TODO: combine logic into one file
  const poolForLPRatio = (amount: BigNumber) => poolForLP(amount, beanReserve, ethReserve, totalLP);
  const poolForCurveRatio = (amount: BigNumber) => poolForLP(amount, beanCrv3Reserve, crv3Reserve, totalCrv3);

  const userBeans = beanBalance
    .plus(beanSiloBalance)
    .plus(beanTransitBalance)
    .plus(beanWrappedBalance)
    .plus(beanReceivableBalance)
    .plus(harvestablePodBalance);
  const userLP = lpBalance
    .plus(lpSiloBalance)
    .plus(lpTransitBalance)
    .plus(lpReceivableBalance);
  const userCurve = curveBalance
    .plus(curveSiloBalance)
    .plus(curveTransitBalance)
    .plus(curveReceivableBalance);

  // Get pool tuples
  const userBeansAndEth = poolForLPRatio(userLP);
  const userBeansAndCrv3 = poolForCurveRatio(userCurve);

  const userLPBeans = userBeansAndEth[0].multipliedBy(2);
  const userCurveBalanceInDollars = (
    userBeansAndCrv3[0]
    .multipliedBy(beanCrv3Price)
    .plus(userBeansAndCrv3[1])
  ).multipliedBy(curveVirtualPrice);

  const userBalanceInDollars = userBeans
    .plus(userLPBeans)
    .multipliedBy(beanPrice)
    .plus(userCurveBalanceInDollars);
  // END LOGIC COPIED FROM BALANCES/index

  const metrics = (
    <>
      <Grid item lg={4} sm={12}>
        {/* Metrics card: TVL/30-day */}
        <HeaderLabelList
          title={[
            'TVL',
            '30 Day Interest',
          ]}
          value={[
            <span>
              ${displayBN(totalBalance.totalSiloBeans)}
            </span>,
            <span>
              {displayBN(new BigNumber(604622))}
            </span>,
          ]}
          description={[
            <span>
              {siloStrings.tvlDescription}
            </span>,
            <span>
              {siloStrings.thirtyDayInterestDescription}
            </span>,
          ]}
          balanceDescription={[
            '',
            '',
          ]}
          width="100%"
        />
      </Grid>
      <Grid item lg={4} sm={12}>
        {/* Metrics card: APYs */}
        <HeaderLabelList
          title={[
            'My Deposits',
            'Farmable Beans',
          ]}
          value={[
            <span>
              {/* TODO: calculate total deposits */}
              ${displayBN(userBalanceInDollars)}
            </span>,
            <span>
              {displayBN(userBalance.farmableBeanBalance.div(10))}
            </span>,
          ]}
          // calculate bean APY
          // value={[
          //   `${beanAPY.toFixed(0) === '0' ? '–' : beanAPY.toFixed(0)}%`,
          //   `${lpAPY.toFixed(0) === '0' ? '–' : lpAPY.toFixed(0)}%`,
          // ]}
          description={[
            <span>
              {siloStrings.myDepositsDescription}
            </span>,
            <span>
              {siloStrings.farmableBeansDescription}
            </span>,
          ]}
          balanceDescription={[
            `${beanAPY.toFixed(2)}%`,
            `${lpAPY.toFixed(2)}%`,
          ]}
          width="100%"
        />
      </Grid>

      <Grid item lg={4} sm={12}>
        {/* Metrics card: My Balances */}
        <HeaderLabelList
          // containerTitle="Balances"
          title={[
            'My Ownership',
            'My Stalk',
          ]}
          value={[
            <span>
              {displayBN(userBalance.stalkBalance.dividedBy(totalBalance.totalStalk.div(10)))}%
            </span>,
            <span>
              {displayBN(userBalance.grownStalkBalance.div(10))}
            </span>,
          ]}
          description={[
            <span>
              {siloStrings.myOwnershipDescription}
            </span>,
            <span>
              {siloStrings.farmableStalkDescription}
            </span>,
          ]}
          balanceDescription={[
            '',
            '',
          ]}
          width="100%"
        />
      </Grid>
      {/* Select a silo */}
    </>
  );

  return (
    <>
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={10} lg={8} container spacing={2}>
          {metrics}
        </Grid>
        <Grid item xs={12} sm={10} lg={8} container justifyContent="center">
          <BaseModule
            section={0}
            sectionTitles={[]}
            sectionTitlesDescription={[]}
            showButton={false}
            normalBox={false}
            // removeBackground
            style={{ display: 'block', width: '100%' }}
            margin="0"
          >
            <TokenDataTable />
          </BaseModule>
        </Grid>

      </Grid>
      {/* Silos */}
      {/* <HeaderLabelList
        description={[
          siloStrings.withdrawSeasons,
          siloStrings.decreaseSeasons,
        ]}
        balanceDescription={[
          `${withdrawSeasons} Seasons`,
          `${nextDecrease} Seasons`,
        ]}
        title={[
          'Withdraw Seasons',
          'Next Decrease',
        ]}
        value={[
          `${withdrawSeasons}`,
          `${nextDecrease}`,
        ]}
      /> */}
      {/* <TabbedSilo /> */}
      {/* <Grid container justifyContent="center" style={{ margin: '20px 0px' }}>
        <ContentDropdown
          description={siloStrings.siloDescription.replace('{0}', withdrawSeasons)}
          descriptionTitle="What is the Silo?"
          descriptionLinks={descriptionLinks}
        />
      </Grid> */}
    </>
  );
}

Silo.defaultProps = {
  margin: '-10px 0 -20px 0',
};

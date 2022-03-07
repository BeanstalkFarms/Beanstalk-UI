import React from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import {
  BaseModule,
  Grid,
  HeaderLabelList,
  siloStrings,
} from 'components/Common';
import { displayBN, displayFullBN, poolForLP } from 'util/index';
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
  const userBalance = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

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

  const farmableMonthTotal = new BigNumber(farmableMonth).multipliedBy(720);

  const metrics = (
    <>
      <Grid item lg={4} sm={12}>
        {/*
          * Metrics card: TVL/30-day */}
        <HeaderLabelList
          title={[
            'TVL',
            '30 Day Interest',
          ]}
          value={[
            <span>${displayBN(totalBalance.totalSiloBeans.times(beanPrice))}</span>,
            <span>{displayBN(farmableMonthTotal)}</span>,
          ]}
          balanceDescription={[
            `${displayFullBN(totalBalance.totalSiloBeans)}`,
            displayFullBN(farmableMonthTotal),
          ]}
          description={[
            <span>{siloStrings.tvlDescription}</span>,
            <span>{siloStrings.thirtyDayInterestDescription} Beans</span>,
          ]}
          width="100%"
        />
      </Grid>
      <Grid item lg={4} sm={12}>
        {/*
          * Metrics card: APYs */}
        <HeaderLabelList
          title={[
            'My Deposits',
            'Farmable Beans',
          ]}
          value={[
            <span>${displayBN(userBalanceInDollars)}</span>,
            <span>{displayBN(userBalance.farmableBeanBalance)}</span>,
          ]}
          balanceDescription={[
            `$${userBalanceInDollars.toFixed(2)}`,
            `${displayFullBN(userBalance.farmableBeanBalance)} Beans`,
          ]}
          description={[
            <span>{siloStrings.myDepositsDescription}</span>,
            <span>{siloStrings.farmableBeansDescription}</span>,
          ]}
          width="100%"
        />
      </Grid>
      <Grid item lg={4} sm={12}>
        {/* Metrics card: My Balances */}
        <HeaderLabelList
          title={[
            'My Ownership',
            'Farmable Stalk',
          ]}
          value={[
            <span>
              {displayBN(
                userBalance.stalkBalance
                  .dividedBy(totalBalance.totalStalk)
                  .multipliedBy(100)
              )}%
            </span>,
            <span>{displayBN(userBalance.grownStalkBalance)}</span>,
          ]}
          balanceDescription={[
            '',
            '',
          ]}
          description={[
            <span>
              {siloStrings.myOwnershipDescription}
            </span>,
            <span>
              {siloStrings.farmableStalkDescription}
            </span>,
          ]}
          width="100%"
        />
      </Grid>
    </>
  );

  return (
    <Grid container justifyContent="center" style={{ marginTop: 20 }}>
      <Grid item xs={12} sm={10} lg={8} container justifyContent="center" spacing={2}>
        {metrics}
      </Grid>
      <Grid item xs={12} sm={10} lg={8} container justifyContent="center">
        <BaseModule
          section={0}
          sectionTitles={[]}
          sectionTitlesDescription={[]}
          showButton={false}
          normalBox={false}
          style={{
            display: 'block',
            width: '100%',
            // Override padding. This allows the <TokenDataTable />
            // to extend all the way to the edges of the screen and control
            // its own sizing accordingly.
            padding: 0,
          }}
          margin="0"
          marginTop="30px"
        >
          <TokenDataTable />
        </BaseModule>
      </Grid>
    </Grid>
  );
}

Silo.defaultProps = {
  margin: '-10px 0 -20px 0',
};

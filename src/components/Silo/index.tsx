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
import { displayBN, displayFullBN } from 'util/index';
import TokenDataTable from './TokenDataTable';
import { sumDeposits, getUserSiloDepositsUSD, getTotalSiloDepositsUSD } from '../../util/SiloUtilities';

export default function Silo() {
  // Hide APY's for now since they are misleading
  // Fetch and calculate APYs
  const { farmableMonthTotal } = useSelector<AppState, AppState['beansPerSeason']>(
    (state) => state.beansPerSeason
  );
  const userBalance = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
  const totalBalance = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );
  const priceState = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  //
  const userSiloDepositsByTokenUSD = getUserSiloDepositsUSD(userBalance, priceState, totalBalance);
  const totalSiloDepositsByTokenUSD = getTotalSiloDepositsUSD(priceState, totalBalance);
  const sumUserSiloDepositsUSD = sumDeposits(userSiloDepositsByTokenUSD);
  const tvl = sumDeposits(totalSiloDepositsByTokenUSD);

  //
  // const farmableMonthTotal = new BigNumber(farmableMonth).multipliedBy(720);
  const ownership = (
    userBalance.stalkBalance
      .dividedBy(totalBalance.totalStalk)
      .multipliedBy(100)
  );

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
            <span>${displayBN(tvl)}</span>,
            <span>{displayBN(new BigNumber(farmableMonthTotal))}</span>,
          ]}
          balanceDescription={[
            <>
              <div>{displayBN(totalBalance.totalSiloBeans)} <span>Beans</span></div>
              <div>{displayBN(totalBalance.totalSiloLP)} <span>Bean:ETH LP</span></div>
              <div>{displayBN(totalBalance.totalSiloCurve)} <span>Bean:3CRV LP</span></div>
            </>,
            displayFullBN(new BigNumber(farmableMonthTotal)),
          ]}
          description={[
            <span>{siloStrings.tvlDescription}</span>,
            <span>{siloStrings.thirtyDayInterestDescription}</span>,
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
            <span>${displayBN(sumUserSiloDepositsUSD)}</span>,
            <span>{displayBN(userBalance.farmableBeanBalance)}</span>,
          ]}
          balanceDescription={[
            `$${displayBN(sumUserSiloDepositsUSD)}`,
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
            <span>{displayBN(ownership)}%</span>,
            <span>{displayBN(userBalance.grownStalkBalance)}</span>,
          ]}
          balanceDescription={[
            <span>{displayBN(userBalance.stalkBalance)} Stalk &rarr; {ownership.toFixed(5)}%</span>,
            `${displayFullBN(userBalance.grownStalkBalance)} Stalk`,
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

import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import makeStyles from '@mui/styles/makeStyles';

import { AppState } from 'state';
import { poolForLP, SiloAsset } from 'util/index';
import { UNISWAP_BASE_LP, theme, BEAN_TO_STALK, BEAN_TO_SEEDS } from 'constants/index';
import {
  BaseModule,
  ClaimableAsset,
  claimableStrings,
  CryptoAsset,
  Grid,
  Line,
  totalStrings,
  totalTopStrings,
  walletStrings,
  walletTopStrings,
} from '../Common';
import ClaimBalance from './ClaimBalance';
import ClaimButton from './ClaimButton';
import BalanceModule from './BalanceModule';
import { sumBalances, getUserBalancesUSD } from '../../util/getUserBalancesUSD';

const useStyles = makeStyles(({
  boxStyle: {
    fontSize: '18px',
    fontFamily: 'Futura-Pt-Book',
    marginTop: '13px',
    textTransform: 'uppercase',
  }
}));

const balanceStyle = {
  borderRadius: '25px',
  color: 'primary',
  backgroundColor: theme.module.background,
  padding: '10px',
};

export default function Balances() {
  const classes = useStyles();
  const {
    lpBalance,
    lpSiloBalance,
    lpTransitBalance,
    lpReceivableBalance,
    curveBalance,
    curveSiloBalance,
    curveTransitBalance,
    curveReceivableBalance,
    beanlusdBalance,
    beanlusdSiloBalance,
    beanlusdTransitBalance,
    beanlusdReceivableBalance,
    beanBalance,
    beanReceivableBalance,
    beanTransitBalance,
    beanWrappedBalance,
    beanSiloBalance,
    harvestablePodBalance,
    grownStalkBalance,
    farmableBeanBalance,
    stalkBalance,
    seedBalance,
    rootsBalance,
    claimable,
    claimableEthBalance,
    ethBalance,
    podBalance,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const {
    totalLP,
    totalBeans,
    totalCrv3,
    totalBeanlusd,
    totalRoots,
    totalSiloBeans,
    totalTransitBeans,
    totalBudgetBeans,
    totalSiloLP,
    totalTransitLP,
    totalSiloCurve,
    totalTransitCurve,
    totalSiloBeanlusd,
    totalTransitBeanlusd,
    totalStalk,
    totalSeeds,
    totalPods,
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
    beanlusdPrice,
    beanlusdVirtualPrice,
    beanlusdReserve,
    lusdReserve,
  } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
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

  // Farmable Assets
  const farmableStalkBalance = farmableBeanBalance.multipliedBy(BEAN_TO_STALK);
  const farmableSeedBalance  = farmableBeanBalance.multipliedBy(BEAN_TO_SEEDS);

  // Pool calculators
  const poolForLPRatio = (amount: BigNumber) => poolForLP(amount, beanReserve, ethReserve, totalLP);
  const poolForCurveRatio = (amount: BigNumber) => poolForLP(amount, beanCrv3Reserve, crv3Reserve, totalCrv3);
  const poolForBeanlusdRatio = (amount: BigNumber) => poolForLP(amount, beanlusdReserve, lusdReserve, totalBeanlusd);

  const showFirst = window.location.pathname === '/analytics' ? 1 : 0;
  const sectionTitles = ['My Balances', 'Beanstalk'];
  const [section, setSection] = useState(showFirst);
  const handleTabChange = (event, newSection) => {
    setSection(newSection);
  };

  // User Silo deposit balances:
  // Beans, Uniswap LP, Curve LP
  // const userBeans = beanBalance
  //   .plus(beanSiloBalance)
  //   .plus(beanTransitBalance)
  //   .plus(beanWrappedBalance)
  //   .plus(beanReceivableBalance)
  //   .plus(harvestablePodBalance);
  const userLP = lpBalance
    .plus(lpSiloBalance)
    .plus(lpTransitBalance)
    .plus(lpReceivableBalance);
  const userCurve = curveBalance
    .plus(curveSiloBalance)
    .plus(curveTransitBalance)
    .plus(curveReceivableBalance);
  const userBeanlusd = beanlusdBalance
    .plus(beanlusdSiloBalance)
    .plus(beanlusdTransitBalance)
    .plus(beanlusdReceivableBalance);

  // Get pool tuples
  const userBeansAndEth = poolForLPRatio(userLP);
  const userBeansAndCrv3 = poolForCurveRatio(userCurve);
  const userBeansAndLusd = poolForBeanlusdRatio(userBeanlusd);
  const poolBeansAndEth = poolForLPRatio(totalLP);
  const poolBeansAndCrv3 = poolForCurveRatio(totalCrv3);
  const poolBeansAndLusd = poolForBeanlusdRatio(totalBeanlusd);

  const allSiloDepositsUSD = getUserBalancesUSD(userBalance, priceState, totalBalance);
  const userBalanceInDollars = sumBalances(allSiloDepositsUSD);

  const marketCap = totalBeans.isGreaterThan(0)
    ? totalBeans.multipliedBy(beanPrice)
    : new BigNumber(0);
  const poolMarketCap = beanReserve.isGreaterThan(0)
    ? (beanReserve.multipliedBy(beanPrice).multipliedBy(2))
      .plus(
        (beanCrv3Reserve.multipliedBy(beanCrv3Price.multipliedBy(1.0004)).plus(crv3Reserve)).multipliedBy(curveVirtualPrice)
      ).plus(
        (beanlusdReserve.multipliedBy(beanlusdPrice.multipliedBy(1.0004)).plus(lusdReserve)).multipliedBy(beanlusdVirtualPrice)
      )
    : new BigNumber(0);

  const beanClaimable = beanReceivableBalance
    .plus(harvestablePodBalance)
    .plus(beanWrappedBalance)
    .plus(poolForLPRatio(lpReceivableBalance)[0]);

  const ethClaimable = claimableEthBalance.plus(
    poolForLPRatio(lpReceivableBalance)[1]
  );

  const userTotalClaimable = beanClaimable.plus(ethClaimable);

  const spaceTop = (
    <Grid
      item
      xs={12}
      container
      justifyContent="center"
      style={{ marginTop: '10px' }}
    />
  );

  const isFarmableBeans =
    grownStalkBalance.isGreaterThan(0) || farmableBeanBalance.isGreaterThan(0);

  const claimableSection = userTotalClaimable.isGreaterThan(0) ? (
    <Grid
      item
      xs={6}
      container
      justifyContent="center"
      alignItems="flex-end"
    >
      <ClaimButton
        asset={ClaimableAsset.Ethereum}
        userClaimable={userTotalClaimable.isGreaterThan(0)}
        claimable={claimable}
      >
        <Grid container item>
          <Grid
            container
            item
            xs={12}
            justifyContent="center"
            style={{ fontWeight: 'bold', marginBottom: '5px' }}
          >
            Claimable
          </Grid>
          {beanClaimable.isGreaterThan(0) ? (
            <ClaimBalance
              balance={beanClaimable}
              description={claimableStrings.beans}
              height="13px"
              title="Beans"
              token={CryptoAsset.Bean}
              userClaimable={beanClaimable.isGreaterThan(0)}
            />
          ) : null}
          {ethClaimable.isGreaterThan(0) ? (
            <ClaimBalance
              balance={ethClaimable}
              description={claimableStrings.eth}
              title="ETH"
              token={CryptoAsset.Ethereum}
              userClaimable={ethClaimable.isGreaterThan(0)}
            />
          ) : null}
        </Grid>
      </ClaimButton>
    </Grid>
  ) : null;

  const farmableSection = (isFarmableBeans || (stalkBalance.isGreaterThan(0) && rootsBalance.isEqualTo(0))) ? (
    <Grid
      item
      xs={6}
      container
      justifyContent="center"
      alignItems="flex-end"
    >
      {/* ClaimButton is <Grid container item> */}
      <ClaimButton
        asset={ClaimableAsset.Stalk}
        balance={
          rootsBalance.isEqualTo(0) ? new BigNumber(0) : grownStalkBalance
        }
        buttonDescription="Farm Beans, Seeds and Stalk."
        claimTitle="FARM"
        claimable={grownStalkBalance}
        description={claimableStrings.farm}
        userClaimable={grownStalkBalance.isGreaterThan(0)}
        widthTooltip="230px"
      >
        <Grid container item>
          <Grid
            container
            item
            xs={12}
            justifyContent="center"
            style={{ fontWeight: 'bold', marginBottom: '5px' }}
          >
            Farmable
          </Grid>
          {/* what is this? */}
          {beanClaimable.isGreaterThan(0) && ethClaimable.isGreaterThan(0)
            ? spaceTop
            : null}
          {}
          {farmableBeanBalance.isGreaterThan(0) ? (
            <>
              <ClaimBalance
                balance={farmableBeanBalance}
                description={claimableStrings.farmableBeans}
                height="13px"
                title="Farmable Beans"
                token={ClaimableAsset.Bean}
                userClaimable={farmableBeanBalance.isGreaterThan(0)}
              />
              <ClaimBalance
                balance={farmableStalkBalance}
                description={claimableStrings.farmableStalk}
                // height="20px"
                title="Farmable Stalk"
                token={SiloAsset.Stalk}
                userClaimable={farmableBeanBalance.isGreaterThan(0)}
              />
              <ClaimBalance
                balance={farmableSeedBalance}
                description={claimableStrings.farmableSeeds}
                // height="20px"
                title="Farmable Seeds"
                token={SiloAsset.Seed}
                userClaimable={farmableSeedBalance.isGreaterThan(0)}
              />
              <ClaimBalance
                balance={grownStalkBalance}
                description={claimableStrings.grownStalk}
                title="Grown Stalk"
                token={ClaimableAsset.Stalk}
                userClaimable={grownStalkBalance.isGreaterThan(0)}
              />
            </>
          ) : null}
          {/* ??? */}
          {beanClaimable.isGreaterThan(0) && ethClaimable.isGreaterThan(0)
            ? spaceTop
            : null}
          {rootsBalance.isEqualTo(0) ? (
            <Box style={{ width: '130%', marginLeft: '-15%' }}>
              You have not updated your Silo account since the last BIP has
              passed. Please click &apos;Farm&apos; to update your Silo.
            </Box>
          ) : null}
        </Grid>
      </ClaimButton>
    </Grid>
  ) : null;

  const myBalancesSection = (
    <>
      <BalanceModule
        // -- Strings
        description={walletStrings}
        strings={walletTopStrings}
        // -- "Top" Metrics
        // "top left" of the balance module
        // => User Balance in Dollars
        topLeft={userBalanceInDollars}
        // "top right" of the balance module
        // => % ownership in Beanstalk
        topRight={rootsBalance.dividedBy(totalRoots).multipliedBy(100)}
        // -- Other Balances
        beanLPTotal={userBeansAndEth}
        beanCurveTotal={userBeansAndCrv3}
        beanlusdTotal={userBeansAndLusd}
        poolForLPRatio={poolForLPRatio}
        poolForCurveRatio={poolForCurveRatio}
        poolForBeanlusdRatio={poolForBeanlusdRatio}
        beanBalance={beanBalance}
        beanSiloBalance={beanSiloBalance}
        beanTransitBalance={beanTransitBalance}
        beanReceivableBalance={beanReceivableBalance}
        harvestablePodBalance={harvestablePodBalance}
        beanWrappedBalance={beanWrappedBalance}
        lpBalance={lpBalance}
        lpSiloBalance={lpSiloBalance}
        lpTransitBalance={lpTransitBalance}
        lpReceivableBalance={lpReceivableBalance}
        curveBalance={curveBalance}
        curveSiloBalance={curveSiloBalance}
        curveTransitBalance={curveTransitBalance}
        curveReceivableBalance={curveReceivableBalance}
        beanlusdBalance={beanlusdBalance}
        beanlusdSiloBalance={beanlusdSiloBalance}
        beanlusdTransitBalance={beanlusdTransitBalance}
        beanlusdReceivableBalance={beanlusdReceivableBalance}
        stalkBalance={stalkBalance}
        seedBalance={seedBalance}
        ethBalance={ethBalance}
        podBalance={podBalance}
      />
      <Grid
        container
        justifyContent="center"
        style={{ alignItems: 'flex-end' }}
      >
        {claimableSection}
        {farmableSection}
      </Grid>
    </>
  );
  const totalBalancesSection = (
    <>
      <BalanceModule
        // -- Strings
        description={totalStrings}
        strings={totalTopStrings}
        // -- "Top" Metrics
        // "top left" = Market Cap
        topLeft={marketCap}
        // "top right" = Pool Value
        topRight={poolMarketCap}
        // -- Other Metrics
        beanBalance={
          totalBeans.isGreaterThan(0)
            ? totalBeans
                .minus(totalSiloBeans)
                .minus(totalTransitBeans)
                .minus(beanReserve)
                .minus(totalBudgetBeans)
                .minus(beanCrv3Reserve)
                .minus(beanlusdReserve)
            : new BigNumber(0)
        }
        lpBalance={
          totalLP.isGreaterThan(0)
            ? totalLP
                .minus(totalSiloLP)
                .minus(totalTransitLP)
                .minus(new BigNumber(UNISWAP_BASE_LP))
            : new BigNumber(0)
        }
        curveBalance={
          totalCrv3.isGreaterThan(0)
            ? totalCrv3
                .minus(totalSiloCurve)
                .minus(totalTransitCurve)
            : new BigNumber(0)
        }
        beanlusdBalance={
          totalBeanlusd.isGreaterThan(0)
            ? totalBeanlusd
                .minus(totalSiloBeanlusd)
                .minus(totalTransitBeanlusd)
            : new BigNumber(0)
        }
        beanSiloBalance={totalSiloBeans}
        beanTransitBalance={totalTransitBeans}
        beanClaimableBalance={undefined}
        beanReceivableBalance={new BigNumber(0)}
        harvestablePodBalance={new BigNumber(0)}
        lpSiloBalance={totalSiloLP}
        lpTransitBalance={totalTransitLP}
        lpReceivableBalance={new BigNumber(0)}
        curveSiloBalance={totalSiloCurve}
        curveTransitBalance={totalTransitCurve}
        curveReceivableBalance={new BigNumber(0)}
        beanlusdSiloBalance={totalSiloBeanlusd}
        beanlusdTransitBalance={totalTransitBeanlusd}
        beanlusdReceivableBalance={new BigNumber(0)}
        budgetBalance={totalBudgetBeans}
        beanReserveTotal={beanReserve.plus(beanCrv3Reserve).plus(beanlusdReserve)}
        ethBalance={ethReserve}
        stalkBalance={totalStalk}
        seedBalance={totalSeeds}
        podBalance={totalPods}
        beanLPTotal={poolBeansAndEth}
        beanCurveTotal={poolBeansAndCrv3}
        beanlusdTotal={poolBeansAndLusd}
        poolForLPRatio={poolForLPRatio}
        poolForCurveRatio={poolForCurveRatio}
        poolForBeanlusdRatio={poolForBeanlusdRatio}
      />
    </>
  );

  // On mobile, render these sections using tabs.
  const sections = [myBalancesSection, totalBalancesSection];

  return (
    <Container maxWidth="xl">
      {/* Mobile */}
      <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
        <BaseModule
          handleForm={() => {}}
          handleTabChange={handleTabChange}
          section={section}
          sectionTitles={sectionTitles}
          showButton={false}
        >
          {sections[section]}
        </BaseModule>
      </Box>
      {/* Desktop */}
      <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
        <Grid
          container
          spacing={8}
          justifyContent="center"
          alignItems="flex-start"
        >
          <Grid item sm={12} md={6} style={{ maxWidth: '500px' }}>
            <Box className="AppBar-shadow" sx={balanceStyle}>
              <Box className={classes.boxStyle}>My Balances</Box>
              <Line />
              {myBalancesSection}
            </Box>
          </Grid>
          <Grid item sm={12} md={6} style={{ maxWidth: '500px' }}>
            <Box className="AppBar-shadow" sx={balanceStyle}>
              <Box className={classes.boxStyle}>Beanstalk</Box>
              <Line />
              {totalBalancesSection}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
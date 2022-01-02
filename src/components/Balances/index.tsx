import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import { AppState } from 'state';
import { poolForLP } from 'util/index';
import { UNISWAP_BASE_LP, theme } from 'constants/index';
import {
  BaseModule,
  ClaimableAsset,
  claimableStrings,
  ContentSection,
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

const balanceStyle = {
  borderRadius: '25px',
  color: 'primary',
  backgroundColor: theme.module.background,
  padding: '10px',
};
const boxStyle = {
  fontSize: '18px',
  fontFamily: 'Futura-Pt-Book',
  marginTop: '13px',
  textTransform: 'uppercase',
};

export default function Balances() {
  const {
    lpBalance,
    lpSiloBalance,
    lpTransitBalance,
    lpReceivableBalance,
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
    totalRoots,
    totalSiloBeans,
    totalTransitBeans,
    totalBudgetBeans,
    totalSiloLP,
    totalTransitLP,
    totalStalk,
    totalSeeds,
    totalPods,
  } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  const { beanReserve, ethReserve, beanPrice } = useSelector<
    AppState,
    AppState['prices']
  >((state) => state.prices);

  const poolForLPRatio = (amount: BigNumber) => {
    if (amount.isLessThanOrEqualTo(0)) {
      return [new BigNumber(0), new BigNumber(0)];
    }
    return poolForLP(amount, beanReserve, ethReserve, totalLP);
  };

  const showFirst = window.location.pathname === '/analytics' ? 1 : 0;
  const sectionTitles = ['My Balances', 'Beanstalk'];
  const [section, setSection] = useState(showFirst);
  const handleTabChange = (event, newSection) => {
    setSection(newSection);
  };

  const userLP = lpBalance
    .plus(lpSiloBalance)
    .plus(lpTransitBalance)
    .plus(lpReceivableBalance);
  const userBeans = beanBalance
    .plus(beanSiloBalance)
    .plus(beanTransitBalance)
    .plus(beanWrappedBalance)
    .plus(beanReceivableBalance)
    .plus(harvestablePodBalance)
    .plus(beanWrappedBalance);

  const userBeansAndEth = poolForLPRatio(userLP);
  const poolBeansAndEth = poolForLPRatio(totalLP);

  const userLPBeans = userBeansAndEth[0].multipliedBy(2);
  const userBalanceInDollars = userBeans
    .plus(userLPBeans)
    .multipliedBy(beanPrice);

  const marketCap = totalBeans.isGreaterThan(0)
    ? totalBeans.multipliedBy(beanPrice)
    : new BigNumber(0);
  const poolMarketCap = beanReserve.isGreaterThan(0)
    ? beanReserve.multipliedBy(beanPrice).multipliedBy(2)
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
      container
      item
      xs={12}
      justifyContent="center"
      style={{ marginTop: '10px' }}
    />
  );

  const isFarmableBeans =
    grownStalkBalance.isGreaterThan(0) || farmableBeanBalance.isGreaterThan(0);

  const claimableSection = userTotalClaimable.isGreaterThan(0) ? (
    <Grid
      container
      item
      xs={6}
      justifyContent="center"
      style={{ alignItems: 'flex-end' }}
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

  const farmableSection =
    isFarmableBeans ||
    (stalkBalance.isGreaterThan(0) && rootsBalance.isEqualTo(0)) ? (
      <Grid
        container
        item
        xs={6}
        justifyContent="center"
        style={{ alignItems: 'flex-end' }}
      >
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
            {beanClaimable.isGreaterThan(0) && ethClaimable.isGreaterThan(0)
              ? spaceTop
              : null}
            {grownStalkBalance.isGreaterThan(0) ? (
              <ClaimBalance
                balance={grownStalkBalance}
                description={claimableStrings.grownStalk}
                title="Grown Stalk"
                token={ClaimableAsset.Stalk}
                userClaimable={grownStalkBalance.isGreaterThan(0)}
              />
            ) : null}
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
        description={walletStrings}
        strings={walletTopStrings}
        topLeft={userBalanceInDollars}
        topRight={rootsBalance.dividedBy(totalRoots).multipliedBy(100)}
        beanLPTotal={userBeansAndEth}
        poolForLPRatio={poolForLPRatio}
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
        stalkBalance={stalkBalance}
        seedBalance={seedBalance}
        ethBalance={ethBalance}
        podBalance={podBalance}
      />
      <Grid
        container
        item
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
        description={totalStrings}
        strings={totalTopStrings}
        beanBalance={
          totalBeans.isGreaterThan(0)
            ? totalBeans
                .minus(totalSiloBeans)
                .minus(totalTransitBeans)
                .minus(beanReserve)
                .minus(totalBudgetBeans)
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
        budgetBalance={totalBudgetBeans}
        beanSiloBalance={totalSiloBeans}
        lpSiloBalance={totalSiloLP}
        beanTransitBalance={totalTransitBeans}
        lpTransitBalance={totalTransitLP}
        beanClaimableBalance={undefined}
        beanReceivableBalance={new BigNumber(0)}
        harvestablePodBalance={new BigNumber(0)}
        lpReceivableBalance={new BigNumber(0)}
        beanReserveTotal={beanReserve}
        ethBalance={ethReserve}
        stalkBalance={totalStalk}
        seedBalance={totalSeeds}
        podBalance={totalPods}
        topLeft={marketCap}
        topRight={poolMarketCap}
        beanLPTotal={poolBeansAndEth}
        poolForLPRatio={poolForLPRatio}
      />
    </>
  );

  const sections = [myBalancesSection, totalBalancesSection];

  return (
    <ContentSection
      id="balances"
    >
      <Box className="BalanceSection-mobile">
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

      <Grid
        className="BalanceSection"
        container
        item
        spacing={8}
        justifyContent="center"
        alignItems="flex-start"
      >
        <Grid item sm={12} md={6} style={{ maxWidth: '500px' }}>
          <Box className="AppBar-shadow" style={balanceStyle}>
            <Box style={boxStyle}>My Balances </Box>
            <Line />
            {myBalancesSection}
          </Box>
        </Grid>

        <Grid item sm={12} md={6} style={{ maxWidth: '500px' }}>
          <Box className="AppBar-shadow" style={balanceStyle}>
            <Box style={boxStyle}>Beanstalk</Box>
            <Line />
            {totalBalancesSection}
          </Box>
        </Grid>
      </Grid>
    </ContentSection>
  );
}

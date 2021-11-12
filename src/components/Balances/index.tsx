import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import { AppState } from 'state';
import { poolForLP } from '../../util';
import { UNISWAP_BASE_LP, theme, zeroBN } from '../../constants';
import {
  BaseModule,
  ClaimableAsset,
  claimableStrings,
  ContentSection,
  CryptoAsset,
  Grid,
  Line,
  SiloAsset,
  totalDescriptions,
  totalStrings,
  walletDescriptions,
  walletStrings,
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
const divStyle = {
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
    beanSiloBalance,
    claimableEthBalance,
    harvestablePodBalance,
    grownStalkBalance,
    farmableStalkBalance,
    farmableBeanBalance,
    stalkBalance,
    rootsBalance,
    claimable,
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
    if (amount.isLessThanOrEqualTo(0)) return [zeroBN, zeroBN];
    return poolForLP(amount, beanReserve, ethReserve, totalLP);
  };

  const sectionTitles = ['My Balances', 'Beanstalk'];
  const [section, setSection] = useState(0);
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
    .plus(beanReceivableBalance)
    .plus(harvestablePodBalance);

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
      style={{ marginTop: '20px' }}
    />
  );

  const isFarmableStalk =
    grownStalkBalance.isGreaterThan(0) && farmableStalkBalance.isGreaterThan(0);
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
          {isFarmableStalk && ethClaimable.isGreaterThan(0) ? (
            spaceTop
          ) : isFarmableStalk ? (
            <Grid
              container
              item
              xs={12}
              justifyContent="center"
              style={{ marginTop: '30px' }}
            />
          ) : null}
          {beanClaimable.isGreaterThan(0) ? (
            <ClaimBalance
              balance={beanClaimable}
              description={claimableStrings.beans}
              height="13px"
              title="Beans"
              token={CryptoAsset.Bean}
              userClaimable={beanClaimable.isGreaterThan(0)}
            />
          ) : isFarmableBeans ? (
            spaceTop
          ) : null}
          {ethClaimable.isGreaterThan(0) ? (
            <ClaimBalance
              balance={ethClaimable}
              description={claimableStrings.eth}
              title="ETH"
              token={CryptoAsset.Ethereum}
              userClaimable={ethClaimable.isGreaterThan(0)}
            />
          ) : isFarmableBeans ? (
            spaceTop
          ) : null}
          {ethClaimable.isGreaterThan(0) ? (
            spaceTop
          ) : (
            <Grid
              container
              item
              xs={12}
              justifyContent="center"
              style={{ marginTop: '10px' }}
            />
          )}
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
            {farmableBeanBalance.isGreaterThan(0) ? (
              <ClaimBalance
                balance={farmableBeanBalance}
                description={claimableStrings.farmableBeans}
                height="13px"
                title="Beans"
                token={CryptoAsset.Bean}
                userClaimable={farmableBeanBalance.isGreaterThan(0)}
              />
            ) : (
              spaceTop
            )}
            {farmableBeanBalance.plus(farmableStalkBalance) ? (
              <ClaimBalance
                balance={farmableBeanBalance.plus(farmableStalkBalance)}
                description={claimableStrings.farmableStalk}
                title="Stalk"
                token={SiloAsset.Stalk}
                userClaimable={farmableBeanBalance.isGreaterThan(0)}
              />
            ) : (
              spaceTop
            )}
            {farmableBeanBalance.isGreaterThan(0) ? (
              <ClaimBalance
                balance={farmableBeanBalance.multipliedBy(2)}
                description={claimableStrings.farmableSeeds}
                height="17px"
                title="Seeds"
                token={SiloAsset.Seed}
                userClaimable={farmableBeanBalance.isGreaterThan(0)}
              />
            ) : (
              spaceTop
            )}
            {grownStalkBalance.isGreaterThan(0) ? (
              <ClaimBalance
                balance={grownStalkBalance}
                description={claimableStrings.grownStalk}
                title="Grown Stalk"
                token={ClaimableAsset.Stalk}
                userClaimable={grownStalkBalance.isGreaterThan(0)}
              />
            ) : (
              spaceTop
            )}
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
        description={walletDescriptions}
        strings={walletStrings}
        topLeft={userBalanceInDollars}
        topRight={rootsBalance.dividedBy(totalRoots).multipliedBy(100)}
        beanLPTotal={userBeansAndEth}
        poolForLPRatio={poolForLPRatio}
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
        description={totalDescriptions}
        strings={totalStrings}
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
        claimableEthBalance={new BigNumber(0)}
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
      title="Balances"
      size="20px"
      style={{ paddingTop: '60px' }}
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
        style={{ marginTop: '8px' }}
      >
        <Grid item sm={12} md={6} style={{ maxWidth: '500px' }}>
          <Box className="AppBar-shadow" style={balanceStyle}>
            <Box style={divStyle}>My Balances </Box>
            <Line />
            {myBalancesSection}
          </Box>
        </Grid>

        <Grid item sm={12} md={6} style={{ maxWidth: '500px' }}>
          <Box className="AppBar-shadow" style={balanceStyle}>
            <Box style={divStyle}>Beanstalk</Box>
            <Line />
            {totalBalancesSection}
          </Box>
        </Grid>
      </Grid>
    </ContentSection>
  );
}

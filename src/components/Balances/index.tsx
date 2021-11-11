import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { UNISWAP_BASE_LP, theme } from '../../constants';
import {
  BaseModule,
  ClaimableAsset,
  claimableStrings,
  ContentSection,
  CryptoAsset,
  Grid,
  Line,
  totalDescriptions,
  totalStrings,
  walletDescriptions,
  walletStrings,
} from '../Common';
import ClaimBalance from './ClaimBalance';
import ClaimButton from './ClaimButton';
import BalanceModule from './BalanceModule';

export default function Balances(props) {
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

  const sectionTitles = ['My Balances', 'Beanstalk'];
  const [section, setSection] = useState(0);
  const handleTabChange = (event, newSection) => {
    setSection(newSection);
  };

  const userLP = props.lpBalance
    .plus(props.lpSiloBalance)
    .plus(props.lpTransitBalance)
    .plus(props.lpReceivableBalance);
  const userBeans = props.beanBalance
    .plus(props.beanSiloBalance)
    .plus(props.beanTransitBalance)
    .plus(props.beanReceivableBalance)
    .plus(props.harvestablePodBalance);

  const userBeansAndEth = props.poolForLPRatio(userLP);
  const poolBeansAndEth = props.poolForLPRatio(props.totalLP);

  const userLPBeans = userBeansAndEth[0].multipliedBy(2);
  const userBalanceInDollars = userBeans
    .plus(userLPBeans)
    .multipliedBy(props.beanPrice);

  const marketCap = props.totalBeans.isGreaterThan(0)
    ? props.totalBeans.multipliedBy(props.beanPrice)
    : new BigNumber(0);
  const poolMarketCap = props.beanReserve.isGreaterThan(0)
    ? props.beanReserve.multipliedBy(props.beanPrice).multipliedBy(2)
    : new BigNumber(0);

  const beanClaimable = props.beanReceivableBalance
    .plus(props.harvestablePodBalance)
    .plus(props.poolForLPRatio(props.lpReceivableBalance)[0]);

  const ethClaimable = props.claimableEthBalance
    .plus(props.poolForLPRatio(props.lpReceivableBalance)[1]);

  const userTotalClaimable = beanClaimable.plus(ethClaimable);

  const spaceTop = (
    <Grid container item xs={12} justifyContent="center" style={{ marginTop: '10px' }} />
  );

  const isFarmableBeans = (
    props.grownStalkBalance.isGreaterThan(0) ||
    props.farmableBeanBalance.isGreaterThan(0)
  );

  const claimableSection = userTotalClaimable.isGreaterThan(0) ? (
    <Grid container item xs={6} justifyContent="center" style={{ alignItems: 'flex-end' }}>
      <ClaimButton
        asset={ClaimableAsset.Ethereum}
        userClaimable={userTotalClaimable.isGreaterThan(0)}
        claimable={props.claimable}
        {...props}
      >
        <Grid container item>
          <Grid container item xs={12} justifyContent="center" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            Claimable
          </Grid>
          {beanClaimable.isGreaterThan(0) ?
            <ClaimBalance
              balance={beanClaimable}
              description={claimableStrings.beans}
              height="13px"
              title="Beans"
              token={CryptoAsset.Bean}
              userClaimable={beanClaimable.isGreaterThan(0)}
              {...props}
            />
            : null
          }
          {ethClaimable.isGreaterThan(0) ?
            <ClaimBalance
              balance={ethClaimable}
              description={claimableStrings.eth}
              title="ETH"
              token={CryptoAsset.Ethereum}
              userClaimable={ethClaimable.isGreaterThan(0)}
              {...props}
            />
            : null
          }
        </Grid>
      </ClaimButton>
    </Grid>
  ) : null;

  const farmableSection =
    isFarmableBeans ||
    (props.stalkBalance.isGreaterThan(0) && props.rootsBalance.isEqualTo(0)) ? (
      <Grid container item xs={6} justifyContent="center" style={{ alignItems: 'flex-end' }}>
        <ClaimButton
          asset={ClaimableAsset.Stalk}
          balance={
            props.rootsBalance.isEqualTo(0)
              ? new BigNumber(0)
              : props.grownStalkBalance
          }
          buttonDescription="Farm Beans, Seeds and Stalk."
          claimTitle="FARM"
          claimable={props.grownStalkBalance}
          description={claimableStrings.farm}
          userClaimable={props.grownStalkBalance.isGreaterThan(0)}
          widthTooltip="230px"
          {...props}
        >
          <Grid container item>
            <Grid container item xs={12} justifyContent="center" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              Farmable
            </Grid>
            {beanClaimable.isGreaterThan(0) && ethClaimable.isGreaterThan(0) ?
              spaceTop
              : null
            }
            {props.grownStalkBalance.isGreaterThan(0) ?
              <ClaimBalance
                balance={props.grownStalkBalance}
                description={claimableStrings.grownStalk}
                title="Grown Stalk"
                token={ClaimableAsset.Stalk}
                userClaimable={props.grownStalkBalance.isGreaterThan(0)}
                {...props}
              />
              : null
            }
            {beanClaimable.isGreaterThan(0) && ethClaimable.isGreaterThan(0) ?
              spaceTop
              : null
            }
            {props.rootsBalance.isEqualTo(0) ? (
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
        topRight={props.rootsBalance.dividedBy(props.totalRoots).multipliedBy(100)}
        beanLPTotal={userBeansAndEth}
        {...props}
      />
      <Grid container item justifyContent="center" style={{ alignItems: 'flex-end' }}>
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
        props.totalBeans.isGreaterThan(0)
          ? props.totalBeans
              .minus(props.totalSiloBeans)
              .minus(props.totalTransitBeans)
              .minus(props.beanReserve)
              .minus(props.totalBudgetBeans)
          : new BigNumber(0)
      }
        lpBalance={
        props.totalLP.isGreaterThan(0)
          ? props.totalLP
              .minus(props.totalSiloLP)
              .minus(props.totalTransitLP)
              .minus(new BigNumber(UNISWAP_BASE_LP))
          : new BigNumber(0)
      }
        budgetBalance={props.totalBudgetBeans}
        beanSiloBalance={props.totalSiloBeans}
        lpSiloBalance={props.totalSiloLP}
        beanTransitBalance={props.totalTransitBeans}
        lpTransitBalance={props.totalTransitLP}
        beanClaimableBalance={undefined}
        beanReceivableBalance={new BigNumber(0)}
        harvestablePodBalance={new BigNumber(0)}
        lpReceivableBalance={new BigNumber(0)}
        claimableEthBalance={new BigNumber(0)}
        beanReserveTotal={props.beanReserve}
        ethBalance={props.ethReserve}
        stalkBalance={props.totalStalk}
        seedBalance={props.totalSeeds}
        podBalance={props.totalPods}
        topLeft={marketCap}
        topRight={poolMarketCap}
        beanLPTotal={poolBeansAndEth}
        poolForLPRatio={props.poolForLPRatio}
      />
    </>
  );

  const sections = [myBalancesSection, totalBalancesSection];

  return (
    <ContentSection
      id="balances"
      title="Balances"
      size="20px"
      style={{ marginTop: '-80px' }}
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

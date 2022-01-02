import React, { useState } from 'react';
import { Hidden, Box } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { BEAN, theme } from 'constants/index';
import { displayBN, displayFullBN, TokenLabel, TrimBN } from 'util/index';
import {
  BudgetAsset,
  ClaimableAsset,
  CryptoAsset,
  DataBalanceModule,
  FarmAsset,
  FormatTooltip,
  Grid,
  SiloAsset,
  TokenBalanceModule,
  TransitAsset,
  UniswapAsset,
} from 'components/Common';
import BalanceChart from './BalanceChart';
import ToggleTokenBalanceModule from './ToggleTokenBalanceModule';

const color = {
  circulating: '#B3CDE3',
  pool: '#FBB4AE',
  claimable: '#C5AC77',
  silo: '#CCEBC5',
  transit: '#DECBE4',
  budget: '#FED9A6',
};
const containerGridStyle = {
  minHeight: '110px',
  padding: '4px 4px',
  width: '50%',
};
const containerGridHorizontalStyle = {
  padding: '4px 4px',
};
const spanStyle = {
  display: 'inline-block',
  fontFamily: 'Futura-Pt-Book',
  fontWeight: 'bold',
  margin: '5px 0 5px 15px',
  textAlign: 'left',
  width: '100%',
};
const smallGridStyle = {
  fontWeight: 'bold',
  fontFamily: 'Futura-Pt-Book',
  marginTop: '-5px',
  padding: '0 4px 4px 4px',
};
export default function BalanceModule(props) {
  const [beanActive, setBeanActive] = useState(-1);
  const [lpActive, setLPActive] = useState(-1);

  const beanTotals = props.beanBalance
    .plus(props.beanSiloBalance)
    .plus(props.beanTransitBalance)
    .plus(props.beanReceivableBalance)
    .plus(props.beanWrappedBalance)
    .plus(props.harvestablePodBalance)
    .plus(props.budgetBalance)
    .plus(props.beanReserveTotal);
  const lpTotals = props.lpBalance
    .plus(props.lpSiloBalance)
    .plus(props.lpTransitBalance)
    .plus(props.lpReceivableBalance);
  const claimableBalance = props.beanReceivableBalance.plus(props.harvestablePodBalance).plus(props.beanWrappedBalance);

  /* Show Claimables */

  const claimableBeansSection = (
    <ToggleTokenBalanceModule
      balance={claimableBalance}
      balanceColor={beanActive === 4 ? color.claimable : null}
      description={props.description.claimableBeanBalance}
      title={`Claimable ${props.showTokenName ? 'Beans' : ''}`}
      token={ClaimableAsset.Bean}
    />
  );

  const budgetBeansSection = (
    <ToggleTokenBalanceModule
      balance={props.budgetBalance}
      balanceColor={beanActive === 5 ? color.budget : null}
      description={props.description.budgetBalance}
      title={`Budget ${props.showTokenName ? 'Beans' : ''}`}
      token={BudgetAsset.Bean}
    />
  );
  const claimableLPSection = (
    <ToggleTokenBalanceModule
      balance={props.lpReceivableBalance}
      balanceColor={lpActive === 4 ? color.claimable : null}
      description={props.description.claimablelpBalance}
      isLP
      poolForLPRatio={props.poolForLPRatio}
      title={`Claimable ${props.showTokenName ? 'LP' : ''}`}
      token={ClaimableAsset.LP}
    />
  );
  const beanReserveSection = (
    <ToggleTokenBalanceModule
      balance={props.beanReserveTotal}
      balanceColor={beanActive === 3 ? color.pool : null}
      description={props.description.beanReserveTotal}
      token={UniswapAsset.Bean}
    />
  );
  const beanTransitSection = (
    <ToggleTokenBalanceModule
      balance={props.beanTransitBalance}
      balanceColor={beanActive === 2 ? color.transit : null}
      description={props.description.beanTransitBalance}
      title={`Withdrawn ${props.showTokenName ? 'Beans' : ''}`}
      token={TransitAsset.Bean}
    />
  );
  const lpTransitSection = (
    <ToggleTokenBalanceModule
      balance={props.lpTransitBalance}
      balanceColor={lpActive === 2 ? color.transit : null}
      description={props.description.lpTransitBalance}
      isLP
      poolForLPRatio={props.poolForLPRatio}
      title={`Withdrawn ${props.showTokenName ? 'LP' : ''}`}
      token={TransitAsset.LP}
    />
  );

  /* Bean Hidden */

  const switchBeanSizeBalances = (
    <>
      <Hidden smUp>
        <Grid item xs={12} style={smallGridStyle}>
          <TokenBalanceModule
            balance={beanTotals}
            description="Total Beans"
            style={{ position: 'relative' }}
            swerve
            title="Total Beans"
            token={CryptoAsset.Bean}
          />
        </Grid>
      </Hidden>
      <Hidden xsDown>
        <Grid container item sm={6} xs={12} style={containerGridStyle}>
          <Grid item xs={12}>
            <FormatTooltip
              margin={props.chartMargin}
              placement="top"
              title={
                beanTotals.isGreaterThan(0) && beanActive < 0
                  ? `${displayFullBN(beanTotals)} Beans`
                  : ''
              }
            >
              <Box>
                <BalanceChart
                  asset={CryptoAsset.Bean}
                  claimable={claimableBalance}
                  budget={props.budgetBalance}
                  circulating={props.beanBalance}
                  pool={props.beanReserveTotal}
                  silo={props.beanSiloBalance}
                  setActive={setBeanActive}
                  title="Beans"
                  total={displayBN(beanTotals)}
                  transit={props.beanTransitBalance}
                />
              </Box>
            </FormatTooltip>
          </Grid>
        </Grid>
      </Hidden>
    </>
  );

  /* LP Hidden */

  const switchLPSizeBalances = (
    <>
      <Hidden smUp>
        <Grid item xs={12} style={smallGridStyle}>
          <TokenBalanceModule
            balance={lpTotals}
            description="Total LP"
            isLP
            poolForLPRatio={props.poolForLPRatio}
            style={{ position: 'relative' }}
            swerve
            title="Total LP"
            token={CryptoAsset.LP}
          />
        </Grid>
      </Hidden>
      <Hidden xsDown>
        <Grid container item sm={6} xs={12} style={containerGridStyle}>
          <Grid item xs={12}>
            <FormatTooltip
              placement="top"
              margin={props.chartMargin}
              title={
                (props.beanLPTotal[0].isGreaterThan(0) ||
                  props.beanLPTotal[1].isGreaterThan(0)) &&
                lpActive < 0
                  ? `${displayFullBN(
                      props.beanLPTotal[0],
                      BEAN.decimals
                    )} Beans/${displayFullBN(props.beanLPTotal[1])} ETH`
                  : ''
              }
            >
              <Box>
                <BalanceChart
                  asset={CryptoAsset.LP}
                  claimable={props.lpReceivableBalance}
                  circulating={props.lpBalance}
                  setActive={setLPActive}
                  silo={props.lpSiloBalance}
                  title={`${TokenLabel(CryptoAsset.Bean)}/${TokenLabel(
                    CryptoAsset.Ethereum
                  )}`}
                  total={`${displayBN(props.beanLPTotal[0])}/${displayBN(
                    props.beanLPTotal[1]
                  )}`}
                  transit={props.lpTransitBalance}
                />
              </Box>
            </FormatTooltip>
          </Grid>
        </Grid>
      </Hidden>
    </>
  );

  return (
    <Grid
      container
      justifyContent="center"
      style={{
        padding: props.padding,
        backgroundColor: theme.module.background,
      }}
    >
      <Grid
        container
        style={{
          backgroundColor: theme.module.foreground,
          borderRadius: '25px',
          textAlign: 'left',
        }}
      >
        <Grid container item xs={12} style={containerGridHorizontalStyle}>
          <Grid item sm={6} xs={12}>
            <DataBalanceModule
              balance={`$${displayBN(props.topLeft)}`}
              balanceDescription={`$${displayFullBN(props.topLeft)} USD`}
              description={props.description.topLeft}
              margin="0 0 6px 10px"
              placement="top-start"
              style={{ position: 'relative' }}
              swerve
              title={props.description.topLeftTitle}
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <DataBalanceModule
              balance={
                props.topRight.isLessThanOrEqualTo(100)
                  ? `${displayBN(props.topRight)}%`
                  : `$${displayBN(props.topRight)}`
              }
              balanceDescription={
                props.topRight.isGreaterThan(0)
                  ? props.topRight.isLessThanOrEqualTo(100)
                    ? `${displayFullBN(props.topRight)}% ${
                        props.strings.topRight
                      }`
                    : `$${displayFullBN(props.topRight)} ${
                        props.strings.topRight
                      }`
                  : undefined
              }
              description={props.description.topRight}
              margin="0 0 6px 10px"
              placement="top-start"
              style={{ position: 'relative' }}
              swerve
              title={props.description.topRightTitle}
            />
          </Grid>
        </Grid>
      </Grid>

      <span style={spanStyle}>Beans</span>
      <Grid
        container
        style={{
          backgroundColor: theme.module.foreground,
          borderRadius: '25px',
        }}
      >
        <Grid container item sm={6} xs={12} style={containerGridStyle}>
          <Grid item xs={12}>
            <TokenBalanceModule
              balance={props.beanBalance}
              balanceColor={beanActive === 0 ? color.circulating : null}
              description={props.description.beanBalance}
              swerve
              title={`Circulating ${props.showTokenName ? 'Beans' : ''}`}
              token={CryptoAsset.Bean}
            />
          </Grid>
          <Grid item xs={12}>
            <TokenBalanceModule
              balance={props.beanSiloBalance}
              balanceColor={beanActive === 1 ? color.silo : null}
              description={props.description.beanSiloBalance}
              swerve
              title={`Deposited ${props.showTokenName ? 'Beans' : ''}`}
              token={SiloAsset.Bean}
            />
          </Grid>
          {beanTransitSection}
          {claimableBeansSection}
          {beanReserveSection}
          {budgetBeansSection}
        </Grid>

        {switchBeanSizeBalances}
      </Grid>
      <span style={spanStyle}>LP</span>
      <Grid
        container
        style={{
          backgroundColor: theme.module.foreground,
          borderRadius: '25px',
        }}
      >
        <Grid container item sm={6} xs={12} style={containerGridStyle}>
          <Grid item xs={12}>
            <TokenBalanceModule
              balance={props.lpBalance}
              balanceColor={lpActive === 0 ? color.circulating : null}
              description={props.description.lpBalance}
              isLP
              poolForLPRatio={props.poolForLPRatio}
              swerve
              title={`Circulating ${props.showTokenName ? 'LP' : ''}`}
              token={CryptoAsset.LP}
            />
          </Grid>
          <Grid item xs={12}>
            <TokenBalanceModule
              balance={props.lpSiloBalance}
              balanceColor={lpActive === 1 ? color.silo : null}
              description={props.description.lpSiloBalance}
              isLP
              poolForLPRatio={props.poolForLPRatio}
              swerve
              title={`Deposited ${props.showTokenName ? 'LP' : ''}`}
              token={SiloAsset.LP}
            />
          </Grid>
          {lpTransitSection}
          {claimableLPSection}
        </Grid>

        {switchLPSizeBalances}
      </Grid>
      <Grid
        container
        style={{
          backgroundColor: theme.module.foreground,
          borderRadius: '25px',
          marginTop: '20px',
        }}
      >
        <Grid container item xs={12} style={containerGridHorizontalStyle}>
          <Grid item sm={3} xs={12}>
            <TokenBalanceModule
              balance={props.stalkBalance}
              description={props.description.stalkBalance}
              margin={props.margin}
              placement="bottom"
              token={SiloAsset.Stalk}
            />
          </Grid>
          <Grid item sm={3} xs={12}>
            <TokenBalanceModule
              balance={props.seedBalance}
              description={props.description.seedBalance}
              margin={props.margin}
              placement="bottom"
              token={SiloAsset.Seed}
            />
          </Grid>
          <Grid item sm={3} xs={12}>
            <TokenBalanceModule
              balance={props.podBalance}
              description={props.description.podBalance}
              margin={props.margin}
              placement="bottom"
              token={FarmAsset.Pods}
            />
          </Grid>
          <Grid item sm={3} xs={12}>
            <TokenBalanceModule
              balance={
                props.ethBalance.isLessThan(0.0003)
                  ? TrimBN(props.ethBalance, 6)
                  : props.ethBalance
              }
              description={props.description.ethBalance}
              margin={props.margin}
              placement="bottom"
              token={CryptoAsset.Ethereum}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

BalanceModule.defaultProps = {
  chartMargin: '0 0 0 30px',
  margin: '4px 0 0 20px',
  padding: '10px',
  showTokenName: true,
  budgetBalance: new BigNumber(0),
  beanReserveTotal: new BigNumber(0),
};

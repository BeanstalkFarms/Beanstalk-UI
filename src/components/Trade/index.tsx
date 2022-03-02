import React from 'react';
import { Grid, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
// import { useSelector } from 'react-redux';

// import { AppState } from 'state';
// import { theme } from 'constants/index';
import {
  addTokenToMetamask,
} from 'util/index';
import {
  ContentSection,
  ContentDropdown,
  tradeStrings,
  // HeaderLabelList,
} from 'components/Common';
import { CURVE_LINK, theme } from 'constants/index';
import metamaskIcon from 'img/metamask-icon.png';
import curveIcon from 'img/curve-logo.svg';
import TradeModule from './TradeModule';
// import LastCrossTimer from './LastCrossTimer';

const useStyles = makeStyles(() => ({
  button: {
    display: 'flex',
    width: 500,
    textTransform: 'none',
    backgroundColor: theme.module.background,
    // backgroundColor: theme.secondary,
    // color: theme.accentText,
    paddingTop: 12,
    paddingBottom: 12,
    fontWeight: 'bold',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontFamily: 'Futura-PT-Book',
    fontSize: 16
  },
  buttonImage: {
    height: 30,
    marginRight: 12
  }
}));

export default function Trade() {
  const classes = useStyles();
  return (
    <ContentSection id="trade" title="Trade">
      <Grid item xs={12}>
        <TradeModule />
      </Grid>
      <Grid container spacing={1} style={{ marginTop: 16, maxWidth: 500 }}>
        <Grid item xs={12} container justifyContent="center">
          <Button
            className={classes.button}
            variant="contained"
            onClick={() => {
              addTokenToMetamask();
            }}
          >
            <span>Add BEAN to MetaMask</span>
            <img src={metamaskIcon} alt="" className={classes.buttonImage} />
          </Button>
        </Grid>
        <Grid item xs={12} container justifyContent="center">
          <Button
            className={classes.button}
            variant="contained"
            href={CURVE_LINK}
            target="_blank"
            rel="noreferrer"
          >
            <span>Swap on Curve</span>
            <img src={curveIcon} alt="" className={classes.buttonImage} />
          </Button>
        </Grid>
        <Grid item xs={12} container justifyContent="center">
          <ContentDropdown
            description={tradeStrings.tradeDescription}
            descriptionTitle="How do I Trade?"
            accordionStyles={{
              maxWidth: 500,
              width: '100%',
            }}
          /> 
        </Grid>
      </Grid>
    </ContentSection>
  );
}

// const { beanPrice, beanCrv3Price, curveVirtualPrice } = useSelector<AppState, AppState['prices']>(
//   (state) => state.prices
// );
// const { lastCross } = useSelector<AppState, AppState['general']>(
//   (state) => state.general
// );
// const headerLabelStyle = {
//   maxWidth: '300px',
//   color: theme.text,
// };
// const [lcTitle, lcValue, lcDescription, lcBalanceDescription] = LastCrossTimer(lastCross);
/* 
<Grid container item xs={12} justifyContent="center" style={headerLabelStyle}>
  <HeaderLabelList
    description={[
      tradeStrings.beanPrice,
      tradeStrings.curvePrice,
      lcDescription,
    ]}
    balanceDescription={[
      `$${displayFullBN(beanPrice)}`,
      `$${displayFullBN(beanCrv3Price.multipliedBy(curveVirtualPrice))}`,
      lcBalanceDescription,
    ]}
    title={[
      'Current Uniswap Price',
      'Current Curve Price',
      lcTitle,
    ]}
    value={[
      `$${beanPrice.toFixed(4)}`,
      `$${beanCrv3Price.multipliedBy(curveVirtualPrice).toFixed(4)}`,
      lcValue,
    ]}
    width="300px"
  />
</Grid> */
/* <ContentDropdown
    description={tradeStrings.tradeDescription}
    descriptionTitle="How do I Trade?"
  /> */

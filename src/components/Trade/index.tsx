import React from 'react';
import { Grid, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import {
  watchToken,
} from 'util/index';
import {
  ContentSection,
  ContentDropdown,
  tradeStrings,
} from 'components/Common';
import { CURVE_LINK, theme } from 'constants/index';

import TradeModule from './TradeModule';
import metamaskIcon from 'img/metamask-icon.png';
import curveIcon from 'img/curve-logo.svg';

const useStyles = makeStyles(() => ({
  button: {
    display: 'flex',
    width: 500,
    textTransform: 'none',
    backgroundColor: theme.module.background,
    paddingTop: 12,
    paddingBottom: 12,
    fontWeight: 'bold',
    borderRadius: '15px',
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
              watchToken();
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
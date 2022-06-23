import React from 'react';
import {  Button, Container, Stack } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

import { watchToken, } from 'util/index';
import { ContentDropdown, tradeStrings } from 'components/Common';
import { CURVE_LINK, theme } from 'constants/index';

import metamaskIcon from 'img/metamask-icon.png';
import curveIcon from 'img/curve-logo.svg';

import TradeModule from './TradeModule';

const useStyles = makeStyles(() => ({
  button: {
    display: 'flex',
    width: '100%',
    textTransform: 'none',
    color: theme.text,
    backgroundColor: theme.module.background,
    paddingTop: 12,
    paddingBottom: 12,
    fontWeight: 'bold',
    borderRadius: '15px',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontFamily: 'Futura-PT-Book',
    fontSize: 16,
    // FIXME: need to use Material UI's buttons...
    '&:hover': {
      backgroundColor: theme.module.foreground,
    }
  },
  buttonImage: {
    height: 30,
    marginRight: 12
  }
}));

export default function Trade() {
  const classes = useStyles();
  return (
    <Container maxWidth="sm">
      <Stack spacing={4}>
        <div>
          {/* <TradeModule /> */}
          The trade module is currently disabled
        </div>
        <Container maxWidth="sm">
          <Stack spacing={1}>
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
            <div>
              <ContentDropdown
                description={tradeStrings.tradeDescription}
                descriptionTitle="How do I Trade?"
                accordionStyles={{
                  width: '100%',
                }}
              /> 
            </div>
          </Stack>
        </Container>
      </Stack>
    </Container>
  );
}

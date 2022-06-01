import React from 'react';
import { Grid, Button, Link } from '@mui/material';
import { initialize, metamaskFailure, switchToMainnet } from 'util/index';
import { METAMASK_LINK } from 'constants/index';

import SvgCloudIcon from 'components/v1/About/SvgCloudIcon';
import About from 'components/v1/About';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(({
  connectMetaStyle: {
    fontFamily: 'Futura-PT-Book',
    fontSize: '18px',
    height: '46px',
    lineHeight: '20px',
    margin: 'auto 0',
    padding: '20px',
    top: 'calc(50% - 23px)',
    width: 'auto',
  }
}));

export default function MetamasklessModule() {
  const classes = useStyles();

  let metamaskModule;
  if (metamaskFailure === 0 || metamaskFailure === 1) {
    metamaskModule = (
      <Grid item xs={12}>
        <Link href={METAMASK_LINK} target="blank" color="inherit" underline="hover">
          <SvgCloudIcon text="Install Metamask" />
        </Link>
      </Grid>
    );
  } else if (metamaskFailure === 3) {
    metamaskModule = (
      <Grid item xs={12}>
        <SvgCloudIcon
          onClick={async () => {
            const switchSuccessful = await switchToMainnet();
            if (switchSuccessful) {
              // history.push('/');
            }
          }}
          style={{ cursor: 'pointer' }}
          color="white"
          text="Switch to Mainnet"
        />
      </Grid>
    );
  } else {
    metamaskModule = (
      <Grid container item xs={12}>
        <Grid item xs={12}>
          <Button
            color="primary"
            onClick={async () => {
              const initialized = await initialize();
              if (initialized) {
                window.location.reload();
              }
            }}
            className={classes.connectMetaStyle}
            // style={connectMetaStyle}
            variant="contained"
          >
            Connect Wallet
          </Button>
        </Grid>
      </Grid>
    );
  }

  return (
    <>
      <About defaultSection={metamaskModule} />
    </>
  );
}

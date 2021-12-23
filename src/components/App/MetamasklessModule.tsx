import React from 'react';
import { useSelector } from 'react-redux';
import { Grid, Button, Link } from '@material-ui/core';
import { switchToMainnet } from 'util/index';
import { METAMASK_LINK, HOW_TO_MM_PATH } from 'constants/index';
import { SvgCloudIcon } from 'components/About/SvgCloudIcon';
import About from 'components/About';
import { useEthereum, useWeb3 } from 'state/application/hooks';
import { AppState } from 'state';

export default function MetamasklessModule() {
  const { onboard } = useWeb3();
  const ethereum = useEthereum();
  const { metamaskFailure } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  const connectMetaStyle = {
    fontFamily: 'Futura-PT-Book',
    fontSize: '18px',
    height: '46px',
    lineHeight: '20px',
    margin: 'auto 0',
    padding: '20px',
    top: 'calc(50% - 23px)',
    width: 'auto',
  };
  let metamaskModule;
  if (metamaskFailure === 0 || metamaskFailure === 1) {
    metamaskModule = (
      <Grid item xs={12}>
        <Link href={METAMASK_LINK} target="blank" color="inherit">
          <SvgCloudIcon color="white" text="Install Metamask" />
        </Link>
      </Grid>
    );
  } else if (metamaskFailure === 3) {
    metamaskModule = (
      <Grid item xs={12}>
        <SvgCloudIcon
          onClick={async () => {
            switchToMainnet(ethereum);
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
        <Grid item xs={12} style={{ minHeight: '150px' }}>
          <Link href={HOW_TO_MM_PATH} color="inherit" target="blank">
            <SvgCloudIcon color="white" text="Connect Wallet" />
          </Link>
        </Grid>
        <Grid item xs={12}>
          <Button
            color="primary"
            onClick={() => {
              onboard?.walletSelect();
            }}
            style={connectMetaStyle}
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

import React from 'react';
import { Grid, Button, Link, Box } from '@material-ui/core';
import { initialize, metamaskFailure } from '../../util';
import { METAMASK_LINK, HOW_TO_MM_PATH } from '../../constants';
import { SvgCloudIcon } from '../About/SvgCloudIcon';
import About from '../About';
import Charts from '../Charts';
import { ContentSection } from '../Common';
import { NavigationBar } from '../Navigation';

export default function MetamasklessModule() {
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
        <Link href={HOW_TO_MM_PATH} target="blank" color="inherit">
          <SvgCloudIcon color="white" text="Change Network" />
        </Link>
      </Grid>
    );
  } else {
    metamaskModule = (
      <Grid container item xs={12}>
        <Grid item xs={12} style={{ minHeight: '150px' }}>
          <Link href={HOW_TO_MM_PATH} color="inherit" target="blank">
            <SvgCloudIcon color="white" text="Connect Metamask" />
          </Link>
        </Grid>
        <Grid item xs={12}>
          <Button
            color="primary"
            onClick={async () => {
              if (await initialize()) window.location.reload();
            }}
            style={connectMetaStyle}
            variant="contained"
          >
            Connect Metamask
          </Button>
        </Grid>
      </Grid>
    );
  }

  const navMappings = [
    {
      path: 'about',
      title: 'ABOUT',
    },
    {
      path: 'analytics',
      title: 'ANALYTICS',
    },
  ];

  return (
    <>
      <NavigationBar links={navMappings} showWallet={false} />
      <Box className="App" style={{ position: 'relative' }}>
        <About defaultSection={metamaskModule} />
        <ContentSection id="analytics" title="Charts">
          <Charts title="" />
        </ContentSection>
      </Box>
    </>
  );
}

import React from 'react';
import BigNumber from 'bignumber.js';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CssBaseline, Box } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import Updater from 'state/userBalance/updater';
import { AppState } from 'state';
import { theme as colorTheme } from 'constants/index';
import About from 'components/About';
import Analytics from 'components/Analytics';
import Field from 'components/Field';
import { NavigationBar } from 'components/Navigation';
import NFTs from 'components/NFT';
import Silo from 'components/Silo';
import Trade from 'components/Trade';
import Governance from 'components/Governance';
import MetamasklessModule from './MetamasklessModule';
import Main from './main.tsx';
import theme from './theme';
import LoadingBean from './LoadingBean.tsx';
import './App.css';

export default function App() {
  document.body.style.backgroundColor = colorTheme.bodyColor;

  const { initialized, metamaskFailure, contractEvents } = useSelector<
    AppState,
    AppState['general']
  >((state) => state.general);

  BigNumber.set({ EXPONENTIAL_AT: [-12, 20] });

  let app;
  if (metamaskFailure > -1) {
    app = <MetamasklessModule />;
  } else if (!initialized) {
    app = <LoadingBean />;
  } else {
    app = (
      <>
        <NavigationBar events={contractEvents} />
        <Switch>
          <Route exact path="/">
            <Redirect to="/farm" />
          </Route>
          <Route exact path="/farm">
            <>
              <Silo />
              <Field />
              <Trade />
            </>
          </Route>
          <Route exact path="/analytics">
            <Analytics />
          </Route>
          <Route exact path="/dao">
            <Governance />
          </Route>
          <Route exact path="/nft">
            <NFTs />
          </Route>
          <Route exact path="/about">
            <About key="about" />
          </Route>
        </Switch>
      </>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Updater />
      <Box className="App">
        <Main>{app}</Main>
      </Box>
    </ThemeProvider>
  );
}

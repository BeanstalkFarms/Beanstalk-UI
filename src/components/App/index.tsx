import React from 'react';
import BigNumber from 'bignumber.js';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import Updater from 'state/userBalance/updater';
import { AppState } from 'state';
import About from 'components/About';
import Analytics from 'components/Analytics';
import Field from 'components/Field';
import Fundraiser from 'components/Fundraiser';
import { NavigationBar } from 'components/Navigation';
import NFTs from 'components/NFT';
import Silo from 'components/Silo';
import Trade from 'components/Trade';
import Marketplace from 'components/Marketplace';
import Governance from 'components/Governance';
import MetamasklessModule from './MetamasklessModule';
import Main from './main';
import theme from './theme';
import LoadingBean from './LoadingBean';
import './App.css';

export default function App() {
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
          <Route path="/farm">
            <>
              <Silo />
              <Field />
              <Trade />
            </>
          </Route>
          <Route path="/analytics">
            <Analytics />
          </Route>
          <Route path="/fundraiser">
            <Fundraiser />
          </Route>
          <Route path="/dao">
            <Governance />
          </Route>
          <Route path="/nft">
            <NFTs />
          </Route>
          <Route path="/about">
            <About key="about" />
          </Route>
          <Route path="/marketplace">
            <Marketplace key="marketplace" />
          </Route>
        </Switch>
      </>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Updater />
      <Main>{app}</Main>
    </ThemeProvider>
  );
}

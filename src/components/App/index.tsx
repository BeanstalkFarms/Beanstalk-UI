import React from 'react';
import BigNumber from 'bignumber.js';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import Updater from 'state/userBalance/updater';
import ApplicationUpdater from 'state/application/updater';
import { AppState } from 'state';
import { NavigationBar } from 'components/Navigation';
import {
  Farm,
  Analytics,
  DAO,
  BeaNFT,
  AboutPage,
  FundraiserPage,
  MetamasklessPage,
} from 'Pages';

import Main from './main.tsx';
import theme from './theme';
import LoadingBean from './LoadingBean.tsx';
import './App.css';

export default function App() {
  const { initialized, metamaskFailure, contractEvents } = useSelector<
    AppState,
    AppState['general']
  >((state) => state.general);

  BigNumber.set({ EXPONENTIAL_AT: [-12, 20] });

  let app;
  if (!initialized && metamaskFailure <= -1) {
    app = <LoadingBean />;
  } else {
    app = (
      <>
        <NavigationBar events={contractEvents} />
        {metamaskFailure > -1 && <MetamasklessPage />}
        <Switch>
          <Route exact path="/">
            <Redirect to="/farm" />
          </Route>
          <Route exact path="/farm">
            <Farm />
          </Route>
          <Route exact path="/analytics">
            <Analytics />
          </Route>
          <Route exact path="/fundraiser">
            <FundraiserPage />
          </Route>
          <Route exact path="/dao">
            <DAO />
          </Route>
          <Route exact path="/nft">
            <BeaNFT />
          </Route>
          <Route exact path="/about">
            <AboutPage key="about" />
          </Route>
        </Switch>
      </>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Updater />
      <ApplicationUpdater />
      <Main>{app}</Main>
    </ThemeProvider>
  );
}

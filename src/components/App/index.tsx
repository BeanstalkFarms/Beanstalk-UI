import React from 'react';
import BigNumber from 'bignumber.js';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import Updater from 'state/userBalance/updater';
import { AppState } from 'state';
import About from 'components/About';
import Fundraiser from 'components/Fundraiser';
import { NavigationBar } from 'components/Navigation';
import { Farm, Analytics, DAO, BeaNFT } from 'Pages';
import MetamasklessModule from './MetamasklessModule';
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
            <Farm />
          </Route>
          <Route exact path="/analytics">
            <Analytics />
          </Route>
          <Route exact path="/fundraiser">
            <Fundraiser />
          </Route>
          <Route exact path="/dao">
            <DAO />
          </Route>
          <Route exact path="/nft">
            <BeaNFT />
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
      <Main>{app}</Main>
    </ThemeProvider>
  );
}

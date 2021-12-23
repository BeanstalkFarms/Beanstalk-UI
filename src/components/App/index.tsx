import React, { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import Updater from 'state/userBalance/updater';
import NFTUpdater from 'state/nfts/updater';
import { setWidth } from 'state/general/actions';
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
  Marketplace,
} from 'Pages';

import Main from './main.tsx';
import theme from './theme';
import LoadingBean from './LoadingBean';
import './App.css';

export default function App() {
  const { initialized, metamaskFailure } = useSelector<
    AppState,
    AppState['general']
  >((state) => state.general);
  const dispatch = useDispatch();

  BigNumber.set({ EXPONENTIAL_AT: [-12, 20] });

  function handleWindowSizeChange() {
    dispatch(setWidth(window.innerWidth));
  }

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  let app;
  if (metamaskFailure > -1) {
    app = (
      <>
        <NavigationBar />
        <MetamasklessPage />
      </>
    );
  } else if (!initialized) {
    app = <LoadingBean />;
  } else {
    app = (
      <>
        <NavigationBar />
        <Switch>
          <Route exact path="/">
            <Redirect to="/farm" />
          </Route>
          <Route exact path="/farm">
            <Farm />
          </Route>
          <Route path="/analytics">
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
          <Route exact path="/marketplace">
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
      <NFTUpdater />
      <Main>{app}</Main>
    </ThemeProvider>
  );
}

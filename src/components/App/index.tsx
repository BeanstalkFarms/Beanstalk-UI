import React, { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import Updater from 'state/userBalance/updater';
import ApplicationUpdater from 'state/application/updater';
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
} from 'Pages';
import { useAccount } from 'state/application/hooks';

import Main from './main.tsx';
import theme from './theme';
import LoadingBean from './LoadingBean.tsx';
import './App.css';

export default function App() {
  const { initialized } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );
  const account = useAccount();
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
  if (account !== '' && !initialized) {
    app = <LoadingBean />;
  } else {
    app = (
      <>
        <NavigationBar />
        {account === '' && <MetamasklessPage />}
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
      <NFTUpdater />
      <Main>{app}</Main>
    </ThemeProvider>
  );
}

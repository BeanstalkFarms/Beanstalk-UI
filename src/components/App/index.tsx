import React, { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';

import Updater from 'state/userBalance/updater';
import TokenUpdater from 'state/tokenBalance/updater';
import NFTUpdater from 'state/nfts/updater';
import { setWidth } from 'state/general/actions';
import { AppState } from 'state';
import Footer from 'components/About/Footer';
import { NavigationBar, NavigationSidebar } from 'components/Navigation';

import {
  //
  MetamasklessPage,
  //
  FarmPage,
  SiloPage,
  FieldPage,
  TradePage,
  DAOPage,
  //
  AnalyticsPage,
  FundraiserPage,
  BeaNFTPage,
  AboutPage,
  BalancesPage,
  PegMaintenancePage,
} from 'Pages';

import Wrapper from './Wrapper';
import theme from './theme';
import LoadingBean from './LoadingBean';
import './App.css';

BigNumber.set({ EXPONENTIAL_AT: [-12, 20] });

export default function App() {
  const dispatch = useDispatch();
  const { initialized, metamaskFailure } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  // HANDLE WINDOW SIZE CHANGE
  // Used throughout the app to show/hide components and
  // control elements of the theme.
  const handleWindowSizeChange = () => dispatch(setWidth(window.innerWidth));
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
        {/* <NavigationBar /> */}
        <MetamasklessPage />
      </>
    );
  } else if (!initialized) {
    app = <LoadingBean />;
  } else {
    app = (
      <div>
        {/* <NavigationBar /> */}
        <Switch>
          {/* Redirects */}
          <Route exact path="/">
            <Redirect to="/farm/silo" />
          </Route>
          <Route exact path="/farm">
            <Redirect to="/silo" />
          </Route>
          {/* Farm */}
          <Route exact path="/farm/silo">
            <SiloPage />
          </Route>
          <Route exact path="/farm/field">
            <FieldPage />
          </Route>
          <Route exact path="/farm/trade">
            <TradePage />
          </Route>
          <Route exact path="/farm/balances">
            <FarmPage sectionNumber={3} />
          </Route>
          <Route exact path="/farm/beanfts">
            <FarmPage sectionNumber={4} />
          </Route>
          {/* More */}
          <Route exact path="/analytics">
            <AnalyticsPage />
          </Route>
          <Route exact path="/peg">
            <PegMaintenancePage />
          </Route>
          <Route exact path="/fundraiser">
            <FundraiserPage />
          </Route>
          <Route exact path="/governance">
            <DAOPage />
          </Route>
          <Route exact path="/balances">
            <BalancesPage />
          </Route>
          <Route exact path="/beanfts">
            <Redirect to="/beanfts/beanft" />
          </Route>
          <Route exact path="/beanfts/beanft">
            <BeaNFTPage sectionNumber={0} />
          </Route>
          <Route exact path="/beanfts/earnnfts">
            <BeaNFTPage sectionNumber={1} />
          </Route>
          <Route exact path="/about">
            <AboutPage key="about" />
          </Route>
          {/* If nothing matches, go to the Silo */}
          <Redirect to="/farm/silo" />
        </Switch>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* UPDATERS */}
      <Updater />
      <TokenUpdater />
      <NFTUpdater />
      {/* CONTENT */}
      <Box className="App">
        <Wrapper />
        <Box sx={{ display: 'flex' }}>
          <NavigationSidebar />
          <Box component="main" sx={{ flex: 1, position: 'relative' }}>
            <NavigationBar />
            {app}
            <Footer />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

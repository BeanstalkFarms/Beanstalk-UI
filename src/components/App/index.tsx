import React, { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { Toaster } from 'react-hot-toast';

import Updater from 'state/userBalance/updater';
import TokenUpdater from 'state/tokenBalance/updater';
import NftUpdater from 'state/nfts/updater';
import { setWidth } from 'state/general/actions';
import { AppState } from 'state';
import Footer from 'components/About/Footer';
import { NavigationBar, NavigationSidebar } from 'components/Navigation';

import ConnectPage from 'pages/connect';
import MarketplacePage from 'pages/market';
import SiloPage from 'pages/silo';
import SiloActionsPage from 'pages/silo/actions';
import FieldPage from 'pages/field';
import TradePage from 'pages/trade';
import GovernancePage from 'pages/governance';
import AnalyticsPage from 'pages/analytics';
import FundraiserPage from 'pages/fundraiser';
import BeaNFTPage from 'pages/beanfts';
import AboutPage from 'pages/about';
import BalancesPage from 'pages/balances';
import PegMaintenancePage from 'pages/peg';

import Wrapper from './Wrapper';
import theme from './theme';
import LoadingBean from './LoadingBean';
// import { useConnectWallet } from 'util/hooks/useConnectWallet';
import './App.css';

BigNumber.set({ EXPONENTIAL_AT: [-12, 20] });

export default function App() {
  const dispatch = useDispatch();
  const {
    initialized,
    metamaskFailure,
    width
  } = useSelector<AppState, AppState['general']>((state) => state.general);
  // const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()

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
      <ConnectPage />
    );
  } else if (!initialized) {
    app = (
      <LoadingBean />
    );
  } else {
    app = (
      <div>
        <Switch>
          {/* Redirects */}
          <Route exact path="/">
            <Redirect to="/silo" />
          </Route>
          <Route exact path="/farm">
            <Redirect to="/silo" />
          </Route>
          <Route path="/analytics">
            <AnalyticsPage />
          </Route>
          {/* Farm */}
          <Route exact path="/silo">
            <SiloPage />
          </Route>
          <Route exact path="/silo/:tokenSlug">
            <SiloActionsPage />
          </Route>
          <Route exact path="/field">
            <FieldPage />
          </Route>
          <Route exact path="/trade">
            <TradePage />
          </Route>
          {/* Redirect old /farm routes */}
          <Route exact path="/farm/silo">
            <Redirect to="/silo" />
          </Route>
          <Route exact path="/farm/silo/:tokenSlug">
            {/* fixme: attach the :tokenSlug parameter */}
            <Redirect to="/silo" />
          </Route>
          <Route exact path="/farm/field">
            <Redirect to="/field" />
          </Route>
          <Route exact path="/farm/trade">
            <Redirect to="/trade" />
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
            <GovernancePage />
          </Route>
          <Route exact path="/balances">
            <BalancesPage />
          </Route>
          <Route exact path="/beanfts">
            <BeaNFTPage key="beanfts" />
          </Route>
          <Route exact path="/about">
            <AboutPage key="about" />
          </Route>
          <Route exact path="/market">
            <MarketplacePage key="marketplace" />
          </Route>
          {/* If nothing matches, go to the Silo */}
          <Redirect to="/silo" />
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
      <NftUpdater />
      {/* CONTENT */}
      <Box className="App">
        <Wrapper />
        <Box sx={{ display: 'flex' }}>
          <NavigationSidebar />
          <Box component="main" sx={{ flex: 1, position: 'relative' }}>
            <NavigationBar />
            {app}
            <Toaster
              containerStyle={{
                // Shift toast by side nav bar width
                left: width < 800 ? 0 : 280,
                marginTop: -2,
              }}
              toastOptions={{
                style: {
                  maxWidth: 350
                }
              }}
            />
            <Footer />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

import React, { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';

import Updater from 'state/userBalance/updater';
import ApplicationUpdater from 'state/application/updater';
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
  //
} from 'Pages';
import { useAccount } from 'state/application/hooks';

import Wrapper from './Wrapper';
import theme from './theme';
import LoadingBean from './LoadingBean';
import './App.css';

BigNumber.set({ EXPONENTIAL_AT: [-12, 20] });

export default function App() {
  const account = useAccount();
  const dispatch = useDispatch();
  const { initialized } = useSelector<AppState, AppState['general']>(
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
  if (account !== '' && !initialized) {
    app = <LoadingBean />;
  } else {
    app = (
      <>
        {account === '' && <MetamasklessPage />}
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
            <Redirect to="/analytics/charts" />
          </Route>
          <Route exact path="/analytics/charts">
            <AnalyticsPage sectionNumber={0} />
          </Route>
          <Route exact path="/analytics/seasons">
            <AnalyticsPage sectionNumber={1} />
          </Route>
          <Route exact path="/analytics/balances">
            <AnalyticsPage sectionNumber={2} />
          </Route>
          <Route exact path="/fundraiser">
            <FundraiserPage />
          </Route>
          <Route exact path="/governance">
            <DAOPage />
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
      </>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* UPDATERS */}
      <Updater />
      <ApplicationUpdater />
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

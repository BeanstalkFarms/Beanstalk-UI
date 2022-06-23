import React, { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, CssBaseline, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Toaster } from 'react-hot-toast';

import { AppState } from 'state';
import Updater from 'state/userBalance/updater';
import TokenUpdater from 'state/tokenBalance/updater';
import NftUpdater from 'state/nfts/updater';
import { setWidth } from 'state/general/actions';
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
import LoadingBean from './LoadingBean';
import './App.css';

BigNumber.set({ EXPONENTIAL_AT: [-12, 20] });

export default function App() {
  const dispatch = useDispatch();
  const {
    initialized,
    metamaskFailure,
    width
  } = useSelector<AppState, AppState['general']>((state) => state.general);

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

  const [open, setOpen] = useState(true);

  return (
    <>
      <CssBaseline />
      {/* UPDATERS */}
      <Updater />
      <TokenUpdater />
      <NftUpdater />
      {/* CONTENT */}
      <Box className="App">
        <Wrapper />
        <Dialog fullScreen={false} open={open}>
          <DialogTitle>
            Notice
          </DialogTitle>
          <DialogContent>
            <p><strong>You are viewing Beanstalk forked at block <a href="https://etherscan.io/block/14602789" target="_blank" rel="noreferrer">14602789</a>, the last block before <a href="https://bean.money/blog/beanstalk-governance-exploit" target="_blank" rel="noreferrer">Beanstalk was attacked</a>.</strong></p>
            <p><strong>‼️ Your wallet remains connected to the network you had selected prior</strong>. The website is talking to a fork of Ethereum, while your wallet is talking to Ethereum mainnet or some other network. Thus, transactions are disabled in this UI—don{"'"}t try to send them.</p>
            <p>This website is for informational purposes. Farmers can view their prior balances and the state of Beanstalk. The latest version of the Beanstalk Interface remains at <a href="https://app.bean.money" target="_blank" rel="noreferrer">app.bean.money</a>.</p>
            <p>Be wary of scams as Beanstalk approaches Replant. <ul><li>The latest Beanstalk UI is hosted on <strong>app.bean.money</strong>.</li><li>The pre-exploit Beanstalk UI is hosted on <strong>pre-exploit.app.bean.money</strong></li><li>No one from Beanstalk Farms will DM you first. All official links flow through <strong>#announcements in Discord</strong>.</li></ul></p>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" fullWidth color="primary" onClick={() => setOpen(false)}>I understand - enter site</Button>
          </DialogActions>
        </Dialog>
        <Box>
          <Box sx={{ backgroundColor: 'white', px: 2, py: 1, textAlign: 'center', cursor: 'pointer' }} onClick={() => setOpen(true)}>You are viewing Beanstalk forked at block 14602789. <strong>Learn more</strong></Box>
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
                    minWidth: 300,
                    maxWidth: 450,
                    // paddingRight: 0,
                    paddingLeft: '16px',
                  }
                }}
              />
              <Footer />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

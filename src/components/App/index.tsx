import React, { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CssBaseline } from '@mui/material';
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
import SiloTokenPage from 'pages/silo/token';
import FieldPage from 'pages/field';
import TradePage from 'pages/trade';
import GovernancePage from 'pages/governance';
import AnalyticsPage from 'pages/analytics';
import FundraiserPage from 'pages/fundraiser';
import BeaNFTPage from 'pages/beanfts';
import AboutPage from 'pages/about';
import BalancesPage from 'pages/balances';
import PegMaintenancePage from 'pages/peg';

import PageBackground from './PageBackground';
import LoadingBean from './LoadingBean';
import './App.css';
import NavBar from 'components/v2/Nav/NavBar';
import pageBackground from 'img/bg-mainnet.png';
import { BeanstalkPalette } from './muiTheme';

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

  // let app;
  // if (metamaskFailure > -1) {
  //   app = (
  //     <ConnectPage />
  //   );
  // } else if (!initialized) {
  //   app = (
  //     <LoadingBean />
  //   );
  // } else {
  const app = (
    <div>
      <Routes>
        <Route path="/analytics" element={<AnalyticsPage />} />
        {/* Farm */}
        <Route path="/silo" element={<SiloPage />} />
        <Route path="/silo/:address" element={<SiloTokenPage />} />
        {/* <Route path="/field" element={<FieldPage />} />
        <Route path="/trade" element={<TradePage />} /> */}
        {/* More */}
        {/* <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/peg" element={<PegMaintenancePage />} />
        <Route path="/fundraiser" element={<FundraiserPage />} />
        <Route path="/governance" element={<GovernancePage />} />
        <Route path="/balances" element={<BalancesPage />} />
        <Route path="/beanfts" element={<BeaNFTPage key="beanfts" />} />
        <Route path="/about" element={<AboutPage key="about" />} />
        <Route path="/market" element={<MarketplacePage key="marketplace" />} /> */}
      </Routes>
    </div>
  );
  // }

  return (
    <>
      <CssBaseline />
      {/* UPDATERS */}
      {/* <Updater />
      <TokenUpdater />
      <NftUpdater /> */}
      {/* CONTENT */}
      <Box
        className="App"
        sx={{
          backgroundColor: BeanstalkPalette.lighterBlue,
          backgroundImage: `url(${pageBackground})`,
          backgroundAttachment: 'fixed',
          backgroundPosition: 'bottom center',
          backgroundSize: '100%',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
        }}
      >
        <Box>
          <NavBar />
          <Box sx={{ pt: 10 }}>
            {app}
          </Box>
          <Toaster
            containerStyle={{
              // Shift toast by side nav bar width
              // left: width < 800 ? 0 : 280,
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
          {/* <Footer /> */}
        </Box>
      </Box>
    </>
  );
}

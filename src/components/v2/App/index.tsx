import React from 'react';
import BigNumber from 'bignumber.js';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';

import SiloPage from 'pages/silo';
import SiloTokenPage from 'pages/silo/token';
import FieldPage from 'pages/field';
// import ConnectPage from 'pages/connect';
// import MarketplacePage from 'pages/market';
// import TradePage from 'pages/trade';
// import GovernancePage from 'pages/governance';
// import AnalyticsPage from 'pages/analytics';
// import FundraiserPage from 'pages/fundraiser';
// import BeaNFTPage from 'pages/beanfts';
// import AboutPage from 'pages/about';
// import BalancesPage from 'pages/balances';
// import PegMaintenancePage from 'pages/peg';

// import PageBackground from './PageBackground';
// import LoadingBean from './LoadingBean';
import './App.css';
import NavBar from 'components/v2/Nav/NavBar';
import pageBackground from 'img/bg-mainnet.png';
import ForecastPage from 'pages/forecast';
import FarmerSiloUpdater from 'state/v2/farmer/silo/updater';
import PoolsUpdater from 'state/v2/bean/pools/updater';
import FarmerEventsUpdater from 'state/v2/farmer/events/updater';
import FarmerUpdater from 'state/v2/farmer/updater';
import SunUpdater from 'state/v2/beanstalk/sun/updater';
import { BeanstalkPalette } from './theme';

BigNumber.set({ EXPONENTIAL_AT: [-12, 20] });

export default function App() {
  const dispatch = useDispatch();
  const app = (
    <div>
      <Routes>
        {/* Farm */}
        <Route path="/" element={<ForecastPage />} />
        <Route path="/silo" element={<SiloPage />} />
        <Route path="/silo/:address" element={<SiloTokenPage />} />
        <Route path="/field" element={<FieldPage />} />
        {/* <Route path="/trade" element={<TradePage />} /> */}
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
      <FarmerSiloUpdater />
      <PoolsUpdater />
      <FarmerEventsUpdater />
      <FarmerUpdater />
      <SunUpdater />
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
          <Box sx={{ py: 10 }}>
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
        </Box>
      </Box>
    </>
  );
}

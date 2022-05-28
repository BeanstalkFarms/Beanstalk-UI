import React, { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';

import SiloPage from 'pages/silo';
import SiloTokenPage from 'pages/silo/token';
import FieldPage from 'pages/field';
import ForecastPage from 'pages/forecast';
import BarnRaisePage from 'pages/barn-raise';
import TransactionHistoryPage from 'pages/history';

import pageBackground from 'img/bg-mainnet.png';
import NavBar from 'components/v2/Nav/NavBar';

import { setWidth } from 'state/general/actions';
import FarmerSiloUpdater from 'state/v2/farmer/silo/updater';
import PoolsUpdater from 'state/v2/bean/pools/updater';
import FarmerEventsUpdater from 'state/v2/farmer/events/updater';
import FarmerUpdater from 'state/v2/farmer/updater';
import SunUpdater from 'state/v2/beanstalk/sun/updater';
import FertilizerUpdater from 'state/v2/beanstalk/fertilizer/updater';
import BalancesUpdater from 'state/v2/farmer/balances/updater';
import { BeanstalkPalette } from './muiTheme';

import './App.css';
import BalancesPage from '../../../pages/balances';

BigNumber.set({ EXPONENTIAL_AT: [-12, 20] });

export default function App() {
  const dispatch = useDispatch();

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

  const app = (
    <div>
      <Routes>
        {/* Farm */}
        <Route path="/" element={<ForecastPage />} />
        <Route path="/silo" element={<SiloPage />} />
        <Route path="/silo/:address" element={<SiloTokenPage />} />
        <Route path="/field" element={<FieldPage />} />
        <Route path="/barn-raise" element={<BarnRaisePage />} />
        <Route path="/history" element={<TransactionHistoryPage />} />
        <Route path="/balances" element={<BalancesPage />} />
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
      <BalancesUpdater />
      <FertilizerUpdater />
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
          {/* <Footer /> */}
        </Box>
      </Box>
    </>
  );
}

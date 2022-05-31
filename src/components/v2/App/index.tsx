import React, { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, CssBaseline } from '@mui/material';
import { ToastBar, Toaster } from 'react-hot-toast';

import SiloPage from 'pages/silo';
import SiloTokenPage from 'pages/silo/token';
import FieldPage from 'pages/field';
import ForecastPage from 'pages/forecast';
import BarnRaisePage from 'pages/barn-raise';
import TransactionHistoryPage from 'pages/history';
import BalancesPage from 'pages/balances';

import pageBackground from 'img/theme/bg-mainnet-tinypng@3x.png';
import NavBar from 'components/v2/Nav/NavBar';
import { setWidth } from 'state/general/actions';

import PoolsUpdater from 'state/v2/bean/pools/updater';
import SunUpdater from 'state/v2/beanstalk/sun/updater';
import FertilizerUpdater from 'state/v2/beanstalk/fertilizer/updater';
import SiloUpdater from 'state/v2/beanstalk/silo/updater';
import FarmerSiloUpdater from 'state/v2/farmer/silo/updater';
import FarmerEventsUpdater from 'state/v2/farmer/events/updater';
import FarmerEventsProcessor from 'state/v2/farmer/processor';
import FarmerBalancesUpdater from 'state/v2/farmer/balances/updater';
import FarmerFertilizerUpdater from 'state/v2/farmer/fertilizer/updater';

import './App.css';
import { BeanstalkPalette } from './muiTheme';
import FieldUpdater from 'state/v2/beanstalk/field/updater';

BigNumber.set({ EXPONENTIAL_AT: [-12, 20] });

const CustomToaster : React.FC = () => (
  <Toaster
    containerStyle={{
      top: 78,
    }}
    toastOptions={{
      duration: 4000,
      position: 'top-right',
      style: {
        minWidth: 300,
        maxWidth: 400,
        paddingLeft: '16px',
      }
    }}
  >
    {(t) => (
      <ToastBar
        toast={t}
        style={{
          ...t.style,
          // Option 1: Pops up instantly,
          // then slides out to the right side
          // animation: 'none',
          // position: 'absolute',
          // right: t.visible ? 0 : -500,
          // transition: 'right 0.4s ease-in-out',
          // opacity: 1,
          // Option 2: Slides in and out, but there's
          // an issue where it "flashes back" after
          // completing the animation.
          // position: 'absolute',
          // animation: t.visible ? 'custom-enter 1s ease-in-out' : 'custom-exit 1s ease-in-out',
          // animationFillMode: 'forwards'
          // Option 3: Tries to fix toasts stacking on top of each other
          animation: 'none',
          marginRight: t.visible ? 0 : -500,
          transition: 'margin-right 0.4s ease-in-out',
          opacity: 1,
        }}
      />
    )}
  </Toaster>
);

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
        <Route path="/" element={<BarnRaisePage />} />
        <Route path="/silo" element={<SiloPage />} />
        <Route path="/silo/:address" element={<SiloTokenPage />} />
        <Route path="/field" element={<FieldPage />} />
        <Route path="/forecast" element={<ForecastPage />} />
        <Route path="/history" element={<TransactionHistoryPage />} />
        <Route path="/balances" element={<BalancesPage />} />
      </Routes>
    </div>
  );
  // }

  return (
    <>
      <CssBaseline />
      {/* -----------------------
        * Bean Updaters
        * ----------------------- */}
      <PoolsUpdater />
      {/* -----------------------
        * Beanstalk Updaters
        * ----------------------- */}
      <FertilizerUpdater />
      <FieldUpdater />
      <SiloUpdater />
      <SunUpdater />
      {/* -----------------------
        * Farmer Updaters
        * ----------------------- */}
      <FarmerEventsUpdater />
      <FarmerEventsProcessor />
      <FarmerBalancesUpdater />
      <FarmerFertilizerUpdater />
      <FarmerSiloUpdater />
      {/* -----------------------
        * Content
        * ----------------------- */}
      {/* <Box 
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      /> */}
      {/* Navbar is ~65px tall */}
      <NavBar />
      <CustomToaster />
      <Box
        sx={{
          backgroundColor: BeanstalkPalette.lighterBlue,
          backgroundImage: `url(${pageBackground})`,
          backgroundAttachment: 'fixed',
          backgroundPosition: 'bottom center',
          backgroundSize: '100%',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          minHeight: '100vh',
          paddingTop: {
            md: 10,
            xs: 9,
          },
          paddingBottom: 4
        }}>
        {app}
      </Box>
    </>
  );
}

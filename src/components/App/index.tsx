import React from 'react';
import BigNumber from 'bignumber.js';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { ToastBar, Toaster } from 'react-hot-toast';
import SiloPage from 'pages/silo';
import SiloTokenPage from 'pages/silo/token';
import FieldPage from 'pages/field';
import ForecastPage from 'pages/forecast';
import BarnRaisePage from 'pages/barn-raise';
import TransactionHistoryPage from 'pages/history';
import BalancesPage from 'pages/balances';
import pageBackground from 'img/theme/bg-mainnet.png';
import NavBar from 'components/Nav/NavBar';
import PoolsUpdater from 'state/bean/pools/updater';
import SunUpdater from 'state/beanstalk/sun/updater';
import FertilizerUpdater from 'state/beanstalk/fertilizer/updater';
import SiloUpdater from 'state/beanstalk/silo/updater';
import FarmerSiloUpdater from 'state/farmer/silo/updater';
import FarmerEventsUpdater from 'state/farmer/events/updater';
import FarmerEventsProcessor from 'state/farmer/processor';
import FarmerBalancesUpdater from 'state/farmer/balances/updater';
import FarmerFertilizerUpdater from 'state/farmer/fertilizer/updater';
import FieldUpdater from 'state/beanstalk/field/updater';
import { BeanstalkPalette } from './muiTheme';
import './App.css';
import WelcomeBackModal from '../Common/WelcomeBackModal';
import BeanAnalytics from '../../pages/analytics/bean';
import SiloAnalytics from '../../pages/analytics/silo';
import FieldAnalytics from '../../pages/analytics/field';
import BarnraiseAnalytics from '../../pages/analytics/barnraise';

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
  const location = useLocation();
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
      <NavBar />
      <CustomToaster />
      {/* only show welcome back modal on non barn-raise pages */}
      {location.pathname !== '/' && <WelcomeBackModal />}
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
            md: 4,
            xs: 2,
          },
          paddingBottom: {
            md: 4,
            xs: 2 
          }
        }}>
        <Routes>
          <Route path="/" element={<BarnRaisePage />} />
          <Route path="/silo" element={<SiloPage />} />
          <Route path="/silo/:address" element={<SiloTokenPage />} />
          <Route path="/field" element={<FieldPage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/history" element={<TransactionHistoryPage />} />
          <Route path="/balances" element={<BalancesPage />} />
          <Route path="/analytics/bean" element={<BeanAnalytics />} />
          <Route path="/analytics/silo" element={<SiloAnalytics />} />
          <Route path="/analytics/field" element={<FieldAnalytics />} />
          <Route path="/analytics/barnraise" element={<BarnraiseAnalytics />} />
        </Routes>
      </Box>
    </>
  );
}

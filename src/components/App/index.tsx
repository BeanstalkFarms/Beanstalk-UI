import React from 'react';
import BigNumber from 'bignumber.js';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box, Card, CssBaseline, Stack, Typography } from '@mui/material';
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
import MarketplacePage from '../../pages/marketplace';

export default function App() {
  const location = useLocation();
  return (
    <>
      <CssBaseline />
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
        }}>
        <Stack direction="row" height="100vh" width="100%" alignItems="center" justifyContent="center">
          <Card sx={{ p: 2 }}>
            <Typography variant="h2" mb={1}>Beanstalk is currently Replanting.</Typography>
            <Typography>The new Beanstalk UI will be launched upon completion of the Replant. See Discord for more information.</Typography>
          </Card>
        </Stack>
      </Box>
    </>
  );
}

import React from 'react';
import BigNumber from 'bignumber.js';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, Typography } from '@mui/material';
import { ToastBar, Toaster } from 'react-hot-toast';
import pageBackground from '~/img/theme/bg-mainnet.png';
import NavBar from '~/components/Nav/NavBar';
import PoolsUpdater from '~/state/bean/pools/updater';
import UnripeUpdater from '~/state/bean/unripe/updater';
import SunUpdater from '~/state/beanstalk/sun/updater';
import BarnUpdater from '~/state/beanstalk/barn/updater';
import SiloUpdater from '~/state/beanstalk/silo/updater';
import FarmerSiloUpdater from '~/state/farmer/silo/updater';
import FarmerFieldUpdater from '~/state/farmer/field/updater';
import FarmerBalancesUpdater from '~/state/farmer/balances/updater';
import FarmerBarnUpdater from '~/state/farmer/barn/updater';
import FarmerMarketUpdater from '~/state/farmer/market/updater';
import FieldUpdater from '~/state/beanstalk/field/updater';
import AppUpdater from '~/state/app/updater';
import SiloPage from '~/pages/silo';
import SiloTokenPage from '~/pages/silo/token';
import FieldPage from '~/pages/field';
import ForecastPage from '~/pages/forecast';
import Barn from '~/pages/barn';
import TransactionHistoryPage from '~/pages/history';
import BalancesPage from '~/pages/balances';
import PodMarketPage from '~/pages/market/pods';
import NFTPage from '~/pages/nft';
import ChopPage from '~/pages/chop';
import MarketAccountPage from '~/pages/market/pods/account';
import MarketActivityPage from '~/pages/market/pods/activity';
import CreatePage from '~/pages/market/pods/create';
import OrderPage from '~/pages/market/pods/order';
import ListingPage from '~/pages/market/pods/listing';
import SwapPage from '~/pages/swap';
import AnalyticsPage from '~/pages/analytics';
import GovernancePage from '~/pages/governance';
import ProposalPage from '~/pages/governance/proposal';
import GovernanceUpdater from '~/state/beanstalk/governance/updater';
import NewProposalsDialog from '~/components/Governance/NewProposalsDialog';
import useNavHeight from '~/hooks/app/usePageDimensions';
import useBanner from '~/hooks/app/useBanner';
import { BeanstalkPalette } from './muiTheme';
import './App.css';
import PageNotFound from '~/pages/error/404';
import { sgEnvKey } from '~/graph/client';
import WellHomePage from '~/pages/market/wells';
import WellPage from '~/pages/market/wells/well';

BigNumber.set({ EXPONENTIAL_AT: [-12, 20] });

const CustomToaster: React.FC<{ navHeight: number }> = ({ navHeight }) => (
  <Toaster
    containerStyle={{
      top: navHeight + 10,
    }}
    toastOptions={{
      duration: 4000,
      position: 'top-right',
      style: {
        minWidth: 300,
        maxWidth: 400,
        paddingLeft: '16px',
      },
    }}
  >
    {(t) => (
      <ToastBar
        toast={t}
        style={{
          ...t.style,
          fontFamily: 'Futura PT',
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
  const banner    = useBanner();
  const navHeight = useNavHeight(!!banner);
  return (
    <>
      <CssBaseline />
      <AppUpdater />
      {/* -----------------------
        * Bean Updaters
        * ----------------------- */}
      <PoolsUpdater />
      <UnripeUpdater />
      {/* -----------------------
        * Beanstalk Updaters
        * ----------------------- */}
      <BarnUpdater />
      <FieldUpdater />
      <SiloUpdater />
      <SunUpdater />
      <GovernanceUpdater />
      {/* -----------------------
        * Farmer Updaters
        * ----------------------- */}
      <FarmerFieldUpdater />
      <FarmerBalancesUpdater />
      <FarmerBarnUpdater />
      <FarmerMarketUpdater />
      <FarmerSiloUpdater />
      {/* -----------------------
        * Content
        * ----------------------- */}
      <NavBar>{banner}</NavBar>
      <CustomToaster
        navHeight={navHeight}
      />
      <NewProposalsDialog />
      <Box
        sx={{
          backgroundColor: BeanstalkPalette.lightBlue,
          backgroundImage: `url(${pageBackground})`,
          backgroundAttachment: 'fixed',
          backgroundPosition: 'bottom center',
          backgroundSize: '100%',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          minHeight: `calc(100vh - ${navHeight}px)`,
          paddingTop: {
            md: 4,
            xs: 2,
          },
          paddingBottom: {
            md: 4,
            xs: 2,
          },
        }}
      >
        <Routes>
          <Route path="/" element={<ForecastPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/balances" element={<BalancesPage />} />
          <Route path="/barn" element={<Barn />} />
          <Route path="/chop" element={<ChopPage />} />
          <Route path="/field" element={<FieldPage />} />
          <Route path="/governance" element={<GovernancePage />} />
          <Route path="/history" element={<TransactionHistoryPage />} />

          {/* Pod Market */}
          <Route path="/market/pods" element={<PodMarketPage />} />
          <Route path="/market/pods/account" element={<MarketAccountPage />} />
          <Route path="/market/pods/activity" element={<MarketActivityPage />} />
          <Route path="/market/pods/create" element={<CreatePage />} />
          <Route path="/market/pods/order/:id" element={<OrderPage />} />
          <Route path="/market/pods/listing/:id" element={<ListingPage />} />

          {/* DEX */}
          <Route path="/market/wells" element={<WellHomePage />} />
          <Route path="/market/wells/:id" element={<WellPage />} />

          <Route path="/nft" element={<NFTPage />} />
          <Route path="/governance/:id" element={<ProposalPage />} />
          <Route path="/silo" element={<SiloPage />} />
          <Route path="/silo/:address" element={<SiloTokenPage />} />
          <Route path="/swap" element={<SwapPage />} />
          <Route path="/404" element={<PageNotFound />} />
          <Route path="*" element={<Navigate replace to="/404" />} />
        </Routes>
        <Box sx={{ position: 'fixed', bottom: 0, right: 0, pr: 1, pb: 0.4, opacity: 0.6, display: { xs: 'none', lg: 'block' } }}>
          <Typography fontSize="small">
            v{import.meta.env.VITE_VERSION || '0.0.0'} &middot; {sgEnvKey}
          </Typography>
        </Box>
      </Box>
    </>
  );
}

import React from 'react';

import { Box, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { ToastBar, Toaster } from 'react-hot-toast';
import { Navigate, Route, Routes } from 'react-router-dom';

import NewProposalsDialog from '~/components/Governance/NewProposalsDialog';
import NavBar from '~/components/Nav/NavBar';

import AppUpdater from '~/state/app/updater';
import PoolsUpdater from '~/state/bean/pools/updater';
import UnripeUpdater from '~/state/bean/unripe/updater';
import BarnUpdater from '~/state/beanstalk/barn/updater';
import FieldUpdater from '~/state/beanstalk/field/updater';
import SiloUpdater from '~/state/beanstalk/silo/updater';
import SunUpdater from '~/state/beanstalk/sun/updater';
import FarmerBalancesUpdater from '~/state/farmer/balances/updater';
import FarmerBarnUpdater from '~/state/farmer/barn/updater';
import FarmerFieldUpdater from '~/state/farmer/field/updater';
import FarmerMarketUpdater from '~/state/farmer/market/updater';
import FarmerSiloUpdater from '~/state/farmer/silo/updater';

import AnalyticsPage from '~/pages/analytics';
import BalancesPage from '~/pages/balances';
import Barn from '~/pages/barn';
import ChopPage from '~/pages/chop';
import PageNotFound from '~/pages/error/404';
import FieldPage from '~/pages/field';
import ForecastPage from '~/pages/forecast';
import GovernancePage from '~/pages/governance';
import ProposalPage from '~/pages/governance/proposal';
import TransactionHistoryPage from '~/pages/history';
import PodMarketPage from '~/pages/market/pods';
import MarketAccountPage from '~/pages/market/pods/account';
import MarketActivityPage from '~/pages/market/pods/activity';
import CreatePage from '~/pages/market/pods/create';
import ListingPage from '~/pages/market/pods/listing';
import OrderPage from '~/pages/market/pods/order';
import NFTPage from '~/pages/nft';
import SiloPage from '~/pages/silo';
import SiloTokenPage from '~/pages/silo/token';
import SwapPage from '~/pages/swap';
import GovernanceUpdater from '~/state/beanstalk/governance/updater';

import { sgEnvKey } from '~/graph/client';
import useBanner from '~/hooks/app/useBanner';
import useNavHeight from '~/hooks/app/usePageDimensions';

import pageBackground from '~/img/beanstalk/interface/bg/Winter-bg.png';

import EnforceNetwork from '~/components/App/EnforceNetwork';
import useAccount from '~/hooks/ledger/useAccount';
import './App.css';

import { FC } from '~/types';
import Snowflakes from './theme/winter/Snowflakes';

BigNumber.set({ EXPONENTIAL_AT: [-12, 20] });

const CustomToaster: FC<{ navHeight: number }> = ({ navHeight }) => (
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
  const banner = useBanner();
  const navHeight = useNavHeight(!!banner);
  const account = useAccount();
  return (
    <>
      {/* -----------------------
       * Appplication Setup
       * ----------------------- */}
      <AppUpdater />
      {/* -----------------------
       * Bean Updaters
       * ----------------------- */}
      <PoolsUpdater />
      <UnripeUpdater />
      {/* -----------------------
       * Beanstalk Updaters
       * ----------------------- */}
      <SiloUpdater />
      <FieldUpdater />
      <BarnUpdater />
      <SunUpdater />
      <GovernanceUpdater />
      {/* -----------------------
       * Farmer Updaters
       * ----------------------- */}
      <FarmerSiloUpdater />
      <FarmerFieldUpdater />
      <FarmerBarnUpdater />
      <FarmerBalancesUpdater />
      <FarmerMarketUpdater />
      {/* -----------------------
       * Routes & Content
       * ----------------------- */}
      <NavBar>{banner}</NavBar>
      <EnforceNetwork />
      <CustomToaster navHeight={navHeight} />
      {account && <NewProposalsDialog />}
      {/* <Leaves /> */}
      <Snowflakes />
      <Box
        sx={{
          bgcolor: 'background.default',
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
        {/* use zIndex to move content over content */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<ForecastPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/balances" element={<BalancesPage />} />
            <Route path="/barn" element={<Barn />} />
            <Route path="/chop" element={<ChopPage />} />
            <Route path="/field" element={<FieldPage />} />
            <Route path="/governance" element={<GovernancePage />} />
            <Route path="/history" element={<TransactionHistoryPage />} />
            <Route path="/market" element={<PodMarketPage />} />
            <Route path="/market/account" element={<MarketAccountPage />} />
            <Route path="/market/activity" element={<MarketActivityPage />} />
            <Route path="/market/create" element={<CreatePage />} />
            <Route path="/market/order/:id" element={<OrderPage />} />
            <Route path="/market/listing/:id" element={<ListingPage />} />
            {/* DEX CODE (hidden) */}
            {/* <Route path="/market/wells" element={<WellHomePage />} /> */}
            {/* <Route path="/market/wells/:id" element={<WellPage />} /> */}
            <Route path="/nft" element={<NFTPage />} />
            <Route path="/governance/:id" element={<ProposalPage />} />
            <Route path="/silo" element={<SiloPage />} />
            <Route path="/silo/:address" element={<SiloTokenPage />} />
            <Route path="/swap" element={<SwapPage />} />
            <Route path="/404" element={<PageNotFound />} />
            <Route path="*" element={<Navigate replace to="/404" />} />
          </Routes>
          <Box
            sx={{
              position: 'fixed',
              bottom: 0,
              right: 0,
              pr: 1,
              pb: 0.4,
              opacity: 0.6,
              display: { xs: 'none', lg: 'block' },
            }}
          >
            <Typography fontSize="small">
              v{import.meta.env.VITE_VERSION || '0.0.0'} &middot; {sgEnvKey}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}

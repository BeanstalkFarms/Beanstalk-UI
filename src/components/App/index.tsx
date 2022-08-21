import React from 'react';
import BigNumber from 'bignumber.js';
import { Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { ToastBar, Toaster } from 'react-hot-toast';
import SiloPage from '~/pages/silo';
import SiloTokenPage from '~/pages/silo/token';
import FieldPage from '~/pages/field';
import ForecastPage from '~/pages/forecast';
import Barn from '~/pages/barn';
import TransactionHistoryPage from '~/pages/history';
import BalancesPage from '~/pages/balances';
// import pageBackgroundGradient from '~/img/theme/bg-mainnet-gradient.png';
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
import { BeanstalkPalette } from './muiTheme';
import './App.css';
import PodMarketPage from '../../pages/market';
import NFTPage from '../../pages/nft';
import ChopPage from '../../pages/chop';
import MarketAccountPage from '../../pages/market/account';
import MarketActivityPage from '../../pages/market/activity';
import CreatePage from '../../pages/market/create';
import OrderPage from '../../pages/market/order';
import ListingPage from '../../pages/market/listing';
import EditListingPage from '../../pages/market/edit-listing';
import EditOrderPage from '../../pages/market/edit-order';
import SwapPage from '../../pages/swap';
import AnalyticsPage from '../../pages/analytics';
import GovernancePage from '~/pages/governance';
import ProposalPage from '~/pages/governance/proposal';
import GovernanceUpdater from '~/state/beanstalk/governance/updater';
import NewProposalsDialog from '~/components/Governance/NewProposalsDialog';
import useNavHeight from '~/hooks/layout/usePageDimensions';
import useBanner from '~/hooks/layout/useBanner';

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
          /// Option 1: Pops up instantly,
          // then slides out to the right side
          // animation: 'none',
          // position: 'absolute',
          // right: t.visible ? 0 : -500,
          // transition: 'right 0.4s ease-in-out',
          // opacity: 1,
          /// Option 2: Slides in and out, but there's
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
          <Route path="/market" element={<PodMarketPage />} />
          <Route path="/market/account" element={<MarketAccountPage />} />
          <Route path="/market/activity" element={<MarketActivityPage />} />
          <Route path="/market/create" element={<CreatePage />} />
          <Route path="/market/order/:id" element={<OrderPage />} />
          <Route path="/market/order/:id/edit" element={<EditOrderPage />} />
          <Route path="/market/listing/:id" element={<ListingPage />} />
          <Route path="/market/listing/:id/edit" element={<EditListingPage />} />
          <Route path="/nft" element={<NFTPage />} />
          <Route path="/governance/:id" element={<ProposalPage />} />
          <Route path="/silo" element={<SiloPage />} />
          <Route path="/silo/:address" element={<SiloTokenPage />} />
          <Route path="/swap" element={<SwapPage />} />
        </Routes>
      </Box>
    </>
  );
}

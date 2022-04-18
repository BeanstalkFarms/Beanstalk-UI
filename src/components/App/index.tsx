import React from 'react';
import BigNumber from 'bignumber.js';
import { Switch, Route, Redirect } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
import { Box, Card, CssBaseline } from '@mui/material';
// import { Toaster } from 'react-hot-toast';

// import { AppState } from 'state';
// import Updater from 'state/userBalance/updater';
// import TokenUpdater from 'state/tokenBalance/updater';
// import NftUpdater from 'state/nfts/updater';
// import { setWidth } from 'state/general/actions';
import Footer from 'components/About/Footer';
import { NavigationBar, NavigationSidebar } from 'components/Navigation';

// import ConnectPage from 'pages/connect';
// import MainPage from 'pages/connect';
// import MarketplacePage from 'pages/market';
// import SiloPage from 'pages/silo';
// import SiloActionsPage from 'pages/silo/actions';
// import FieldPage from 'pages/field';
// import TradePage from 'pages/trade';
// import GovernancePage from 'pages/governance';
// import AnalyticsPage from 'pages/analytics';
// import FundraiserPage from 'pages/fundraiser';
// import BeaNFTPage from 'pages/beanfts';
// import AboutPage from 'pages/about';
// import BalancesPage from 'pages/balances';
// import PegMaintenancePage from 'pages/peg';

import Wrapper from './Wrapper';
// import LoadingBean from './LoadingBean';
import './App.css';

BigNumber.set({ EXPONENTIAL_AT: [-12, 20] });

// const DevHelper = React.lazy(() => (
//   process.env.NODE_ENV === 'development'
//     ? import('./DevHelper')
//     : null
// ));

export default function App() {
  // const dispatch = useDispatch();
  // const {
  //   initialized,
  //   metamaskFailure,
  //   width
  // } = useSelector<AppState, AppState['general']>((state) => state.general);

  // // HANDLE WINDOW SIZE CHANGE
  // // Used throughout the app to show/hide components and
  // // control elements of the theme.
  // const handleWindowSizeChange = () => dispatch(setWidth(window.innerWidth));
  // useEffect(() => {
  //   window.addEventListener('resize', handleWindowSizeChange);
  //   return () => {
  //     window.removeEventListener('resize', handleWindowSizeChange);
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [dispatch]);

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
  //   app = (
  //     <div>
  //       <Switch>
  //         {/* Redirects */}
  //         <Route exact path="/">
  //           <MainPage />
  //         </Route>
  //         {/* If nothing matches, go to the Silo */}
  //         <Redirect to="/" />
  //       </Switch>
  //     </div>
  //   );
  // }

  return (
    <>
      <CssBaseline />
      {/* CONTENT */}
      <Box className="App">
        <Wrapper />
        <Box sx={{ display: 'flex' }}>
          <NavigationSidebar />
          <Box component="main" sx={{ flex: 1, position: 'relative' }}>
            <NavigationBar />
            <div>
              <Switch>
                {/* Redirects */}
                <Route exact path="/">
                  <Box sx={{ width: '100%', height: '90vh', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Card sx={{ p: 4, fontWeight: 500, maxWidth: 500 }}>
                      <h3 style={{ fontWeight: 800 }}>Beanstalk suffered an exploit on 4/17.</h3>
                      <p>The Beanstalk Farms team is investigating the attack and charting a path forward. Please check Discord for more information and updates: <a href="https://discord.gg/beanstalk" target="_blank" rel="noreferrer">https://discord.gg/beanstalk</a></p>
                    </Card>
                  </Box>
                </Route>
                {/* If nothing matches, go to the Silo */}
                <Redirect to="/" />
              </Switch>
            </div>
            <Footer />
          </Box>
        </Box>
        {/* <Suspense fallback={null}><DevHelper /></Suspense> */}
      </Box>
    </>
  );
}

/* <Route exact path="/">
  <Redirect to="/silo" />
</Route>
<Route exact path="/farm">
  <Redirect to="/silo" />
</Route>
<Route path="/analytics">
  <AnalyticsPage />
</Route>
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
<Route exact path="/farm/silo">
  <Redirect to="/silo" />
</Route>
<Route exact path="/farm/silo/:tokenSlug">
  <Redirect to="/silo" />
</Route>
<Route exact path="/farm/field">
  <Redirect to="/field" />
</Route>
<Route exact path="/farm/trade">
  <Redirect to="/trade" />
</Route>
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
</Route> */

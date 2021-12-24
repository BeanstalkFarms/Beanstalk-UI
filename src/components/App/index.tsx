import React, { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import Updater from 'state/userBalance/updater';
import NFTUpdater from 'state/nfts/updater';
import { setWidth } from 'state/general/actions';
import { AppState } from 'state';
// import { NavigationBar } from 'components/Navigation';
import NavigationSidebar from 'components/Navigation/NavigationSidebar';
import {
  FarmPage,
  AnalyticsPage,
  DAOPage,
  BeaNFTPage,
  AboutPage,
  FundraiserPage,
  MetamasklessPage,
} from 'Pages';

import Wrapper from './Wrapper';
import theme from './theme';
import LoadingBean from './LoadingBean';
import './App.css';
import Silo from 'Pages/SiloPage';

BigNumber.set({ EXPONENTIAL_AT: [-12, 20] });

export default function App() {
  const dispatch = useDispatch();
  const { initialized, metamaskFailure } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

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

  let app;
  if (metamaskFailure > -1) {
    app = (
      <>
        {/* <NavigationBar /> */}
        <MetamasklessPage />
      </>
    );
  } else if (!initialized) {
    app = <LoadingBean />;
  } else {
    app = (
      <div>
        {/* <NavigationBar /> */}
        <Switch>
          <Route exact path="/">
            <Redirect to="/silo" />
          </Route>
          <Route exact path="/farm">
            <Redirect to="/silo" />
          </Route>
          <Route exact path="/silo">
            <Silo />
            {/* <Farm sectionNumber={0} /> */}
          </Route>
          <Route exact path="/farm/field">
            <FarmPage sectionNumber={1} />
          </Route>
          <Route exact path="/farm/trade">
            <FarmPage sectionNumber={2} />
          </Route>
          <Route exact path="/farm/balances">
            <FarmPage sectionNumber={3} />
          </Route>
          <Route exact path="/farm/beanfts">
            <FarmPage sectionNumber={4} />
          </Route>
          <Route exact path="/analytics">
            <Redirect to="/analytics/charts" />
          </Route>
          <Route exact path="/analytics/charts">
            <AnalyticsPage sectionNumber={0} />
          </Route>
          <Route exact path="/analytics/seasons">
            <AnalyticsPage sectionNumber={1} />
          </Route>
          <Route exact path="/analytics/balances">
            <AnalyticsPage sectionNumber={2} />
          </Route>
          <Route exact path="/fundraiser">
            <FundraiserPage />
          </Route>
          <Route exact path="/governance">
            <DAOPage />
          </Route>
          <Route exact path="/beanfts">
            <Redirect to="/beanfts/beanft" />
          </Route>
          <Route exact path="/beanfts/beanft">
            <BeaNFTPage sectionNumber={0} />
          </Route>
          <Route exact path="/beanfts/earnnfts">
            <BeaNFTPage sectionNumber={1} />
          </Route>
          <Route exact path="/about">
            <AboutPage key="about" />
          </Route>
          <Redirect to="/farm/silo" />
        </Switch>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* UPDATERS */}
      <Updater />
      <NFTUpdater />
      {/* CONTENT */}
      <Wrapper>
        <Box sx={{ display: 'flex' }}>
          <NavigationSidebar />
          <Box
            component="main"
            sx={{ flexGrow: 1 }}
          >
            {app}
          </Box>
        </Box>
      </Wrapper>
    </ThemeProvider>
  );
}

/* <div style={{ display: "flex", flexDirection: "row" }}>
<NavigationSidebar />
<div>
  {app}
</div>
</div> */

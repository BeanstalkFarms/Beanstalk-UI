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
  Farm,
  Analytics,
  DAO,
  BeaNFT,
  AboutPage,
  FundraiserPage,
  MetamasklessPage,
} from 'Pages';

import Wrapper from './Wrapper';
import theme from './theme';
import LoadingBean from './LoadingBean';
import './App.css';

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
            <Redirect to="/farm/silo" />
          </Route>
          <Route exact path="/farm">
            <Redirect to="/farm/silo" />
          </Route>
          <Route exact path="/farm/silo">
            <Farm sectionNumber={0} />
          </Route>
          <Route exact path="/farm/field">
            <Farm sectionNumber={1} />
          </Route>
          <Route exact path="/farm/trade">
            <Farm sectionNumber={2} />
          </Route>
          <Route exact path="/farm/balances">
            <Farm sectionNumber={3} />
          </Route>
          <Route exact path="/farm/beanfts">
            <Farm sectionNumber={4} />
          </Route>
          <Route exact path="/analytics">
            <Redirect to="/analytics/charts" />
          </Route>
          <Route exact path="/analytics/charts">
            <Analytics sectionNumber={0} />
          </Route>
          <Route exact path="/analytics/seasons">
            <Analytics sectionNumber={1} />
          </Route>
          <Route exact path="/analytics/balances">
            <Analytics sectionNumber={2} />
          </Route>
          <Route exact path="/fundraiser">
            <FundraiserPage />
          </Route>
          <Route exact path="/governance">
            <DAO />
          </Route>
          <Route exact path="/beanfts">
            <Redirect to="/beanfts/beanft" />
          </Route>
          <Route exact path="/beanfts/beanft">
            <BeaNFT sectionNumber={0} />
          </Route>
          <Route exact path="/beanfts/earnnfts">
            <BeaNFT sectionNumber={1} />
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

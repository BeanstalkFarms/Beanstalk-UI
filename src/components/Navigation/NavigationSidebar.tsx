import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  List,
  ListItem,
  Box,
  Drawer,
  ListSubheader,
} from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { makeStyles } from '@material-ui/styles';

import { getAPYs } from 'util/index';
import { AppState } from 'state';
import { theme } from 'constants/index';
import BeanLogo from 'img/bean-logo.svg';
import { setDrawerOpen } from 'state/general/actions';

const NAVIGATION_MAP = {
  farm: [
    {
      path: 'farm/silo',
      title: 'Silo',
      desc: 'Earn interest and governance rights',
    },
    {
      path: 'farm/field',
      title: 'Field',
      desc: 'Help stabilize Beanstalk',
    },
    {
      path: 'farm/trade',
      title: 'Trade',
      desc: 'Buy and sell Beans',
    },
    {
      path: 'marketplace',
      title: 'Marketplace',
      desc: 'Buy and sell pods',
    },
    {
      path: 'governance',
      title: 'DAO',
      desc: 'Vote on the future of Beanstalk',
    },
  ],
  more: [
    {
      path: 'analytics',
      title: 'Analytics',
    },
    {
      path: 'fundraiser',
      title: 'Fundraiser',
    },
    {
      path: 'beanfts',
      title: 'BeaNFTs',
    },
    {
      path: 'about',
      title: 'About',
    },
  ],
};

//
const drawerWidth = 280;
const useStyles = makeStyles({
  root: {
    display: 'flex',
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
  //
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    fontFamily: 'Futura',
    // position: 'relative',
    // zIndex: 9999, // above everything, including header bar
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
  },
  currentPriceStyle: {},
  //
  NavSubheader: {
    fontFamily: 'Futura',
    lineHeight: '24px',
    backgroundColor: '#fff',
  },
  Badge: {
    backgroundColor: theme.secondary,
    color: theme.accentText,
    fontSize: 11.5,
    padding: '2px 5px',
    borderRadius: 4,
  },
  NavLinkHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  NavLinkTitle: {
    fontWeight: 'bold',
    fontSize: 17,
  },
  NavLink: {
    color: 'inherit',
    textDecoration: 'none',
  },
  //
  metrics: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'end',
  },
  metric: {
    fontSize: 13,
    marginTop: 3,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    color: '#555',
  },
  metricValue: {
    color: '#555',
  },
});

const Metric = ({ label, value }) => {
  const classes = useStyles();
  return (
    <Box className={classes.metric}>
      <span className={classes.metricLabel}>{label}</span>
      <span className={classes.metricValue}>{value || '—'}</span>
    </Box>
  );
};

export default function NavigationSidebar() {
  const dispatch = useDispatch();
  const classes = useStyles();

  // Grab state
  const { totalStalk, totalSeeds } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );
  const beansPerSeason = useSelector<AppState, AppState['beansPerSeason']>(
    (state) => state.beansPerSeason
  );
  const weather = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );
  const { beanPrice, ethPrices } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );
  const { totalPods, totalBeans } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );
  const { initialized, drawerOpen, width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  // Calculate APYs.
  // FIXME: these calcs should be done during fetching and not within
  // each respective component. Certain calculations (like fieldAPY)
  // should require that all necessary dependencies be loaded before running calculation.
  const tth = totalPods.dividedBy(beansPerSeason.harvestableMonth);
  const fieldAPY = beansPerSeason.harvestableMonth > 0 ? weather.weather.multipliedBy(8760).dividedBy(tth) : null;
  const [beanAPY] = getAPYs(
    beansPerSeason.farmableMonth,
    parseFloat(totalStalk),
    parseFloat(totalSeeds)
  );

  const marketCap = totalBeans.isGreaterThan(0)
    ? totalBeans.multipliedBy(beanPrice)
    : new BigNumber(0);

  const badgeDataByPath : { [key: string] : string | null } = {
    'farm/silo': initialized && beanAPY ? `${beanAPY.toFixed(0)}%` : null,
    'farm/field': initialized && fieldAPY ? `${fieldAPY.toFixed(0)}%` : null,
    fundraiser: 'Omniscia',
    beanfts: 'Winter',
  };

  //
  let currentBeanPrice = null;
  if (beanPrice !== undefined && beanPrice.isGreaterThan(0)) {
    currentBeanPrice = (
      <Box className={classes.currentPriceStyle}>
        {`$${beanPrice.toFixed(4)}`}
      </Box>
    );
  }

  //
  const NavItem = ({ item }: { item: any }) => (
    <NavLink
      to={`/${item.path}`}
      spy="true"
      smooth="true"
      className={classes.NavLink}
    >
      <ListItem button style={{ display: 'block' }}>
        <Box className={classes.NavLinkHeader}>
          <span className={classes.NavLinkTitle} style={{ marginRight: 8 }}>{item.title}</span>
          {!!badgeDataByPath[item.path] && (
            <span className={classes.Badge}>
              {badgeDataByPath[item.path]}
            </span>
          )}
        </Box>
        {item.desc && (
          <Box>
            <span>{item.desc}</span>
          </Box>
        )}
      </ListItem>
    </NavLink>
  );

  const drawerContent = (
    <>
      <Box className="App-logo" p={2}>
        <img
          className="svg"
          name={theme.name}
          height="36px"
          src={BeanLogo}
          alt="bean.money"
        />
        <span style={{ fontSize: 14 }}>
          {currentBeanPrice}
        </span>
      </Box>
      {/**
        * Farm section */}
      <List subheader={
        <ListSubheader component="div" className={classes.NavSubheader} id="nested-list-subheader">
          FARM
        </ListSubheader>
      }>
        {NAVIGATION_MAP.farm.map((item: any) => <NavItem item={item} key={item.path} />)}
      </List>
      {/**
        * More section */}
      <List subheader={
        <ListSubheader component="div" className={classes.NavSubheader} id="nested-list-subheader">
          MORE
        </ListSubheader>
      }>
        {NAVIGATION_MAP.more.map((item: any) => <NavItem item={item} key={item.path} />)}
      </List>
      <Box p={2} className={classes.metrics}>
        <Metric label="Mkt. Cap" value={marketCap?.isGreaterThan(0) && `$${marketCap.dividedBy(10 ** 6).toFixed(1)}M`} />
        <Metric label="Pod Line" value={totalPods?.isGreaterThan(0) && `${totalPods.dividedBy(10 ** 6).toFixed(1)}M`} />
        <Metric label="Harvested" value={weather?.harvestableIndex?.isGreaterThan(0) && `${weather.harvestableIndex.dividedBy(10 ** 6).toFixed(1)}M`} />
        <Metric label="Weather" value={weather?.weather?.isGreaterThan(0) && `${weather.weather.toFixed(0)}%`} />
        <Metric label="ETH" value={ethPrices?.ethPrice && ethPrices.ethPrice > 0 && `$${ethPrices.ethPrice}`} />
        <Metric label="Gas" value={ethPrices?.propose && ethPrices.propose > 0 && `${ethPrices.propose} gwei`} />
      </Box>
    </>
  );

  return (
    <Drawer
      variant={width < 800 ? 'temporary' : 'permanent'}
      className={classes.drawer}
      classes={{ paper: classes.drawerPaper }}
      anchor="left"
      open={width < 800 && drawerOpen}
      onClose={width < 800 ? () => dispatch(setDrawerOpen(!drawerOpen)) : undefined}
    >
      {drawerContent}
    </Drawer>
  );
}

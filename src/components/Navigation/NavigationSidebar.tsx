import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  List,
  ListItem,
  Box,
  Drawer,
  ListSubheader,
  CircularProgress,
} from '@mui/material';
import BigNumber from 'bignumber.js';

import { AppState } from 'state';
import { BEAN, theme } from 'constants/index';
import BeanLogo from 'img/bean-logo.svg';
import { setDrawerOpen } from 'state/general/actions';
import { getAPYs, percentForStalk, toTokenUnitsBN } from 'util/index';
import { useStyles } from './NavigationStyles.ts';
import PriceTooltip from './PriceTooltip';

const NAVIGATION_MAP = {
  farm: [
    {
      path: 'silo',
      title: 'Silo',
      desc: 'Earn interest and governance rights',
    },
    {
      path: 'field',
      title: 'Field',
      desc: 'Lend to Beanstalk',
    },
    {
      path: 'trade',
      title: 'Trade',
      desc: 'Buy and sell Beans',
    },
    {
      path: 'market',
      title: 'Market',
      desc: 'Buy and sell Pods',
    },
    {
      path: 'governance',
      title: 'DAO',
      desc: 'Vote on the future of Beanstalk',
    },
    {
      path: 'balances',
      title: 'Balances',
      desc: 'View Beanstalk balances',
    },
  ],
  more: [
    {
      path: 'analytics',
      title: 'Analytics',
    },
    {
      path: 'peg',
      title: 'Peg Maintenance',
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

const Metric = ({ label, value, hideIfNull = false }) => {
  const classes = useStyles();
  if (hideIfNull && !value) return null;
  return (
    <Box className={classes.metric}>
      <span className={classes.metricLabel}>{label}</span>
      <span className={classes.metricValue}>{value || '—'}</span>
    </Box>
  );
};

const Badge = ({ badge, percent, type }) => {
  const classes = useStyles();
  return (
    <Box component="span" className={classes.bipBadgeContainer}>
      <Box className={classes.progressContain}>
        <CircularProgress
          key="blackground"
          size={10}
          className={classes.progressBackground}
          color="inherit"
          thickness={8}
          variant="determinate"
          value={100}
        />
        <CircularProgress
          key="primary"
          size={10}
          className={classes.progressPrimary}
          color="inherit"
          thickness={8}
          variant="determinate"
          value={percent}
        />
      </Box>
      <span>
        {type === 'bips' ? `BIP-${badge.id}` : `FUND-${badge.id}`}
      </span>
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
  const { farmableMonth } = useSelector<AppState, AppState['beansPerSeason']>(
    (state) => state.beansPerSeason
  );
  const weather = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );
  const { beanPrice, ethPrices, usdcPrice } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );
  const { totalPods, totalBeans, totalRoots } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );
  const { initialized, drawerOpen, width, bips, fundraisers } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  const activeBips = bips.reduce((aBips, bip) => {
    if (bip.active) {
      const voted = percentForStalk(
        bip.roots,
        bip.endTotalRoots.isGreaterThan(0)
          ? bip.endTotalRoots
          : totalRoots
      );
      aBips.push(<Badge badge={bip} percent={voted} type="bips" />);
    }
    return aBips;
  }, []);

  const activeFundraisers = fundraisers.reduce((afundraisers, fundraiser) => {
    if (fundraiser.remaining.isGreaterThan(0)) {
      const percentFunded = fundraiser.total
        .minus(fundraiser.remaining)
        .dividedBy(fundraiser.total)
        .multipliedBy(new BigNumber(100));

      afundraisers.push(<Badge badge={fundraiser} percent={percentFunded} type="funds" />);
    }
    return afundraisers;
  }, []);

  // on each render, grab APY array
  const apys = getAPYs(
    farmableMonth,
    parseFloat(totalStalk),
    parseFloat(totalSeeds)
  );

  // Calculate APYs.
  // FIXME: these calcs should be done during fetching and not within
  // each respective component. Certain calculations (like fieldAPY)
  // should require that all necessary dependencies be loaded before running calculation.
  // const tth = totalPods.dividedBy(beansPerSeason.harvestableMonth);
  // const fieldAPY = beansPerSeason.harvestableMonth > 0 ? weather.weather.multipliedBy(8760).dividedBy(tth) : null;
  // const [beanAPY] = getAPYs(
  //   beansPerSeason.farmableMonth,
  //   parseFloat(totalStalk),
  //   parseFloat(totalSeeds)
  // );

  const marketCap = totalBeans.isGreaterThan(0)
    ? totalBeans.multipliedBy(beanPrice)
    : new BigNumber(0);

  // Add Fundraiser page to Nav Sidebar if active Fundraiser
  // function addActiveFundraiserNav(navMap) {
  //   if (Object.keys(navMap.more).length < 6 && activeFundraisers.length > 0) {
  //     navMap.more.push(
  //       {
  //         path: 'fundraiser',
  //         title: 'Fundraiser',
  //         desc: 'Fundraise Beanstalk proposals',
  //       }
  //     );
  //   }
  //   return navMap;
  // }

  // Add badge to Sidebar nav
  const badgeDataByPath : { [key: string] : string | any[] | null } = {
    silo: initialized ? (
      `${apys[0][0].toFixed(0)}% - ${apys[1][0].toFixed(0)}%`
    ) : null,
    field: initialized && weather ? `${weather.weather.toFixed(0)}%` : null,
    beanfts: 'Winter',
    poker: '3/5 · 5:30P PT'
  };

  // Add conditional badges
  if (activeBips.length > 0) {
    badgeDataByPath.governance = activeBips.slice(0, 3);
  }
  if (activeFundraisers.length > 0) {
    badgeDataByPath.fundraiser = activeFundraisers;
    // addActiveFundraiserNav(NAVIGATION_MAP);
  }

  const currentBeanPrice = (
    <PriceTooltip
      isMobile={width < 800}
    />
  );

  //
  const NavItem = ({ item }: { item: any }) => (
    <NavLink
      to={`/${item.path}`}
      spy="true"
      smooth="true"
      className={classes.NavLink}
      onClick={() => dispatch(setDrawerOpen(false))}
    >
      <ListItem button className={classes.blockDisplay}>
        <Box className={classes.NavLinkHeader}>
          <span className={classes.NavLinkTitle}>{item.title}</span>
          {!!badgeDataByPath[item.path] && (
            Array.isArray(badgeDataByPath[item.path]) ? (
              (badgeDataByPath[item.path] as any[]).map((val, index) => (
                <span key={index} className={classes.Badge}>{val}</span>
              ))
            ) : (
              <span className={classes.Badge}>{badgeDataByPath[item.path]}</span>
            )
          )}
        </Box>
        {item.desc && (
          <Box className={classes.NavLinkDesc}>{item.desc}</Box>
        )}
      </ListItem>
    </NavLink>
  );

  const drawerContent = (
    <>
      <Box className={classes.logoPriceBar} p={2} pt={1}>
        <a href="https://bean.money" className={classes.beanLogoLink}>
          <img
            className={classes.beanLogoImage}
            name={theme.name}
            height="36px"
            src={BeanLogo}
            alt="app.bean.money"
          />
        </a>
        {currentBeanPrice}
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
        {activeFundraisers.length > 0 ? (
          <NavItem
            item={
              {
                path: 'fundraiser',
                title: 'Fundraiser',
                desc: 'Fundraise Beanstalk proposals',
              }
            }
          />
        ) : null}
        {NAVIGATION_MAP.more.map((item: any) => <NavItem item={item} key={item.path} />)}
      </List>
      <Box p={2} className={classes.metrics}>
        <Metric label="Mkt. Cap" value={marketCap?.isGreaterThan(0) && `$${toTokenUnitsBN(marketCap, BEAN.decimals).toFixed(1)}M`} hideIfNull />
        <Metric label="Pod Line" value={totalPods?.isGreaterThan(0) && `${toTokenUnitsBN(totalPods, BEAN.decimals).toFixed(1)}M`} hideIfNull />
        <Metric label="Harvested" value={weather?.harvestableIndex?.isGreaterThan(0) && `${toTokenUnitsBN(weather.harvestableIndex, BEAN.decimals).toFixed(1)}M`} hideIfNull />
        <Metric label="Weather" value={weather?.weather?.isGreaterThan(0) && `${weather.weather.toFixed(0)}%`} hideIfNull />
        <Metric label="ETH" value={usdcPrice && usdcPrice > 0 && `$${(1 / usdcPrice).toFixed(2)}`} hideIfNull />
        <Metric label="Gas" value={ethPrices?.propose && ethPrices.propose > 0 && `${ethPrices.propose} gwei`} hideIfNull />
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

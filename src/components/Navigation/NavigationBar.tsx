import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Button,
  ClickAwayListener,
  Container,
  Grow,
  IconButton,
  List,
  ListItem,
  MenuList,
  MenuItem,
  Paper,
  Popper,
  Toolbar,
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import MenuIcon from '@material-ui/icons/Menu';
import { AppState } from 'state';
import { priceQuery } from 'graph/index';
import { theme } from 'constants/index';
import BeanLogo from 'img/bean-logo.svg';
import WalletModule from './WalletModule';
import { setDrawerOpen } from 'state/general/actions';

const defaultNavMapping = [
  {
    path: 'farm',
    title: 'FARM',
  },
  {
    path: 'analytics',
    title: 'ANALYTICS',
  },
  {
    path: 'governance',
    title: 'DAO',
  },
  {
    path: 'beanfts',
    title: 'BeaNFTs',
  },
  {
    path: 'about',
    title: 'ABOUT',
  },
];

//
// type NavigationBarProps = {
//   showWallet?: boolean;
// }

const useStyles = makeStyles({
  // fixedNav: {
  //   zIndex: '10000',
  //   backgroundColor: 'transparent',
  //   backgroundImage: `url(${theme.cloud}), url(${theme.cloud})`,
  //   backgroundPosition: '0px 0px, 1px 0px',
  //   backgroundRepeat: 'repeat-x, repeat-x',
  //   backgroundSize: width > 900 ? 'contain, contain' : 'cover',
  //   boxShadow: 'none',
  //   height: '90px',
  //   position: 'fixed',
  //   width: '100%',
  // },
  // navDisplayFlex: {
  //   display: 'flex',
  //   justifyContent: 'space-between',
  // },
  // linkText: {
  //   borderRadius: '16px',
  //   color: 'black',
  //   fontFamily: 'Futura-PT-Book',
  //   fontSize: '15px',
  //   margin: '8px 4px',
  //   padding: '0px !important',
  //   textDecoration: 'none',
  //   // textTransform: 'uppercase'
  // },
  // linkPadding: {
  //   borderRadius: '16px',
  //   padding: '8px 8px',
  //   color: 'black',
  //   textDecoration: 'none',
  // },
  // activeLinkText: {
  //   backgroundColor: theme.navSelection,
  // },
  // currentPriceStyle: {
  //   color: 'black',
  //   fontFamily: 'Futura-PT-Book',
  //   fontSize: '15px',
  //   paddingLeft: '15px',
  // },
  appBar: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
  menuIcon: {
    color: "#fff",
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});

// FIXME:
// - Why are there two separate calls for `price` and `beanPrice`?
export default function NavigationBar(props) {
  const dispatch = useDispatch()
  const classes = useStyles();
  const { drawerOpen, width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );
  const toggleDrawerOpen = () => dispatch(setDrawerOpen(!drawerOpen))
  return (
    <AppBar className={classes.appBar} position="static">
      <Toolbar className={classes.toolbar}>
        {width < 800 ? (
          <IconButton edge="start" aria-label="menu" onClick={toggleDrawerOpen}>
            <MenuIcon className={classes.menuIcon} />
          </IconButton>
        ) : <Box />}
        <Box>
          <WalletModule />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

NavigationBar.defaultProps = {
  links: [],
  showWallet: true,
};

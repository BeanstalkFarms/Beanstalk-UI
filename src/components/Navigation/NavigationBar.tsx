import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
import GasPump from 'img/gas-pump.svg';
import EthLogo from 'img/eth-logo.svg';
import WalletModule from './WalletModule';

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
    path: 'dao',
    title: 'DAO',
  },
  {
    path: 'nft',
    title: 'BeaNFTs',
  },
  {
    path: 'about',
    title: 'ABOUT',
  },
];

export default function NavigationBar(props) {
  const [price, setPrice] = useState(0);
  const { beanPrice, ethPrices } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  const { bips } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  const { hasActiveFundraiser } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  const classes = makeStyles({
    fixedNav: {
      zIndex: '10000',
      backgroundColor: 'transparent',
      backgroundImage: `url(${theme.cloud}), url(${theme.cloud})`,
      backgroundPosition: '0px 0px, 1px 0px',
      backgroundRepeat: 'repeat-x, repeat-x',
      backgroundSize: 'contain, contain',
      boxShadow: 'none',
      height: '85px',
      position: 'fixed',
      width: '100%',
    },
    navDisplayFlex: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    linkText: {
      borderRadius: '16px',
      color: 'black',
      fontFamily: 'Futura-PT-Book',
      fontSize: '15px',
      margin: '8px 4px',
      padding: '0px !important',
      textDecoration: 'none',
      // textTransform: 'uppercase'
    },
    linkPadding: {
      borderRadius: '16px',
      padding: '8px 8px',
      color: 'black',
      textDecoration: 'none',
    },
    activeLinkText: {
      backgroundColor: theme.navSelection,
    },
    currentPriceStyle: {
      color: 'black',
      fontFamily: 'Futura-PT-Book',
      fontSize: '15px',
      paddingLeft: '15px',
    },
    priceStyles: {
      color: 'black',
      fontFamily: 'Futura-PT-Book',
      fontSize: '15px',
      paddingLeft: '15px',
    },
  })();

  useEffect(() => {
    async function getPrice() {
      setPrice(await priceQuery());
    }

    getPrice();
  }, []);

  const anchorRef = React.useRef<any>(null);
  const pricesAnchorRef = React.useRef<any>(null);
  const [open, setOpen] = React.useState(false);
  const [pricesOpen, setPricesOpen] = React.useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handlePricesToggle = () => {
    setPricesOpen((prevOpen) => !prevOpen);
  };
  const handlePricesClose = () => {
    setPricesOpen(false);
  };

  let hasActiveBIP = false;
  try {
    hasActiveBIP = bips[bips.length - 1].active;
  } catch (error) {
    return false;
  }

  const navMapping = [...defaultNavMapping];
  if (hasActiveFundraiser) {
    navMapping.splice(3, 0, {
      path: 'fundraiser',
      title: 'FUNDRAISER',
    });
  }

  const linkItemStyle = (path) => {
    if (
      (path === 'dao' && hasActiveBIP !== false) ||
      (path === 'fundraiser' && hasActiveFundraiser !== false)) {
      return { color: theme.activeSection };
    }
    return null;
  };
  let currentBeanPrice = null;
  if (beanPrice !== undefined && beanPrice > 0) {
    currentBeanPrice = (
      <Box className={classes.currentPriceStyle}>
        {`$${beanPrice.toFixed(4)}`}
      </Box>
    );
  } else if (price > 0) {
    currentBeanPrice = (
      <Box className={classes.currentPriceStyle}>{`$${price.toFixed(4)}`}</Box>
    );
  }

  const beanLogo = (
    <IconButton edge="start" color="inherit" className="App-logo">
      <img
        className="svg"
        name={theme.name}
        height="36px"
        src={BeanLogo}
        alt="bean.money"
      />
      {currentBeanPrice}
    </IconButton>
  );

  let ethGasPrice = null;
  if (ethPrices?.safe ?? ethPrices?.fast ?? ethPrices?.propose) {
    ethGasPrice = (
      <Box className={classes.priceStyles}>
        {`${ethPrices.propose}`}
      </Box>
    );
  }
  const ethGasPriceLogo = (
    <IconButton edge="start" className="App-priceLogo">
      <img
        name={theme.name}
        color="black"
        height="24px"
        src={GasPump}
        alt="gas price"
      />
      {ethGasPrice}
    </IconButton>
  );

  let ethPrice = null;
  if (ethPrices?.ethPrice) {
    ethPrice = (
      <Box className={classes.priceStyles}>
        {`${ethPrices.ethPrice}`}
      </Box>
    );
  }
  const ethPriceLogo = (
    <IconButton edge="start" className="App-priceLogo">
      <img
        name={theme.name}
        color="black"
        height="24px"
        src={EthLogo}
        alt="gas price"
      />
      {ethPrice}
    </IconButton>
  );
  const mobileNavigation = (
    <Box className="NavigationBarHamburger">
      <List
        component="nav"
        aria-labelledby="main navigation"
        className={classes.navDisplayFlex}
      >
        {props.showWallet ? (
          <ListItem>
            <WalletModule {...props} />
          </ListItem>
        ) : null}
      </List>
      <Button
        ref={anchorRef}
        style={{ height: '97%' }}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <MenuIcon />
      </Button>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              backgroundColor: theme.menuColor,
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem={open} id="menu-list-grow">
                  {navMapping.map(({ title, path }) => (
                    <MenuItem
                      key={path}
                      button
                      className={classes.linkText}
                      style={linkItemStyle(path)}
                    >
                      <NavLink
                        to={path}
                        activeClassName={classes.activeLinkText}
                        className={classes.linkPadding}
                        style={linkItemStyle(path)}
                      >
                        {title}
                      </NavLink>
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
  const mobilePricesNav = (
    <Box className="NavigationBarHamburger">
      <Button
        ref={pricesAnchorRef}
        style={{ height: '97%' }}
        aria-controls={pricesOpen ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handlePricesToggle}
      >
        {beanLogo}
      </Button>
      <Popper
        open={pricesOpen}
        anchorEl={pricesAnchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              backgroundColor: theme.menuColor,
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handlePricesClose}>
                <MenuList autoFocusItem={pricesOpen} id="menu-list-grow" style={{ display: 'grid' }}>
                  {ethPriceLogo}
                  {ethGasPriceLogo}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );

  const desktopNavigation = (
    <List
      component="nav"
      aria-labelledby="main navigation"
      className="NavigationBar"
    >
      {navMapping.map(({ title, path }) => (
        <ListItem
          key={path}
          button
          className={classes.linkText}
          style={linkItemStyle(path)}
        >
          <NavLink
            to={path}
            activeClassName={classes.activeLinkText}
            className={classes.linkPadding}
            spy="true"
            smooth="true"
            style={linkItemStyle(path)}
          >
            {title}
          </NavLink>
        </ListItem>
      ))}
      {props.showWallet ? (
        <ListItem>
          <WalletModule {...props} />
        </ListItem>
      ) : null}
    </List>
  );
  const desktopPricesNav = (
    <List
      component="nav"
      aria-labelledby="main navigation"
      className="NavigationBar"
    >
      {beanLogo}
      {ethPriceLogo}
      {ethGasPriceLogo}
    </List>
  );

  return (
    <AppBar className={classes.fixedNav}>
      <Toolbar>
        <Container className={classes.navDisplayFlex}>
          {mobilePricesNav}
          {desktopPricesNav}
          {mobileNavigation}
          {desktopNavigation}
        </Container>
      </Toolbar>
    </AppBar>
  );
}
NavigationBar.defaultProps = {
  links: [],
  showWallet: true,
};

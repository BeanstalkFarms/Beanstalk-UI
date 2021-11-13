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
import BeanLogo from '../../img/bean-logo.svg';
import { chainId } from '../../util';
import WalletModule from './WalletModule';
import { priceQuery } from '../../graph';
import { theme } from '../../constants';

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
  const { beanPrice } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
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
      margin: '4px',
      padding: '0px !important',
      textDecoration: 'none',
      // textTransform: 'uppercase'
    },
    linkPadding: {
      borderRadius: '16px',
      padding: '12px 18px',
      color: 'black',
      textDecoration: 'none',
    },
    activeLinkText: {
      backgroundColor: theme.navSelection,
    },
    activeAboutLinkText: {
      backgroundColor: theme.navSelection,
      borderRadius: '16px',
      padding: '12px 18px',
      textDecoration: 'none',
    },
    currentPriceStyle: {
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
  const [open, setOpen] = React.useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const linkItemStyle = (path) => {
    if (path === 'governance') {
      return { color: theme.activeSection };
    }
    return null;
  };

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
                  {defaultNavMapping.map(({ title, path }) => (
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

  const desktopNavigation = (
    <List
      component="nav"
      aria-labelledby="main navigation"
      className="NavigationBar"
    >
      {defaultNavMapping.map(({ title, path }) => (
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
            spy
            smooth
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

  const beanLogoFilter =
    chainId === 3
      ? {
          filter:
            'invert(62%) sepia(71%) saturate(5742%) hue-rotate(312deg) brightness(103%) contrast(101%)',
        }
      : null;

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
        style={beanLogoFilter}
        height="36px"
        src={BeanLogo}
        alt="bean.money"
      />
      {currentBeanPrice}
    </IconButton>
  );

  return (
    <AppBar className={classes.fixedNav}>
      <Toolbar>
        <Container className={classes.navDisplayFlex}>
          {beanLogo}
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

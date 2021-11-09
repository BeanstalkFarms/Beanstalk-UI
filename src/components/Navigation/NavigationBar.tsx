import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
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
import BeanLogo from '../../img/bean-logo.svg';
import { chainId } from '../../util';
import WalletModule from './WalletModule';
import { priceQuery } from '../../graph';
import { theme } from '../../constants';

export default function NavigationBar(props) {
  const [price, setPrice] = useState(0);

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
      backgroundColor: '#61dafb38',
    },
    activeAboutLinkText: {
      backgroundColor: '#61dafb38',
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

  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  function handleScroll() {
    const windowHeight =
      'innerHeight' in window
        ? window.innerHeight
        : document.documentElement.offsetHeight;
    const { body } = document;
    const html = document.documentElement;
    const docHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
    const windowBottom = windowHeight + window.pageYOffset;
    setIsScrolledToBottom(windowBottom >= docHeight);
    localStorage.setItem('scrollPosition', window.pageYOffset);
  }
  useEffect(() => {
    const scrollY = localStorage.getItem('scrollPosition');
    if (scrollY !== undefined) window.scrollTo(0, scrollY);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const linkItemStyle = (path) =>
    (path === 'governance'
      ? { color: 'rgb(14, 136, 55)' }
      : null);

  const mobileNavigation = (
    <Box className="NavigationBarHamburger">
      <List
        component="nav"
        aria-labelledby="main navigation"
        className={classes.navDisplayFlex}
      >
        {props.showWallet ?
          <ListItem>
            <WalletModule {...props} />
          </ListItem>
        : null}
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
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem={open} id="menu-list-grow">
                  {props.links.map(({ title, path }) => (
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
      {props.links.map(({ title, path }) => (
        <ListItem
          key={path}
          button
          className={classes.linkText}
          style={linkItemStyle(path)}
        >
          <NavLink
            to={path}
            activeClassName={classes.activeLinkText}
            className={
              path === props.links[props.links.length - 1].path && isScrolledToBottom
                ? classes.activeAboutLinkText
                : classes.linkPadding
            }
            spy
            smooth
          >
            {title}
          </NavLink>
        </ListItem>
      ))}
      {props.showWallet ?
        <ListItem>
          <WalletModule {...props} />
        </ListItem>
      : null}
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
  if (props.beanPrice !== undefined) {
    currentBeanPrice = (
      <Box className={classes.currentPriceStyle}>
        {`$${props.beanPrice.toFixed(4)}`}
      </Box>
    );
  } else if (price > 0) {
    currentBeanPrice = (
      <Box className={classes.currentPriceStyle}>
        {`$${price.toFixed(4)}`}
      </Box>
    );
  }

  const beanLogo = (
    <IconButton edge="start" color="inherit" className="App-logo">
      <img
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

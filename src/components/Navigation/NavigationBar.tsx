import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  IconButton,
  Toolbar,
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import MenuIcon from '@material-ui/icons/Menu';
import { AppState } from 'state';
import { setDrawerOpen } from 'state/general/actions';
import { theme } from 'constants/index';
import WalletModule from './WalletModule';

const useStyles = makeStyles({
  appBar: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(2px)',
    boxShadow: 'none',
    marginBottom: 12,
    fontFamily: 'Futura',
  },
  menuIconContain: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    color: theme.accentText,
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default function NavigationBar() {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { drawerOpen, width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );
  const { beanPrice } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );
  const toggleDrawerOpen = () => dispatch(setDrawerOpen(!drawerOpen));

  const priceStyle = {
    fontSize: 13,
    lineHeight: '13px',
    color: theme.backgroundText,
    marginLeft: '10px',
  };

  return (
    <AppBar className={classes.appBar} position="sticky">
      <Toolbar className={classes.toolbar}>
        {width < 800 ? (
          <Box className={classes.menuIconContain}>
            <IconButton edge="start" aria-label="menu" onClick={toggleDrawerOpen} style={{ backgroundColor: theme.secondary }}>
              <MenuIcon className={classes.menuIcon} />
            </IconButton>
            {beanPrice && beanPrice.isGreaterThan(0) && (
              <Box
                style={priceStyle}
              >
                ${beanPrice.toFixed(4)}
              </Box>
            )}
          </Box>
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

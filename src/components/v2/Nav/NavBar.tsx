import React, { useState } from 'react';
import { AppBar, Button, IconButton, Menu, MenuItem, Stack } from '@mui/material';
import { Link as RouterLink, useMatch, useResolvedPath } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import beanCircleIcon from 'img/bean-circle.svg';
import swapIcon from 'img/swap.svg';
import { BeanstalkPalette } from 'components/App/muiTheme';
import WalletButton from '../Common/WalletButton';
import NetworkButton from '../Common/NetworkButton';

const NAVIGATION_MAP = {
  top: [
    {
      path: '/',
      title: 'Forecast',
    },
    {
      path: '/silo',
      title: 'Silo',
    },
    {
      path: '/field',
      title: 'Field',
    },
  ],
  more: [
    {
      path: 'governance',
      title: 'DAO',
    },
    {
      path: 'balances',
      title: 'Balances',
    },
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

const NavButton : React.FC<{ to: string; title: string }> = ({ to, title }) => {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: true });
  // const match = to === "";
  return (
    <Button
      component={RouterLink}
      to={to}
      size="small"
      variant="text"
      color={match ? 'primary' : 'dark'}
      sx={{ 
        textDecoration: match ? 'underline' : null,
        '&:hover': {
          textDecoration: match ? 'underline' : null,
          textDecorationThickness: '2px',
        },
        textDecorationThickness: '2px',
        minWidth: 0,
        px: 1.5,
      }}
    >
      {title}
    </Button>
  );
};

const MoreButton : React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  return (
    <>
      <Button
        size="small"
        variant="text"
        color="dark"
        endIcon={<ArrowDropDownIcon />}
        onClick={handleClick}
        sx={{
          px: 1.5
        }}
      >
        More
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        // https://mui.com/material-ui/react-popover/#anchor-playground
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>
    </>
  );
};

const NavBar : React.FC<{}> = () => (
  <AppBar sx={{ px: 1, py: 1, backgroundColor: BeanstalkPalette.lighterBlue, borderBottom: `1px solid ${BeanstalkPalette.lightBlue}` }}>
    <Stack direction="row" gap={1} alignItems="center">
      <Button
        color="light"
        startIcon={<img src={beanCircleIcon} alt="Bean" style={{ height: 25 }} />}
        endIcon={<ArrowDropDownIcon />}>
        $1.0031
      </Button>
      <Stack direction="row" sx={{ flex: 1 }}>
        {NAVIGATION_MAP.top.map((item) => (
          <NavButton to={item.path} title={item.title} />
      ))}
        <MoreButton />
      </Stack>
      <IconButton color="light" variant="contained">
        <img src={swapIcon} alt="Swap" />
      </IconButton>
      <NetworkButton />
      <WalletButton />
    </Stack>
  </AppBar>
);

export default NavBar;

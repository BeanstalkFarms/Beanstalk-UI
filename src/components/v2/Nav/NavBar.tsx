import React, { useCallback, useState } from 'react';
import { AppBar, Button, IconButton, Menu, MenuItem, Stack } from '@mui/material';
import { Link as RouterLink, useMatch, useResolvedPath } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import swapIcon from 'img/swap.svg';
import { BeanstalkPalette } from 'components/v2/App/muiTheme';
import WalletButton from '../Common/WalletButton';
import NetworkButton from '../Common/NetworkButton';
import PriceButton from './PriceButton';

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
    {
      path: '/balances',
      title: 'Balances',
    },
    {
      path: '/barn-raise',
      title: 'Barn Raise',
    },
  ],
  more: [
    {
      path: 'governance',
      title: 'Governance',
    },
    {
      path: 'trade',
      title: 'Trade',
    },
    {
      path: 'analytics',
      title: 'Analytics',
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

  // Handlers
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  
  return (
    <>
      <Button
        size="small"
        variant="text"
        color="dark"
        endIcon={<ArrowDropDownIcon />}
        onMouseOver={handleClick}
        sx={{
          px: 1.5,
          cursor: 'pointer', 
        }}
        className={open ? 'Mui-focusVisible' : ''}
      >
        More
      </Button>
      <Menu
        id="basic-menu"
        elevation={1}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
          onMouseLeave: handleClose,
          sx: {
            cursor: 'pointer'
          }
        }}
        // https://mui.com/material-ui/react-popover/#anchor-playground
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {NAVIGATION_MAP.more.map((item) => <MenuItem component={RouterLink} key={item.path} to={item.path} sx={{ minWidth: 200 }}>{item.title}</MenuItem>)}
      </Menu>
    </>
  );
};

const NavBar : React.FC<{}> = () => (
  <AppBar sx={{ px: 1, py: 1, backgroundColor: BeanstalkPalette.lighterBlue, borderBottom: `1px solid ${BeanstalkPalette.lightBlue}` }}>
    <Stack direction="row" gap={1} alignItems="center">
      <Stack direction="row" sx={{ flex: 1 }}>
        <PriceButton />
        {NAVIGATION_MAP.top.map((item) => <NavButton key={item.path} to={item.path} title={item.title} />)}
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

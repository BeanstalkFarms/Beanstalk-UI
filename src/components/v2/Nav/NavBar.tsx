import React, { useCallback, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  ListItem,
  ListItemButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  List,
  ListItemText,
} from '@mui/material';
import {
  Link as RouterLink,
  useMatch,
  useResolvedPath,
} from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';

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
    // {
    //   path: '/balances',
    //   title: 'Balances',
    // },
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

const NavButton: React.FC<{ to: string; title: string }> = ({ to, title }) => {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: true });
  // const match = to === "";
  return (
    <Button
      disableRipple
      component={RouterLink}
      to={to}
      size="small"
      variant="text"
      outline="none"
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
      {' '}
      <Typography variant="subtitle1">{title}</Typography>
    </Button>
  );
};

const MoreButton: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Handlers
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );
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
          // cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '400',
        }}
        className={open ? 'Mui-focusVisible' : ''}
      >
        <Typography variant="subtitle1">More</Typography>
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
            cursor: 'pointer',
          },
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
        {NAVIGATION_MAP.more.map((item) => (
          <MenuItem
            component={RouterLink}
            key={item.path}
            to={item.path}
            sx={{ minWidth: 200 }}
          >
            {item.title}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const NavBar: React.FC<{}> = () => {
  const [open, setOpen] = useState(false);
  // const beanPrice = useSelector<AppState, AppState['_bean']['price']>(
  //   (state) => state._bean.price
  // );
  return (
    <>
      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ height: '100vh' }}
        transitionDuration={0}
      >
        <Box sx={{ backgroundColor: 'white', width: '100%', height: '100vh', position: 'relative', }}>
          {/* <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5 }}> */}
          {/* <Typography variant="h1">Beanstalk</Typography> */}
          <Box sx={{ position: 'absolute', top: 4, right: 4, p: 1, zIndex: 10, }}>
            <IconButton
              aria-label="close"
              onClick={() => setOpen(false)}
              
            >
              <CloseIcon />
            </IconButton>
          </Box>
          {/* </Stack> */}
          <List>
            {NAVIGATION_MAP.top.map((item) => (
              <RouterLink to={item.path}>
                <ListItem>
                  <ListItemButton LinkComponent={RouterLink} onClick={() => setOpen(false)}>
                    <ListItemText primary={item.title} />
                  </ListItemButton>
                </ListItem>
              </RouterLink>
            ))}
          </List>
        </Box>
      </Drawer>
      <AppBar
        sx={{
          px: 1,
          py: 1,
          backgroundColor: BeanstalkPalette.lighterBlue,
          borderBottom: `1px solid ${BeanstalkPalette.lightBlue}`,
        }}
      >
        <Stack direction="row" gap={1} alignItems="center">
          {/* Desktop: Left Side */}
          <Stack direction="row" sx={{ flex: 1 }}>
            <PriceButton />
            <Box sx={{ display: { lg: 'block', xs: 'none' } }}>
              {NAVIGATION_MAP.top.map((item) => (
                <NavButton
                  key={item.path}
                  to={item.path}
                  title={item.title}
                />
              ))}
              <MoreButton />
            </Box>
          </Stack>
          {/* Desktop: Right Side */}
          <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ }} spacing={1}>
            <Box sx={{ display: { lg: 'block', xs: 'none' } }}>
              <IconButton color="light" variant="contained">
                <img src={swapIcon} alt="Swap" />
              </IconButton>
              <NetworkButton />
            </Box>
            <WalletButton />
            <Button
              color="light"
              variant="contained"
              aria-label="open drawer"
              onClick={() => setOpen(true)}
              edge="start"
              sx={{
                display: { lg: 'none', xs: 'block' },
                minHeight: 0,
                minWidth: 0,
                lineHeight: 0,
                px: 1,
                // py: 0.5
              }}
            >
              <MoreHorizIcon sx={{  }} />
            </Button>
          </Stack>
        </Stack>
      </AppBar>
    </>
  );
};

export default NavBar;

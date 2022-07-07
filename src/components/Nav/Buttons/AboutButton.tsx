import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  ButtonProps,
  Card,
  ListItemText,
  Menu,
  MenuList,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { BEANSTALK_ADDRESSES, CHAIN_INFO } from 'constants/index';
import useChainConstant from 'hooks/useChainConstant';
import useAnchor from 'hooks/display/useAnchor';
import useToggle from 'hooks/display/useToggle';
import NavDrawer from '../NavDrawer';
import ROUTES from '../routes';
import MenuItem from '../MenuItem';

const AboutButton: React.FC<ButtonProps> = () => {
  // Theme
  const theme = useTheme();
  const isMedium = useMediaQuery(theme.breakpoints.down('lg'));   // trim additional account text at medium

  // Constants
  const chainInfo = useChainConstant(CHAIN_INFO);
  const beanstalkAddress = useChainConstant(BEANSTALK_ADDRESSES);

  // Menu
  const [anchorEl, toggleAnchor] = useAnchor();

  // Drawer
  const [drawerOpen, showDrawer, hideDrawer] = useToggle(toggleAnchor, toggleAnchor);

  const menuContent = (
    <MenuList component={Card}>
      {/* Menu Items */}
      {ROUTES.additional.map((item) => (
        <MenuItem key={item.path} item={item} onClick={toggleAnchor} />
      ))}
      {/* Contract Button Container */}
      <Box sx={{ px: 1, pt: 0.75 }}>
        <Button
          fullWidth
          href={`${chainInfo.explorer}/address/${beanstalkAddress}`}
          target="_blank"
          rel="noreferrer"
          variant="contained"
          color="secondary"
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <ListItemText>Contract: {beanstalkAddress.slice(0, 6)}...</ListItemText>
            <Typography variant="body2" color="text.secondary">
              <ArrowForwardIcon sx={{ transform: 'rotate(-45deg)', fontSize: 12 }} />
            </Typography>
          </Stack>
        </Button>
      </Box>
      {/* Build Information */}
      <Box sx={{ px: 1, pt: 0.75, opacity: 0.7 }}>
        <Typography color="text.secondary" fontSize={12} textAlign="center">
          {process.env.REACT_APP_NAME || 'beanstalk-ui'} v{process.env.REACT_APP_VERSION || '0.0.0'}@{process.env.REACT_APP_GIT_COMMIT_REF?.slice(0,6) || 'HEAD'}
          {' · '}
          hosted on {process.env.REACT_APP_HOST || 'unknown'}
        </Typography>
      </Box>
    </MenuList>
  );

  return (
    <>
      {/**
        * Nav Drawer
        * ----------
        * Contains all nav items in one fullscreen drawer.
        * Triggered by AboutButton on mobile.
        */}
      <NavDrawer
        open={drawerOpen && (isMedium)}
        hideDrawer={hideDrawer}
      />
      <Button
        color="light"
        variant="contained"
        aria-label="open drawer"
        onClick={showDrawer}
        sx={{
          height: 44,
          display: { xs: 'block' },
          lineHeight: 0,
          minWidth: 0,
          px: 1,
        }}
      >
        <MoreHorizIcon />
      </Button>
      <Menu
        elevation={0}
        anchorEl={anchorEl}
        open={drawerOpen && !(isMedium)}
        onClose={hideDrawer}
        MenuListProps={{
          sx: {
            py: 0,
            mt: 0,
          }
        }}
        disablePortal
        disableScrollLock
        // Align the menu to the bottom-right side of the anchor button.
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {menuContent}
      </Menu>
    </>
  );
};

export default AboutButton;

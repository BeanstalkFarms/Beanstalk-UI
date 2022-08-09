import React, { useCallback } from 'react';
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
import { useHotkeys } from 'react-hotkeys-hook';
import useChainConstant from '~/hooks/useChainConstant';
import useAnchor from '~/hooks/display/useAnchor';
import useToggle from '~/hooks/display/useToggle';
import { BEANSTALK_ADDRESSES, CHAIN_INFO } from '~/constants';
import NavDrawer from '../NavDrawer';
import ROUTES from '../routes';
import MenuItem from '../MenuItem';
import SettingsDialog from '~/components/Nav/SettingsDialog';

const AboutButton: React.FC<ButtonProps> = ({ sx }) => {
  /// Theme
  const theme = useTheme();
  const isMedium = useMediaQuery(theme.breakpoints.down('lg')); // trim additional account text at medium

  /// Constants
  const chainInfo = useChainConstant(CHAIN_INFO);
  const beanstalkAddress = useChainConstant(BEANSTALK_ADDRESSES);

  /// Menu
  const [anchorEl, toggleAnchor] = useAnchor();

  /// Drawer
  const [open, show, hide] = useToggle(toggleAnchor, toggleAnchor);

  /// Settings
  const [settingsOpen, showSettings, hideSettings] = useToggle();
  const onOpenSettings = useCallback((e: any) => {
    e.preventDefault();
    hide();
    showSettings(true);
  }, [showSettings, hide]);
  useHotkeys('cmd+,', (e) => {
    e.preventDefault();
    settingsOpen ? hideSettings() : showSettings();
  }, {}, [settingsOpen]);

  /// Content
  const menuContent = (
    <MenuList component={Card}>
      {/* Menu Items */}
      {/* <MenuItem
        item={{ title: 'Settings', path: '/settings' }}
        onClick={onOpenSettings}
      /> */}
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
          sx={{ py: 0.9 }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <ListItemText>
              <Typography variant="h4">
                Contract: {beanstalkAddress.slice(0, 6)}...
              </Typography>
            </ListItemText>
            <Typography variant="body2" color="text.secondary">
              <ArrowForwardIcon
                sx={{ transform: 'rotate(-45deg)', fontSize: 12 }}
              />
            </Typography>
          </Stack>
        </Button>
      </Box>
    </MenuList>
  );

  return (
    <>
      <SettingsDialog open={settingsOpen} onClose={hideSettings} />
      {/**
       * Nav Drawer
       * ----------
       * Contains all nav items in one fullscreen drawer.
       * Triggered by AboutButton on mobile.
       */}
      <NavDrawer open={open && isMedium} hideDrawer={hide} />
      <Button
        color="light"
        variant="contained"
        aria-label="open drawer"
        onClick={show}
        sx={{
          height: 44,
          display: { xs: 'block' },
          lineHeight: 0,
          minWidth: 0,
          px: 1,
          ...sx,
        }}
      >
        <MoreHorizIcon />
      </Button>
      <Menu
        elevation={0}
        anchorEl={anchorEl}
        open={open && !isMedium}
        onClose={hide}
        MenuListProps={{
          sx: {
            py: 0,
            mt: 0,
          },
        }}
        transitionDuration={{ appear: 200, enter: 200, exit: 0 }}
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

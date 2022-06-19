import React, { useCallback, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  useAccount,
  useDisconnect,
  useNetwork,
} from 'wagmi';
import {
  Box,
  Button,
  ButtonProps,
  Card,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Stack, Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import tempUserIcon from 'img/interface/temp-user-icon.svg';
import { CHAIN_INFO } from 'constants/chains';

import { getAccount } from 'util/Account';
import useChainConstant from 'hooks/useChainConstant';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import NavDrawer from '../Mobile/NavDrawer';
import ROUTES from '../routes';
import { BeanstalkPalette } from '../../App/muiTheme';

// -----------------------------------------------------------------

const AdditionalButton: React.FC<ButtonProps> = ({ ...props }) => {
  const theme = useTheme();
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));   // trim additional account text
  const isTiny = useMediaQuery('(max-width:380px)');              //

  // Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleHideMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const hideDrawer = useCallback(() => {
    setDrawerOpen(false);
    setAnchorEl(null);
  }, []);
  const showDrawer = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setDrawerOpen(true);
    setAnchorEl(event.currentTarget);
  }, []);

  const menu = (
    <MenuList component={Card}>
      {ROUTES.additional.map((item) => (
        <MenuItem
          disabled={item.disabled}
          component={item.href ? 'a' : RouterLink}
          key={item.path}
          href={item.href ? item.href : undefined}
          target={item.href ? '_blank' : undefined}
          rel={item.href ? 'noreferrer' : undefined}
          to={item.href ? undefined : item.path}
          sx={{ minWidth: 200 }}
          onClick={handleHideMenu}
        >
          {item.disabled ? (
            <Tooltip title={<>{item.title} will be available upon Unpause</>}>
              <span>
                <Stack direction="row" gap={1} alignItems="center">
                  {item.icon && <img src={item.icon} alt={`${item.title}`} width={20} />}
                  {item.title}
                </Stack>
              </span>
            </Tooltip>
          ) : (
            <ListItemText>
              <Stack direction="row" gap={1} alignItems="center">
                {item.icon && <img src={item.icon} alt={`${item.title}`} width={20} />}
                {item.title}
              </Stack>
            </ListItemText>
          )}
          {item.href ? (
            <Typography variant="body2" color="text.secondary">
              <ArrowForwardIcon sx={{ transform: 'rotate(-45deg)', fontSize: 12 }} />
            </Typography>
          ) : null}
        </MenuItem>
      ))}
      <Box sx={{ px: 1, py: 0.3 }}>
        <Button
          fullWidth
          href="#"
          sx={{
            backgroundColor: BeanstalkPalette.babyBlue,
            color: BeanstalkPalette.black,
            fontWeight: 400,
            '&:hover': {
              backgroundColor: BeanstalkPalette.babyBlue,
              opacity: 0.8
            }
          }}>
          <Stack direction="row" alignItems="center">
            <ListItemText>Contract: 0X000...</ListItemText>
            <Typography variant="body2" color="text.secondary">
              <ArrowForwardIcon sx={{ transform: 'rotate(-45deg)', fontSize: 12 }} />
            </Typography>
          </Stack>
        </Button>
      </Box>

    </MenuList>
  );

  // Connected
  return (
    <>
      {/* Drawer - only show on mobile or medium layout */}
      <NavDrawer open={drawerOpen && (isTiny || isMedium)} hideDrawer={hideDrawer} />
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
        open={drawerOpen && !(isTiny || isMedium)}
        onClose={hideDrawer}
        components={{
          // Root: Card
        }}
        MenuListProps={{
          sx: {
            py: 0,
            mt: 0,
          }
        }}
        disablePortal
        disableScrollLock
        // Align the menu to the bottom
        // right side of the anchor button.
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          // Give some room between the WalletButton
          // and the popper when it's opened.
          // mt: 0.5,
        }}
      >
        {menu}
      </Menu>
    </>
  );
};

export default AdditionalButton;

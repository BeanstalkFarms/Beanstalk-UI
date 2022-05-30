import React, { useCallback, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Stack,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import { BeanstalkPalette } from 'components/v2/App/muiTheme';
import WalletButton from '../Common/WalletButton';
import NetworkButton from '../Common/NetworkButton';
import PriceButton from './PriceButton';
import ROUTES from './routes';
import NavButton from './NavButton';
import MoreButton from './MoreButton';
import NavDrawer from './NavDrawer';

const NavBar: React.FC<{}> = () => {
  const [open, setOpen] = useState(false);
  const hideDrawer = useCallback(() => setOpen(false), []);
  const showDrawer = useCallback(() => setOpen(true), []);

  return (
    <>
      {/* Drawer */}
      <NavDrawer
        open={open}
        hideDrawer={hideDrawer}
      />
      {/* Navigation Bar */}
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
          <Stack direction="row" alignItems="center" sx={{ flex: 1 }}>
            <PriceButton />
            <Stack direction="row" alignItems="center" sx={{ display: { lg: 'block', xs: 'none' } }}>
              {ROUTES.top.map((item) => (
                <NavButton
                  key={item.path}
                  to={item.path}
                  title={item.title}
                  tag={item.tag}
                />
              ))}
              <MoreButton />
            </Stack>
          </Stack>
          {/* Desktop: Right Side */}
          <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ }} spacing={1}>
            <Box sx={{ display: { lg: 'block', xs: 'none' } }}>
              <NetworkButton />
            </Box>
            <WalletButton />
            <Button
              color="light"
              variant="contained"
              aria-label="open drawer"
              onClick={showDrawer}
              sx={{
                display: { lg: 'none', xs: 'block' },
                // Match the height of the Wallet / Priice buttons.
                // FIXME: need a cleaner way to enforce this height
                minHeight: '43.5px',
                // IconButton has some annoying behavior so we're
                // using a regular button instead. This prevents
                // the contained icon from being treated like text
                // with line-height
                lineHeight: 0,
                // Make the button more square
                minWidth: 0,
                px: 1,
              }}
            >
              <MoreHorizIcon />
            </Button>
          </Stack>
        </Stack>
      </AppBar>
    </>
  );
};

export default NavBar;

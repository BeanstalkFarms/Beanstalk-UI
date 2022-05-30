import React, { useCallback, useState } from 'react';
import {
  AppBar,
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
                />
              ))}
              <MoreButton />
            </Stack>
          </Stack>
          {/* Desktop: Right Side */}
          <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ }} spacing={1}>
            <NetworkButton />
            <WalletButton />
            <Button
              color="light"
              variant="contained"
              aria-label="open drawer"
              onClick={showDrawer}
              edge="start"
              sx={{
                display: { lg: 'none', xs: 'block' },
                minHeight: 0,
                minWidth: 0,
                lineHeight: 0,
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

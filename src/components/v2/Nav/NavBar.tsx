import React, { useCallback, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Dialog,
  Stack,
  Typography,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import { BeanstalkPalette } from 'components/v2/App/muiTheme';
import { SupportedChainId } from 'constants/chains';
import useChainId from 'hooks/useChain';
import WalletButton from '../Common/WalletButton';
import NetworkButton from '../Common/NetworkButton';
import PriceButton from './PriceButton';
import ROUTES from './routes';
import NavButton from './NavButton';
import MoreButton from './MoreButton';
import NavDrawer from './NavDrawer';

const NavBar: React.FC<{}> = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hideDrawer = useCallback(() => setDrawerOpen(false), []);
  const showDrawer = useCallback(() => setDrawerOpen(true), []);
  const chainId = useChainId();

  // TEMP: Pre-exploit Modal
  const [noticeOpen, setNoticeOpen] = useState(false);

  return (
    <>
      {/* Drawer */}
      <NavDrawer
        open={drawerOpen}
        hideDrawer={hideDrawer}
      />
      {/* TEMP: Pre-exploit Dialog */}
      <Dialog onClose={() => setNoticeOpen(false)} open={noticeOpen}>
        Test
      </Dialog>
      {/* Navigation Bar */}
      <AppBar
        // Using position: sticky means that 
        // the main content region will always start
        // below the header, regardless of height!
        sx={{
          position: 'sticky',
          backgroundColor: BeanstalkPalette.lighterBlue,
          borderBottom: `1px solid ${BeanstalkPalette.lightBlue}`,
        }}
      >
        {/* TEMP: */}
        {chainId === SupportedChainId.MAINNET && (
          <Stack direction="row" justifyContent="center" sx={{ width: '100%', textAlign: 'center', pt: 1, px: 1 }}>
            <Typography sx={{ fontSize: 14 }} color="text.secondary">
              <strong>Heads up</strong>: You are viewing the state of Beanstalk pre-exploit.
            </Typography>
            <Button 
              onClick={() => setNoticeOpen(true)}
              sx={{
                display: 'inline',
                py: 1,
                minHeight: 0,
                lineHeight: 0,
                fontSize: 14
              }}
              variant="text"
              size="small">
              Learn more
            </Button>
          </Stack>
        )}
        <Stack direction="row" alignItems="center" gap={1} sx={{ p: 1, pt: chainId === SupportedChainId.MAINNET ? 0.75 : 'inherit' }}>
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

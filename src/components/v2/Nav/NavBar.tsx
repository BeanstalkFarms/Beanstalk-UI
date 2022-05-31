import React, { useCallback, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Dialog,
  Divider,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import { BeanstalkPalette } from 'components/v2/App/muiTheme';
import { SupportedChainId } from 'constants/chains';
import useChainId from 'hooks/useChain';
import { PRE_EXPLOIT_BEAN_DATA } from 'state/v2/bean/pools/updater';
import { displayFullBN, trimAddress } from 'util/index';
import usePools from 'hooks/usePools';
import WalletButton from '../Common/WalletButton';
import NetworkButton from '../Common/NetworkButton';
import PriceButton from './PriceButton';
import ROUTES from './routes';
import NavButton from './NavButton';
import MoreButton from './MoreButton';
import NavDrawer from './NavDrawer';
import { StyledDialogContent, StyledDialogTitle } from '../Common/Dialog';

const NavBar: React.FC<{}> = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hideDrawer = useCallback(() => setDrawerOpen(false), []);
  const showDrawer = useCallback(() => setDrawerOpen(true), []);
  const chainId = useChainId();
  const pools = usePools();

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
      {chainId === SupportedChainId.MAINNET ? (
        <Dialog onClose={() => setNoticeOpen(false)} open={noticeOpen}>
          <StyledDialogTitle onClose={() => setNoticeOpen(false)}>
            Notice
          </StyledDialogTitle>
          <StyledDialogContent>
            <Typography>
              Until Beanstalk is Unpaused in early July, some balances displayed in the Beanstalk UI will remaining hard-coded to their values at the block before the exploit (14602789).
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack gap={1}>
              <Typography variant="h2">BEAN price: $1.020270</Typography>
              {PRE_EXPLOIT_BEAN_DATA.updateBeanPools.map((elem) => {
                const pool = pools[elem.address];
                if (!pool) return null;
                return (
                  <div key={elem.address}>
                    <Typography variant="h3">
                      {pool.name}: <Link href={`https://etherscan.io/address/${elem.address}`} target="_blank" rel="noreferrer">{trimAddress(elem.address)}</Link>
                    </Typography>
                    <ul>
                      {Object.keys(elem.pool).map((key) => (
                        <li key={key}>
                          <Typography>
                            <Box component="span" sx={{ display: 'inline-block', width: 100, textTransform: 'capitalize' }}>{key}:</Box>
                            {key === 'price' || key === 'liquidity' ? '$' : ''}
                            {Array.isArray(elem.pool[key]) ? elem.pool[key].map((e, i) => `${displayFullBN(e)} ${pools[elem.address].tokens[i].symbol}`).join(', ') : displayFullBN(elem.pool[key])}
                            {key === 'supply' ? ` ${pools[elem.address].lpToken.symbol}` : ''}
                          </Typography>
                        </li>
                        ))}
                    </ul>
                  </div>
                );
              })}
            </Stack>
          </StyledDialogContent>
        </Dialog>
      ) : null}
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
          <Box sx={{ textAlign: 'center', px: 1, pt: 1, cursor: 'pointer' }} onClick={() => setNoticeOpen(true)}>
            <Typography sx={{ fontSize: 14 }} color="text.secondary">
              You are viewing $BEAN price data as of block 14602789. <strong>Learn more</strong>
            </Typography>
          </Box>
        )}
        <Stack direction="row" alignItems="center" gap={1} sx={{ p: 1, pt: chainId === SupportedChainId.MAINNET ? 0.75 : 1 }}>
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

import React from 'react';
import {
  AppBar,
  Box,
  Stack,
} from '@mui/material';
import { BeanstalkPalette } from 'components/App/muiTheme';
import WalletButton from 'components/Common/Connection/WalletButton';
import NetworkButton from 'components/Common/Connection/NetworkButton';
import PriceButton from './Buttons/PriceButton';
import SunButton from './Buttons/SunButton';
import LinkButton from './Buttons/LinkButton';
import AboutButton from './Buttons/AboutButton';
import ROUTES from './routes';
import HoverMenu from './HoverMenu';

const NavBar: React.FC<{}> = () => (
      
  <AppBar
      // Using position: sticky means that
      // the main content region will always start
      // below the header, regardless of height!
    className="navbar"
    sx={{
        position: 'sticky',
        backgroundColor: BeanstalkPalette.lightBlue,
        borderBottom: `1px solid ${BeanstalkPalette.blue}`,
        // height: '65px'
        // pt: chainId === SupportedChainId.MAINNET ? 0.75 : 1
      }}
    >
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      height="64px"
      px={1}
      gap={1}
      >
      {/* Desktop: Left Side */}
      <Stack direction="row" alignItems="center" sx={{ flex: 1 }} height="100%" gap={1}>
        <PriceButton sx={{ height: 45 }} />
        <SunButton sx={{ height: 45 }} />
        <Stack
          direction="row"
          alignItems="center"
          sx={{ display: { lg: 'flex', xs: 'none' } }}
          height="100%"
          >
          {ROUTES.top.map((item) => (
            <LinkButton
              key={item.path}
              to={item.path}
              title={item.title}
              tag={item.tag}
              />
            ))}
          <HoverMenu items={ROUTES.more}>
            More
          </HoverMenu>
        </Stack>
      </Stack>
      {/* Desktop: Right Side */}
      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        gap={1}
        >
        <Box sx={{ display: { sm: 'block', xs: 'none' } }}>
          <NetworkButton sx={{ height: 45 }} />
        </Box>
        <WalletButton sx={{ height: 45 }} />
        <AboutButton sx={{ height: 45 }} />
      </Stack>
    </Stack>
  </AppBar>

  );

export default NavBar;

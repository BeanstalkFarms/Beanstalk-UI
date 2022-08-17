import React from 'react';
import {
  AppBar,
  Box,
  Stack,
} from '@mui/material';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import WalletButton from '~/components/Common/Connection/WalletButton';
import NetworkButton from '~/components/Common/Connection/NetworkButton';
import PriceButton from './Buttons/PriceButton';
import SunButton from './Buttons/SunButton';
import LinkButton from './Buttons/LinkButton';
import AboutButton from './Buttons/AboutButton';
import ROUTES from './routes';
import HoverMenu from './HoverMenu';

/// Navbar Positioning
export const BANNER_HEIGHT = 0; // 35;
export const NAV_HEIGHT    = 64;
export const NAV_CONTAINER_HEIGHT = BANNER_HEIGHT + NAV_HEIGHT;
export const NAV_ELEM_HEIGHT = 45;

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
    }}
  >
    {/* <Banner height={BANNER_HEIGHT} href="https://snapshot.org/#/beanstalkdao.eth/">
      <img src={snapshotLogo} alt="Snapshot" style={{ height: 14, marginBottom: -2 }} />&nbsp;
      BIP-22 and BIP-23, the Q3 budget proposals for Beanstalk Farms and Bean Sprout, respectively, are live on Snapshot. <strong>Vote now &rarr;</strong>
    </Banner> */}
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      height={`${NAV_HEIGHT}px`}
      px={1}
      gap={1}
    >
      {/* Desktop: Left Side */}
      <Stack direction="row" alignItems="center" sx={{ flex: 1 }} height="100%" gap={1}>
        <PriceButton sx={{ height: NAV_ELEM_HEIGHT }} />
        <SunButton sx={{ height: NAV_ELEM_HEIGHT }} />
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
          <NetworkButton sx={{ height: NAV_ELEM_HEIGHT }} />
        </Box>
        <WalletButton sx={{ height: NAV_ELEM_HEIGHT }} />
        <AboutButton sx={{ height: NAV_ELEM_HEIGHT }} />
      </Stack>
    </Stack>
  </AppBar>
);

export default NavBar;

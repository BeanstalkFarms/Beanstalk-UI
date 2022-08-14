import React from 'react';
import {
  AppBar,
  Box,
  Link,
  Stack,
} from '@mui/material';
import { BeanstalkPalette, FontSize } from '~/components/App/muiTheme';
import WalletButton from '~/components/Common/Connection/WalletButton';
import NetworkButton from '~/components/Common/Connection/NetworkButton';
import PriceButton from './Buttons/PriceButton';
import SunButton from './Buttons/SunButton';
import LinkButton from './Buttons/LinkButton';
import AboutButton from './Buttons/AboutButton';
import ROUTES from './routes';
import HoverMenu from './HoverMenu';
import snapshotLogo from '~/img/ecosystem/snapshot-logo.svg';

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
    <Link href="https://snapshot.org/#/beanstalkdao.eth/" target="_blank" rel="noreferrer" underline="none" sx={{ color: '#333', fontSize: FontSize.sm }}>
      <Box sx={{ backgroundColor: 'white', textAlign: 'center', px: 2, py: 0.75 }}>
        <img src={snapshotLogo} alt="Snapshot" style={{ height: 14, marginBottom: -2 }} />&nbsp;
        BIP-22 and BIP-23, the Q3 budget proposals for Beanstalk Farms and Bean Sprout, respectively, are live on Snapshot. <strong>Vote now &rarr;</strong>
      </Box>
    </Link>
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

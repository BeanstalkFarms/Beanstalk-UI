import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Dialog,
  Divider,
  Link,
  Stack,
  Typography, useMediaQuery,
} from '@mui/material';
import BigNumber from 'bignumber.js';
import { BeanstalkPalette } from 'components/App/muiTheme';
import { SupportedChainId } from 'constants/chains';
import useChainId from 'hooks/useChain';
import { PRE_EXPLOIT_BEAN_DATA } from 'state/bean/pools/updater';
import { displayFullBN, trimAddress } from 'util/index';
import usePools from 'hooks/usePools';
import { StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import WalletButton from 'components/Common/Connection/WalletButton';
import NetworkButton from 'components/Common/Connection/NetworkButton';
import PriceButton from './Buttons/PriceButton';
import SunButton from './Buttons/SunButton';
import LinkButton from './Buttons/LinkButton';
import AboutButton from './Buttons/AboutButton';
import ROUTES from './routes';
import HoverMenu from './HoverMenu';

const NavBar: React.FC<{}> = () => {
  const chainId = useChainId();
  const pools = usePools();

  // TEMP: Pre-exploit Modal
  const [noticeOpen, setNoticeOpen] = useState(false);
  const isTwoXLarge = useMediaQuery('(max-width:350px)');

  return (
    <>
      {/* TEMP: Pre-exploit Dialog */}
      {chainId === SupportedChainId.MAINNET ? (
        <Dialog
          onClose={() => setNoticeOpen(false)}
          open={noticeOpen}
          // Makes modal full-screen on mobile
          sx={{
            '& .MuiDialog-container': {
              height: {
                xs: 'auto',
                md: '100%',
              },
            },
          }}
          PaperProps={{
            sx: {
              margin: {
                xs: 0,
                md: 'auto',
              },
              borderRadius: {
                xs: 0,
                md: 1,
              },
            },
          }}
        >
          <StyledDialogTitle onClose={() => setNoticeOpen(false)}>
            Notice
          </StyledDialogTitle>
          <StyledDialogContent>
            <Typography>
              Until Beanstalk is Replanted, some balances
              displayed in the Beanstalk UI will remain fixed to their
              values at the block before the exploit (14602789).
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
                      {pool.name}:{' '}
                      <Link
                        href={`https://etherscan.io/address/${elem.address}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {trimAddress(elem.address)}
                      </Link>
                    </Typography>
                    <ul>
                      {Object.keys(elem.pool).map((key) => {
                        const thisElem = elem.pool[key as keyof typeof elem.pool];
                        return (
                          <li key={key}>
                            <Typography>
                              <Box
                                component="span"
                                sx={{
                                  display: 'inline-block',
                                  width: 100,
                                  textTransform: 'capitalize',
                                }}
                              >
                                {key}:
                              </Box>
                              {key === 'price' || key === 'liquidity' ? '$' : ''}
                              {Array.isArray(thisElem)
                                ? thisElem
                                    .map(
                                      (e: BigNumber, i: number) =>
                                        `${displayFullBN(e)} ${
                                          pools[elem.address].tokens[i].symbol
                                        }`
                                    )
                                    .join(', ')
                                : displayFullBN(thisElem)}
                              {key === 'supply'
                                ? ` ${pools[elem.address].lpToken.symbol}`
                                : ''}
                            </Typography>
                          </li>
                        );
                      })}
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
        className="navbar"
        sx={{
          position: 'sticky',
          // backgroundColor: { xs: BeanstalkPalette.lightBlue, xl: '#e9f3fd' },
          borderBottom: `1px solid ${BeanstalkPalette.blue}`,
          // height: '65px'
          // pt: chainId === SupportedChainId.MAINNET ? 0.75 : 1
        }}
      >
        {chainId === SupportedChainId.MAINNET && (
          <Box
            sx={{
              backgroundColor: 'white',
              textAlign: 'center',
              px: 1,
              py: 0.5,
              cursor: 'pointer',
            }}
            onClick={() => setNoticeOpen(true)}
          >
            <Typography sx={{ fontSize: 14 }} color="text.secondary">
              You are viewing $BEAN price data as of block 14602789.{' '}
              <strong>Learn more</strong>
            </Typography>
          </Box>
        )}
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
    </>
  );
};

export default NavBar;

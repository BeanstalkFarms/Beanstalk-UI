import React, { useState } from 'react';
import { Box, Button, ButtonProps, Drawer, Popper, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import usePools from 'hooks/usePools';
import { displayBN } from 'util/Tokens';
import { CHAIN_INFO } from 'constants/chains';
import useChainId from 'hooks/useChain';
import PoolCard from 'components/Silo/PoolCard';
import DropdownIcon from 'components/Common/DropdownIcon';
import { ZERO_BN } from 'constants/index';
import BeanProgressIcon from 'components/Common/BeanProgressIcon';

// ------------------------------------------------------------

const PriceButton: React.FC<ButtonProps> = ({ ...props }) => {
  const beanPrice = useSelector<AppState, AppState['_bean']['token']['price']>(
    (state) => state._bean.token.price
  );
  const beanPools = useSelector<AppState, AppState['_bean']['pools']>(
    (state) => state._bean.pools
  );
  const { season } = useSelector<AppState, AppState['_beanstalk']['sun']>(
    (state) => state._beanstalk.sun
  );
  
  // Setup
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isTiny = useMediaQuery('(max-width:350px)');
  const pools = usePools();
  const chainId = useChainId();
  
  // Popover
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const popoverOpen = Boolean(anchorEl);
  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (anchorEl) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleOpenDrawer = () => {
    setDrawerOpen(true);
  };

  // Handlers
  const onClickPriceButton = isMobile ? handleOpenDrawer : handleOpenPopover;

  // Pools
  const isPriceLoading = beanPrice.eq(new BigNumber(-1));
  const startIcon = isTiny ? null : (
    <BeanProgressIcon
      size={25}
      enabled={isPriceLoading}
      variant="indeterminate"
    />
  );
  const poolsContent = Object.values(pools).map((pool) => (
    <PoolCard
      key={pool.address}
      pool={pool}
      poolState={beanPools[pool.address]}
      ButtonProps={{
        href: `${CHAIN_INFO[chainId]?.explorer}/address/${pool.address}`,
        target: '_blank',
        rel: 'noreferrer',
      }}
    />
  ));

  return (
    <>
      <Box>
        <Button
          color="light"
          startIcon={startIcon}
          endIcon={<DropdownIcon open={(popoverOpen || drawerOpen)} />}
          onClick={onClickPriceButton}
          disableRipple
          {...props}
          sx={{
            // Fully rounded by default; when open, remove
            // the bottom rounding to look like a "tab".
            borderBottomLeftRadius:  anchorEl ? 0 : undefined,
            borderBottomRightRadius: anchorEl ? 0 : undefined,  
            // Enforce a default white border; switch the color
            // to secondary when the Popper is open.
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: anchorEl ? 'secondary.main' : 'white',
            // Keep this white so we can make it look like the
            // button is "expanding" into a Box when you click it.
            borderBottomColor: 'white',
            // Without disabling the transition, the border fades
            // in/out and looks weird.
            transition: 'none !important',
            // Move the button above the Box so we can slice off
            // the 1px border at the top of the Box.
            zIndex: anchorEl ? 999 : undefined,
            // Positioning and other styles.
            mr: 1,
            ...props.sx
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            ${(isPriceLoading ? 0.0000 : beanPrice).toFixed(isMobile ? 2 : 4)}
          </Typography>
        </Button>
        <Popper
          open={popoverOpen}
          anchorEl={anchorEl}
          placement="bottom-start"
          disablePortal
        >
          <Box
            sx={(_theme) => ({
              background: 'white',
              width: '400px',
              borderBottomLeftRadius: _theme.shape.borderRadius,
              borderBottomRightRadius: _theme.shape.borderRadius,
              borderTopRightRadius: _theme.shape.borderRadius,
              borderColor: 'secondary.main',
              borderWidth: 1,
              borderStyle: 'solid',
              px: 1,
              py: 1,
              boxShadow: _theme.shadows[0],
              // Should be below the zIndex of the Button.
              zIndex: 998,
              mt: '-1px',
            })}
            className="border border-t-0 shadow-xl"
          >
            <Stack gap={1}>
              {/* <Typography variant="body1" textAlign="left" mx={0.5} mt={1}>
                Season {displayBN(season || ZERO_BN)}
              </Typography> */}
              {poolsContent}
            </Stack>
          </Box>
        </Popper>
      </Box>
      {/* Mobile: Drawer */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
       
      >
        <Stack sx={{ p: 2 }} gap={2}>
          <Typography variant="h2">
            Pools — Season {displayBN(season || ZERO_BN)}
          </Typography>
          <Stack gap={1}>
            {poolsContent}
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
};

export default PriceButton;

import React, { useState } from 'react';
import { Box, Button, CircularProgress, CircularProgressProps, Drawer, Popper, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import beanCircleIcon from 'img/bean-circle.svg';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import usePools from 'hooks/usePools';
import BigNumber from 'bignumber.js';
import PoolCard from '../Silo/PoolCard';
import DropdownIcon from '../Common/DropdownIcon';

// ------------------------------------------------------------

const PROGRESS_THICKNESS = 2;
const PROGRESS_GAP = 3.5;
const BeanProgressIcon : React.FC<CircularProgressProps & {
  size: number;
  enabled: boolean;
  progress?: number;
}> = ({
  size,
  enabled,
  variant,
  progress
}) => (
  <Stack sx={{ position: 'relative' }}>
    {enabled ? (
      <CircularProgress
        variant={variant}
        color="primary"
        size={size + PROGRESS_GAP * 2}
        value={progress}
        sx={{
          position: 'absolute',
          left: -PROGRESS_GAP,
          top: -PROGRESS_GAP,
          zIndex: 10,
        }}
        thickness={PROGRESS_THICKNESS}
      />
    ) : null}
    <img
      src={beanCircleIcon}
      alt="Bean"
      style={{ height: size }}
    />
  </Stack>
);

// ------------------------------------------------------------

const PriceButton: React.FC = () => {
  const beanPrice = useSelector<AppState, AppState['_bean']['price']>(
    (state) => state._bean.price
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
  const isPriceLoading = beanPrice[0].eq(new BigNumber(-1));
  const StartIcon = isTiny ? null : (
    <BeanProgressIcon
      size={25}
      enabled={isPriceLoading}
      variant="indeterminate"
    />
  );
  const Pools = Object.values(pools).map((pool) => (
    <PoolCard
      key={pool.address}
      pool={pool}
      poolState={beanPools[pool.address]}
      isButton
    />
  ));

  return (
    <>
      <Box>
        <Button
          color="light"
          startIcon={StartIcon}
          endIcon={<DropdownIcon open={(popoverOpen || drawerOpen)} />}
          onClick={onClickPriceButton}
          disableRipple
          sx={{
            borderBottomLeftRadius: anchorEl ? 0 : undefined,
            borderBottomRightRadius: anchorEl ? 0 : undefined,
            zIndex: anchorEl ? 999 : undefined,
            mr: 1,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            ${(isPriceLoading ? 0.0000 : beanPrice[0]).toFixed(isMobile ? 2 : 4)}
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
              width: '350px',
              borderColor: 'primary.main',
              overflow: 'hidden',
              borderBottomLeftRadius: _theme.shape.borderRadius,
              borderBottomRightRadius: _theme.shape.borderRadius,
              borderTopRightRadius: _theme.shape.borderRadius,
              px: 1,
              py: 1,
              boxShadow: _theme.shadows[1],
            })}
            className="border border-t-0 shadow-xl"
          >
            <Stack gap={1}>
              <Typography variant="h3" textAlign="left" mx={0.5} mt={1}>Season {season?.toFixed(0) || 0}</Typography>
              {Pools}
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
          <Typography variant="h2">Pools — Season {season?.toFixed(0) || 0}</Typography>
          <Stack gap={1}>
            {Pools}
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
};

export default PriceButton;

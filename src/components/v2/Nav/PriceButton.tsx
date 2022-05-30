import React, { useState } from 'react';
import { Box, Button, Drawer, Popper, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

import beanCircleIcon from 'img/bean-circle.svg';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import usePools from 'hooks/usePools';
import PoolCard from '../Silo/PoolCard';

const PriceButton: React.FC = () => {
  const beanPrice = useSelector<AppState, AppState['_bean']['price']>(
    (state) => state._bean.price
  );
  const beanPools = useSelector<AppState, AppState['_bean']['pools']>(
    (state) => state._bean.pools
  );
  
  // Setup
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('lg'));
  const pools = usePools();
  
  // Poppover
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

  // 
  const Icon = anchorEl ? ArrowDropUpIcon : ArrowDropDownIcon;
  const Pools = (
    <Stack gap={1}>
      {Object.values(pools).map((pool) => (
        <PoolCard
          key={pool.address}
          pool={pool}
          poolState={beanPools[pool.address]}
        />
      ))}
    </Stack>
  );

  const onClickPriceButton = matches ? handleOpenDrawer : handleOpenPopover;

  //
  return (
    <>
      {/* Desktop  sx={{ display: { md: 'block', xs: 'none' } }} */}
      <Box>
        <Button
          color="light"
          startIcon={
            <img src={beanCircleIcon} alt="Bean" style={{ height: 25 }} />
          }
          endIcon={
            <Icon
              style={{ height: 15, marginLeft: '-8px', marginRight: '-4px' }}
            />
          }
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
            ${beanPrice[0].toFixed(matches ? 2 : 4)}
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
            {Pools}
          </Box>
        </Popper>
      </Box>
      {/* Mobile */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Stack sx={{ p: 2 }} gap={2}>
          <Typography variant="h2">Pools</Typography>
          {Pools}
        </Stack>
      </Drawer>
    </>
  );
};

export default PriceButton;

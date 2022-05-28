import React, { useState } from 'react';
import { Box, Button, Popper, Stack, Typography } from '@mui/material';
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
  const pools = usePools();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (anchorEl) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };
  const Icon = anchorEl ? ArrowDropUpIcon : ArrowDropDownIcon;
  return (
    <>
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
        onClick={handleClick}
        disableRipple
        sx={{
          borderBottomLeftRadius: anchorEl ? 0 : undefined,
          borderBottomRightRadius: anchorEl ? 0 : undefined,
          zIndex: anchorEl ? 999 : undefined,
          mr: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          ${beanPrice[0].toFixed(4)}
        </Typography>
      </Button>
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        disablePortal
      >
        <Box
          sx={(theme) => ({
            background: 'white',
            width: '350px',
            borderColor: 'primary.main',
            overflow: 'hidden',
            borderBottomLeftRadius: theme.shape.borderRadius,
            borderBottomRightRadius: theme.shape.borderRadius,
            borderTopRightRadius: theme.shape.borderRadius,
            px: 1,
            py: 1,
            boxShadow: theme.shadows[1],
          })}
          className="border border-t-0 shadow-xl"
        >
          <Stack gap={1}>
            {Object.values(pools).map((pool) => (
              <PoolCard
                key={pool.address}
                pool={pool}
                poolState={beanPools[pool.address]}
              />
            ))}
          </Stack>
        </Box>
      </Popper>
    </>
  );
};

export default PriceButton;

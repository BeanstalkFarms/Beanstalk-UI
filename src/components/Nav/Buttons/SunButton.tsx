import React from 'react';
import {
  ButtonProps,
  Stack,
  Typography,
  useMediaQuery,
  Box,
} from '@mui/material';
import { NEW_BN } from 'constants/index';
import FolderMenu from '../FolderMenu';
import useSeason from 'hooks/useSeason';
import drySeasonIcon from 'img/beanstalk/sun/dry-season.svg';
import rainySeasonIcon from 'img/beanstalk/sun/rainy-season.svg';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import SeasonCard from '../SeasonCard';
import UpcomingSeasonCard from '../UpcomingSeasonCard';

// ------------------------------------------------------------

// ------------------------------------------------------------

const PriceButton: React.FC<ButtonProps> = ({ ...props }) => {
  // Data
  // const pools     = usePools();
  // const chainId   = useChainId();
  const season = useSeason();
  const beanPrice = useSelector<AppState, AppState['_bean']['token']['price']>(
    (state) => state._bean.token.price
  );
  // const beanPools = useSelector<AppState, AppState['_bean']['pools']>(
  //   (state) => state._bean.pools
  // );

  // Theme
  const isTiny = useMediaQuery('(max-width:350px)');

  // Button Content
  const isLoading = season.eq(NEW_BN);
  const startIcon = isTiny ? undefined : (
    <img
      src={beanPrice.gt(1) ? rainySeasonIcon : drySeasonIcon}
      style={{ width: 25, height: 25 }}
      alt="Dry Season"
    />
  );

  // Header
  const HeaderUpcomingSeasonandLabels = (
    <Stack direction="column">
      <Typography
        color="text.primary"
        sx={{ fontSize: '14px', fontWeight: 700, pb: 1 }}
      >
        Upcoming Season in 42m
      </Typography>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography
          color="text.primary"
          sx={{ fontSize: '14px', fontWeight: 500 }}
        >
          Season
        </Typography>
        <Typography
          color="text.primary"
          sx={{ fontSize: '14px', fontWeight: 500 }}
        >
          Precipitation
        </Typography>
        <Typography
          color="text.primary"
          sx={{ fontSize: '14px', fontWeight: 500 }}
        >
          New Beans
        </Typography>
        <Typography
          color="text.primary"
          sx={{ fontSize: '14px', fontWeight: 500 }}
        >
          New Soil
        </Typography>
        <Typography
          color="text.primary"
          sx={{ fontSize: '14px', fontWeight: 500 }}
        >
          Weather
        </Typography>
      </Stack>
    </Stack>
  );

  const HeaderPastSeasonsLabel = (
    <Typography
      color="text.primary"
      sx={{ fontSize: '14px', fontWeight: 700, pb: 1 }}
    >
      Past Seasons
    </Typography>
  );

  const seasonsContent = (
    <div>
      <SeasonCard />
    </div>
  );

  return (
    <FolderMenu
      startIcon={startIcon}
      buttonContent={<>{isLoading ? '0000' : season.toFixed()}</>}
      drawerContent={
        <Stack sx={{ p: 2 }} gap={2}>
          <Typography variant="h2">Title (only on mobile)</Typography>
          <Stack gap={1}>{seasonsContent}</Stack>
        </Stack>
      }
      popoverContent={
        <Stack>
          {HeaderUpcomingSeasonandLabels}
          <UpcomingSeasonCard />
          {HeaderPastSeasonsLabel}
          <Stack gap={1}>{seasonsContent}</Stack>
        </Stack>
      }
      {...props}
    />
  );
};

export default PriceButton;

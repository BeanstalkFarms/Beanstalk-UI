import React from 'react';
import {
  ButtonProps,
  Stack,
  Typography,
  useMediaQuery,
  Box,
  Grid,
} from '@mui/material';
import { NEW_BN } from 'constants/index';
import useSeason from 'hooks/useSeason';
import drySeasonIcon from 'img/beanstalk/sun/dry-season.svg';
import rainySeasonIcon from 'img/beanstalk/sun/rainy-season.svg';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import SunriseButton from 'components/Sun/SunriseButton';
import BigNumber from 'bignumber.js';
import FolderMenu from '../FolderMenu';
import { BeanstalkPalette } from '../../App/muiTheme';
import SeasonCard from '../SeasonCard';

const mockSunData = new Array(20).fill(null).map((_, i) => ({
    season: new BigNumber(5000 * Math.random()),
    newBeans: new BigNumber(100000 * Math.random()),
    newSoil: new BigNumber(1000 * Math.random()),
    weather: new BigNumber(5000 * Math.random()),
  })
);

const MAX_ITEMS = 5;

const PriceButton: React.FC<ButtonProps> = ({ ...props }) => {
  const season = useSeason();
  const beanPrice = useSelector<AppState, AppState['_bean']['token']['price']>(
    (state) => state._bean.token.price
  );

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

  const tableContent = (
    <Stack gap={1}>
      {/* Upcoming Season Header */}
      <Box>
        <Typography
          color="text.primary"
          variant="h3"
        >
          Upcoming Season in 42m
        </Typography>
        {/* table header */}
        <Box
          display="flex"
          sx={{
            px: 1, // 1 + 2 from Table Body
            pt: 1,
            pb: 0.5,
          }}
        >
          <Grid container alignItems="flex-end">
            <Grid item md={2} xs={4}>
              <Typography color="text.primary" sx={{ fontSize: '14px' }}>Season</Typography>
            </Grid>
            <Grid item md={2.6} xs={0} display={{ xs: 'none', md: 'block' }}>
              <Typography color="text.primary" sx={{ fontSize: '14px' }}>Precipitation</Typography>
            </Grid>
            <Grid item md={2.6} xs={0} display={{ xs: 'none', md: 'block' }}>
              <Typography color="text.primary" sx={{ fontSize: '14px' }}>New Beans</Typography>
            </Grid>
            <Grid item md={2.4} xs={0} display={{ xs: 'none', md: 'block' }}>
              <Typography color="text.primary" sx={{ fontSize: '14px' }}>New Soil</Typography>
            </Grid>
            <Grid item md={2.4} xs={8} sx={{ textAlign: 'right' }}>
              <Typography color="text.primary" sx={{ fontSize: '14px' }}>Weather</Typography>
            </Grid>
          </Grid>
        </Box>
        {/* current season */}
        <SeasonCard
          season={new BigNumber(7845)}
          newBeans={new BigNumber(100000)}
          newSoil={new BigNumber(1000)}
          weather={new BigNumber(5000)}
        />
      </Box>
      {/* Past Seasons */}
      <Typography
        color="text.primary"
        variant="h3"
      >
        Past Seasons
      </Typography>
      <Stack gap={1} sx={{ maxHeight: `${(37.5 + 10) * MAX_ITEMS - 10}px`, overflowY: 'auto' }}>
        {mockSunData.map((s) => (
          <SeasonCard
            key={s.season.toString()}
            season={s.season}
            newBeans={s.newBeans}
            newSoil={s.newSoil}
            weather={s.weather}
          />
        ))}
      </Stack>
      <Typography align="center" color={BeanstalkPalette.lightishGrey} sx={{ fontSize: '14px' }}>The Sunrise advances Beanstalk to the next season for a Bean reward. Beanstalk will only accept the first Sunrise call every season, so this function will often fail.</Typography>
      <SunriseButton />
    </Stack>
  );

  return (
    <FolderMenu
      startIcon={startIcon}
      buttonContent={<>{isLoading ? '0000' : season.toFixed()}</>}
      drawerContent={<Box sx={{ p: 1 }}>{tableContent}</Box>}
      popoverContent={tableContent}
      {...props}
    />
  );
};

export default PriceButton;

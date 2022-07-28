import React from 'react';
import {
  ButtonProps,
  Stack,
  Typography,
  useMediaQuery,
  Box,
  Grid, Divider,
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

const mockSunData = new Array(20).fill(null).map(() => ({
  season: new BigNumber(5000 * Math.random()),
  newBeans: new BigNumber(100000 * Math.random()),
  newSoil: new BigNumber(1000 * Math.random()),
  weather: new BigNumber(5000 * Math.random()),
}));

const MAX_ITEMS = 8;

const PriceButton: React.FC<ButtonProps> = ({ ...props }) => {
  /// DATA
  const season    = useSeason();
  const beanPrice = useSelector<AppState, AppState['_bean']['token']['price']>(
    (state) => state._bean.token.price
  );

  /// Theme
  const isTiny = useMediaQuery('(max-width:350px)');

  /// Button Content
  const isLoading = season.eq(NEW_BN);
  const startIcon = isTiny ? undefined : (
    <img
      src={beanPrice.gt(1) ? rainySeasonIcon : drySeasonIcon}
      style={{ width: 25, height: 25 }}
      alt="Dry Season"
    />
  );

  /// Table Content
  const tableContent = (
    <Stack gap={1}>
      {/* Past Seasons */}
      <Stack
        gap={1}
        sx={{
          maxHeight: `${(37.5 + 10) * MAX_ITEMS - 10}px`,
          overflowY: 'auto',
        }}
      >
        <Typography color="text.primary" variant="h4">
          Season X in 42m
        </Typography>
        {/* table header */}
        <Box
          display="flex"
          sx={{
            px: 1, // 1 + 2 from Table Body
          }}
        >
          <Grid container alignItems="flex-end">
            <Grid item md={2} xs={2.5}>
              <Typography color="text.primary" variant="bodySmall">
                Season
              </Typography>
            </Grid>
            <Grid item md={2.6} xs={0} display={{ xs: 'none', md: 'block' }}>
              <Typography color="text.primary" variant="bodySmall">
                Precipitation
              </Typography>
            </Grid>
            <Grid item md={2.6} xs={3} display={{ md: 'block' }}>
              <Typography color="text.primary" variant="bodySmall">
                New Beans
              </Typography>
            </Grid>
            <Grid item md={2.4} xs={3} display={{ md: 'block' }}>
              <Typography color="text.primary" variant="bodySmall">
                New Soil
              </Typography>
            </Grid>
            <Grid item md={2.4} xs={3.5} sx={{ textAlign: 'right' }}>
              <Typography color="text.primary" variant="bodySmall">
                Weather
              </Typography>
            </Grid>
          </Grid>
        </Box>
        {/* Upcoming Season */}
        <SeasonCard
          season={new BigNumber(7845)}
          newBeans={new BigNumber(0)}
          newSoil={new BigNumber(0)}
          weather={new BigNumber(5000)}
        />
        {/* Past Seasons */}
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
      <Divider />
      <Typography
        align="center"
        color={BeanstalkPalette.lightishGrey}
        sx={{ fontSize: '14px' }}
      >
        Sunrise advances Beanstalk to the next Season and Beanstalk pays a Bean
        reward to the sender of the first successful Sunrise call at the top of
        the hour. Bots often call Sunrise, so calling this function from the
        website will often fail.
      </Typography>
      <SunriseButton />
    </Stack>
  );

  return (
    <FolderMenu
      startIcon={startIcon}
      buttonContent={<>{isLoading ? '0000' : season.toFixed()}</>}
      drawerContent={<Box sx={{ p: 1 }}>{tableContent}</Box>}
      popoverContent={tableContent}
      hideTextOnMobile
      popperWidth="500px"
      hotkey="opt+x, alt+x"
      {...props}
    />
  );
};

export default PriceButton;

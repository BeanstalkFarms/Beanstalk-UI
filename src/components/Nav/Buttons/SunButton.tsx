import React, { useMemo } from 'react';
import {
  ButtonProps,
  Stack,
  Typography,
  useMediaQuery,
  Box,
  Grid, Divider,
} from '@mui/material';
import omit from 'lodash/omit';
import { NEW_BN } from 'constants/index';
import useSeason from 'hooks/useSeason';
import drySeasonIcon from 'img/beanstalk/sun/dry-season.svg';
import rainySeasonIcon from 'img/beanstalk/sun/rainy-season.svg';
import SunriseButton from 'components/Sun/SunriseButton';
import BigNumber from 'bignumber.js';
import usePrice from 'hooks/usePrice';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { useSunButtonQuery } from 'generated/graphql';
import FolderMenu from '../FolderMenu';
import { BeanstalkPalette } from '../../App/muiTheme';
import SeasonCard from '../SeasonCard';

const mockSunData = new Array(20).fill(null).map(() => ({
  season: new BigNumber(5000 * Math.random()),
  newBeans: new BigNumber(100000 * Math.random()),
  newSoil: new BigNumber(100000 * Math.random()),
  temperature: new BigNumber(5000 * Math.random()),
  podRate: new BigNumber(100 * Math.random()),
  deltaWeather: new BigNumber(1000 * Math.random()),
  deltaDemand: new BigNumber(150 * Math.random()),
}));

const MAX_ITEMS = 8;

const PriceButton: React.FC<ButtonProps> = ({ ...props }) => {
  /// DATA
  const season    = useSeason();
  const beanPrice = usePrice();
  const awaiting  = useSelector<AppState, boolean>((state) => state._beanstalk.sun.sunrise.awaiting);
  const { data, loading } = useSunButtonQuery();

  const bySeason = useMemo(() => {
    if (data?.fields && data?.seasons) {
      type X = (typeof data.fields[number] & typeof data.seasons[number])
      const _data : { [key: number] : Partial<X> } = {};
      data?.fields.forEach((_f) => {
        _data[_f.season] = { ...omit(_f, '__typename') };
      });
      data?.seasons.forEach((_s) => {
        _data[_s.season] = { ..._data[_s.season], ...omit(_s, '__typename') };
      });
      return Object.keys(_data).sort((a, b) => parseInt(b, 10) - parseInt(a, 10)).reduce<X[]>((prev, curr) => {
        prev.push(_data[curr as unknown as number]);
        return prev;
      }, []);
    }
    return [];
  }, [data]);

  /// Theme
  const isTiny = useMediaQuery('(max-width:350px)');

  /// Button Content
  const isLoading = season.eq(NEW_BN);
  const startIcon = isTiny ? undefined : (
    <img
      src={beanPrice.lte(1) || awaiting ? drySeasonIcon : rainySeasonIcon}
      style={{
        width: 25,
        height: 25,
        animation: awaiting ? 'rotate linear 2000ms' : 'none',
        animationIterationCount: 'infinite',
      }}
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
          width: '100%',
          pr: 1,
          maxHeight: `${(37.5 + 10) * MAX_ITEMS - 10}px`,
          overflowY: 'auto',
        }}
      >
        <Stack>
          <Typography color="text.primary" variant="h4">
            42m to next season
          </Typography>
          <Typography color="gray" variant="bodySmall">
            Beanstalk is currently minting{' '}
            <span style={{ color: BeanstalkPalette.black }}>1%</span> of deltaB.
            It will mint{' '}
            <span style={{ color: BeanstalkPalette.black }}>1%</span> more every
            Season until{' '}
            <span style={{ color: BeanstalkPalette.black }}>100%</span>
          </Typography>
        </Stack>
        {/* table header */}
        <Box
          display="flex"
          sx={{
            px: 1, // 1 + 2 from Table Body
          }}
        >
          <Grid container>
            <Grid item xs={1.5} md={1.25}>
              <Stack alignItems="flex-start">
                <Typography color="text.primary" variant="bodySmall">
                  Season
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={3} md={2}>
              <Stack alignItems="flex-end">
                <Typography color="text.primary" variant="bodySmall">
                  New Beans
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={3} md={2}>
              <Stack alignItems="flex-end">
                <Typography color="text.primary" variant="bodySmall">
                  New Soil
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={4} md={2.75}>
              <Stack alignItems="flex-end">
                <Typography color="text.primary" variant="bodySmall">
                  Temperature
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={0} md={2} display={{ xs: 'none', md: 'block' }}>
              <Stack alignItems="flex-end">
                <Typography color="text.primary" variant="bodySmall">
                  Pod Rate
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={0} md={2} display={{ xs: 'none', md: 'block' }}>
              <Stack alignItems="flex-end">
                <Typography color="text.primary" variant="bodySmall">
                  Delta Demand
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Box>
        <SeasonCard
          season={new BigNumber(7845)}
          newBeans={new BigNumber(0)}
          newSoil={new BigNumber(0)}
          podRate={new BigNumber(5000)}
          temperature={new BigNumber(5000)}
          deltaDemand={new BigNumber(100)}
        />
        <Typography color="gray" variant="bodySmall" align="center">
          The values for Season {season.toNumber()} are preductions based on use
          behavior during the current season
        </Typography>
        {mockSunData.map((s) => (
          <SeasonCard
            key={s.season.toString()}
            season={s.season}
            newBeans={s.newBeans}
            newSoil={s.newSoil}
            temperature={s.deltaDemand}
            podRate={s.podRate}
            deltaDemand={s.deltaDemand}
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
      popperWidth="700px"
      hotkey="opt+2, alt+2"
      {...props}
    />
  );
};

export default PriceButton;

import React, { useMemo } from 'react';
import {
  ButtonProps,
  Stack,
  Typography,
  useMediaQuery,
  Box,
  Grid,
  Divider,
} from '@mui/material';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import drySeasonIcon from '~/img/beanstalk/sun/dry-season.svg';
import rainySeasonIcon from '~/img/beanstalk/sun/rainy-season.svg';
import SunriseButton from '~/components/Sun/SunriseButton';
import { SunButtonQuery, useSunButtonQuery } from '~/generated/graphql';
import usePrice from '~/hooks/usePrice';
import useSeason from '~/hooks/useSeason';
import { MaxBN, MinBN, toTokenUnitsBN } from '~/util';
import { BEAN } from '~/constants/tokens';
import { NEW_BN, ZERO_BN } from '~/constants';
import { AppState } from '~/state';
import FolderMenu from '../FolderMenu';
import { BeanstalkPalette } from '../../App/muiTheme';
import SeasonCard from '../SeasonCard';
import usePeg from '~/hooks/usePeg';

const castField = (data: SunButtonQuery['fields'][number]) => ({
  season:   new BigNumber(data.season),
  newSoil:  toTokenUnitsBN(data.newSoil, BEAN[1].decimals),
  temperature: new BigNumber(data.weather),
  podRate:  new BigNumber(data.podRate),
});
const castSeason = (data: SunButtonQuery['seasons'][number]) => ({
  season:      new BigNumber(data.season),
  price:       new BigNumber(data.price),
  rewardBeans: toTokenUnitsBN(
    data.season <= 6074
      ? data.deltaBeans
      : data.rewardBeans,
    BEAN[1].decimals
  ),
});

const MAX_ITEMS = 8;

const PriceButton: React.FC<ButtonProps> = ({ ...props }) => {
  /// DATA
  const season    = useSeason();
  const price     = usePrice();
  const awaiting  = useSelector<AppState, boolean>((state) => state._beanstalk.sun.sunrise.awaiting);
  const { data }  = useSunButtonQuery({ fetchPolicy: 'cache-and-network' });
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>((state) => state._beanstalk.field);
  const peg = usePeg();

  const bySeason = useMemo(() => {
    if (data?.fields && data?.seasons) {
      type MergedSeason = (
        ReturnType<typeof castField>
        & ReturnType<typeof castSeason>
      );

      // Build mapping of season => data
      const merged : { [key: number] : MergedSeason } = {};
      data.fields.forEach((_f) => {
        // fixme: need intermediate type?
        // @ts-ignore
        merged[_f.season] = { ...castField(_f) };
      });
      data.seasons.forEach((_s) => {
        merged[_s.season] = { ...merged[_s.season], ...castSeason(_s) };
      });

      // Sort latest season first and return as array
      return (
        Object.keys(merged)
          .sort((a, b) => parseInt(b, 10) - parseInt(a, 10))
          .reduce<MergedSeason[]>((prev, curr) => {
            prev.push(merged[curr as unknown as number]);
            return prev;
          }, [])
      );
    }
    return [];
  }, [data]);

  console.log('BY SEASON', bySeason);

  /// Theme
  const isTiny = useMediaQuery('(max-width:350px)');

  /// Button Content
  const isLoading = season.eq(NEW_BN);
  const startIcon = isTiny ? undefined : (
    <img
      src={price.lte(1) || awaiting ? drySeasonIcon : rainySeasonIcon}
      style={{
        width: 25,
        height: 25,
        animation: awaiting ? 'rotate linear 2000ms' : 'none',
        animationIterationCount: 'infinite',
      }}
      alt=""
    />
  );

  /// 6074 = 0%
  /// 6075 = 0%
  /// 6076 = 1%
  const nextSeasonRamp = MinBN(MaxBN(season.minus(6075).plus(1), ZERO_BN), new BigNumber(100));

  /// Table Content
  const tableContent = (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Past Seasons */}
      <Stack
        gap={1}
        sx={{
          width: '100%',
          pt: 1,
          px: 1,
          maxHeight: `${(37.5 + 10) * MAX_ITEMS - 10}px`,
          overflowY: 'auto',
        }}
      >
        <Stack>
          <Typography color="gray" variant="bodySmall" textAlign="center">
            Next Sunrise, Beanstalk will mint{' '}
            <span style={{ color: BeanstalkPalette.black }}>{nextSeasonRamp.toFixed(0)}%</span> of deltaB.
            It will mint{' '}
            <span style={{ color: BeanstalkPalette.black }}>1%</span> more of deltaB every
            Season until{' '}
            <span style={{ color: BeanstalkPalette.black }}>100%</span>.
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
          season={season.plus(1)}
          price={price}
          rewardBeans={peg.rewardBeans}
          newSoil={peg.soilStart}
          podRate={NEW_BN}
          temperature={beanstalkField.weather.yield.plus(peg.deltaTemperature)} // FIXME expected
          deltaDemand={peg.deltaPodDemand}
          deltaTemperature={peg.deltaTemperature}
          isNew
        />
        {bySeason.map((s, i) => {
          const deltaTemperature = bySeason[i + 1] 
            ? s.temperature?.minus(bySeason[i + 1].temperature)
            : ZERO_BN;
          return (
            <SeasonCard
              key={s.season.toString()}
              season={s.season}
              // Season
              price={s.price}
              rewardBeans={s.rewardBeans}
              // Field
              temperature={s.temperature}
              deltaTemperature={deltaTemperature}
              deltaDemand={undefined}
              newSoil={s.newSoil}
              podRate={s.podRate}
            />
          );
        })}
      </Stack>
      <Divider sx={{ borderBottomWidth: 0 }} />
      <Box sx={{ p: 1 }}>
        <SunriseButton />
      </Box>
    </Box>
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
      zIndex={997}
      {...props}
    />
  );
};

export default PriceButton;

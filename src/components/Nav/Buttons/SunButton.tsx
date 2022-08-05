import React, { useMemo } from 'react';
import {
  ButtonProps,
  Stack,
  Typography,
  useMediaQuery,
  Box,
  Grid, Divider,
} from '@mui/material';
import useSeason from 'hooks/useSeason';
import drySeasonIcon from 'img/beanstalk/sun/dry-season.svg';
import rainySeasonIcon from 'img/beanstalk/sun/rainy-season.svg';
import SunriseButton from 'components/Sun/SunriseButton';
import BigNumber from 'bignumber.js';
import usePrice from 'hooks/usePrice';
import { useSelector } from 'react-redux';
import { SunButtonQuery, useSunButtonQuery } from 'generated/graphql';
import { MaxBN, MinBN, toTokenUnitsBN } from 'util/index';
import useChainId from 'hooks/useChain';
import { BEAN } from '~/constants/tokens';
import { NEW_BN, SupportedChainId, ZERO_BN } from '~/constants/index';
import { AppState } from '~/state';
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

const castField = (data: SunButtonQuery['fields'][number]) => ({
  season:   new BigNumber(data.season),
  newSoil:  toTokenUnitsBN(data.newSoil, BEAN[1].decimals),
  temperature: new BigNumber(data.weather),
  podRate:  new BigNumber(data.podRate),
});
const castSeason = (data: SunButtonQuery['seasons'][number]) => ({
  season:     new BigNumber(data.season),
  twap:       new BigNumber(data.price),
  deltaBeans: toTokenUnitsBN(data.deltaBeans, BEAN[1].decimals),
});

const MAX_ITEMS = 8;

const PriceButton: React.FC<ButtonProps> = ({ ...props }) => {
  /// DATA
  const season    = useSeason();
  const beanPrice = usePrice();
  const chainId   = useChainId();
  const awaiting  = useSelector<AppState, boolean>((state) => state._beanstalk.sun.sunrise.awaiting);
  const { data, loading } = useSunButtonQuery();

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

  /// 6074 = 0%
  /// 6075 = 0%
  /// 6076 = 1%
  const ramp = MinBN(MaxBN(season.minus(6075), ZERO_BN), new BigNumber(100));

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
          {/* <Typography color="text.primary" variant="h4"> */}
          {/*  42m to next season */}
          {/* </Typography> */}
          <Typography color="gray" variant="bodySmall" textAlign="center">
            Beanstalk is currently minting{' '}
            <span style={{ color: BeanstalkPalette.black }}>{ramp.toFixed(0)}%</span> of deltaB.
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
          twap={new BigNumber(1)}
          newBeans={new BigNumber(0)}
          newSoil={new BigNumber(0)}
          podRate={new BigNumber(5000)}
          temperature={new BigNumber(5000)}
          deltaDemand={new BigNumber(100)}
          deltaTemperature={new BigNumber(100)}
          pulse
        />
        {bySeason.map((s, i) => {
          const deltaWeather = bySeason[i + 1] 
            ? s.temperature?.minus(bySeason[i + 1].temperature)
            : ZERO_BN;
          return (
            <SeasonCard
              key={s.season.toString()}
              season={s.season}
              // Season
              twap={s.twap}
              newBeans={s.deltaBeans}
              // Field
              temperature={s.temperature}
              deltaTemperature={deltaWeather}
              deltaDemand={new BigNumber(-1)}
              newSoil={s.newSoil}
              podRate={s.podRate}
            />
          );
        })}
      </Stack>
      <Divider />
      {chainId === SupportedChainId.MAINNET ? null : <SunriseButton />}
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

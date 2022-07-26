import React from 'react';
import {
  ButtonProps,
  Stack,
  Typography,
  useMediaQuery,
  Box,
  Divider,
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
import { useSeasonTableStyles } from '../utils';

const mockSunData = new Array(20).fill(null).map(() => ({
  season: new BigNumber(5000 * Math.random()),
  newBeans: new BigNumber(100000 * Math.random()),
  newSoil: new BigNumber(100000 * Math.random()),
  temperature: new BigNumber(5000 * Math.random()),
  podRate: new BigNumber(100 * Math.random()),
  deltaDemand: new BigNumber(150 * Math.random()),
}));

const MAX_ITEMS = 8;

const PriceButton: React.FC<ButtonProps> = ({ ...props }) => {
  const season = useSeason();
  const beanPrice = useSelector<AppState, AppState['_bean']['token']['price']>(
    (state) => state._bean.token.price
  );
  const tableStyles = useSeasonTableStyles();
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
      {/* Past Seasons */}
      <Stack
        gap={1}
        sx={{
          width: '100%',
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
          <Stack direction="row" width="100%" justifyContent="space-between">
            <Stack sx={tableStyles.season}>
              <Typography color="text.primary" variant="bodySmall">
                Season
              </Typography>
            </Stack>
            <Stack sx={tableStyles.newBeans}>
              <Typography color="text.primary" variant="bodySmall">
                New Beans
              </Typography>
            </Stack>
            <Stack sx={tableStyles.newSoil}>
              <Typography color="text.primary" variant="bodySmall">
                New Soil
              </Typography>
            </Stack>
            <Stack sx={tableStyles.temperature}>
              <Typography color="text.primary" variant="bodySmall">
                Temperature
              </Typography>
            </Stack>
            <Stack sx={tableStyles.podRate}>
              <Typography color="text.primary" variant="bodySmall">
                Pod Rate
              </Typography>
            </Stack>
            <Stack sx={tableStyles.deltaDemand}>
              <Typography color="text.primary" variant="bodySmall">
                Delta Demand
              </Typography>
            </Stack>
          </Stack>
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
      {...props}
    />
  );
};

export default PriceButton;

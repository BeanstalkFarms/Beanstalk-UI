import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Card, Stack, Typography, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import useHumidity from '~/hooks/useHumidity';
import SunriseCountdown from '~/components/Sun/SunriseCountdown';
import useSeason from '~/hooks/useSeason';
import { AppState } from '~/state';
import { displayFullBN } from '~/util';
import FertilizerImage from './FertilizerImage';
import { BeanstalkPalette, FontSize } from '../App/muiTheme';
import useFertilizerProgress from '../../hooks/useFertilizerProgress';

const RemainingFertilizer: React.FC = () => {
  const [humidity, nextDecreaseAmount] = useHumidity();
  const barn = useSelector<AppState, AppState['_beanstalk']['barn']>((state) => state._beanstalk.barn);
  const season = useSeason();
  
  const nextDecreaseTimeString = season.eq(6074)
    ? 'per Season upon Unpause'
    :  <SunriseCountdown />;
  const progress = useFertilizerProgress();

  return (
    <Card sx={{ p: 2 }}>
      <Stack gap={1}>
        <Typography variant="h4">Barn Conditions</Typography>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'left', md: 'stretch' }}
          justifyContent={{ md: 'left' }}
          gap={2}
        >
          {/* left column */}
          <Box sx={{ minWidth: 10, display: { xs: 'none', md: 'block' } }}>
            <FertilizerImage progress={Math.max(progress.toNumber(), 0.05)} />
          </Box>
          {/* right column */}
          <Stack justifyContent="space-between" gap={2}>
            <Stack gap={0.5}>
              <Tooltip
                title="Once bought, Available Fertilizer becomes Active. Active Fertilizer comes with Sprouts, the number of Beans to be earned from Active Fertilizer. One-third of Bean mints go towards Fertilizing Sprouts when there is Active Fertilizer."
                placement="top-start"
              >
                <Typography variant="body1">
                  Available Fertilizer&nbsp;
                  <HelpOutlineIcon
                    sx={{ color: 'text.secondary', fontSize: FontSize.sm }}
                  />
                </Typography>
              </Tooltip>

              <Stack direction="row" gap={1} alignItems="center">
                <Typography
                  display="inline-block"
                  variant="bodyLarge"
                  sx={{ fontWeight: 400 }}
                >
                  {displayFullBN(barn.remaining, 0)}&nbsp;
                </Typography>
                {progress.gt(0) ? (
                  <Typography
                    display="inline-block"
                    variant="bodySmall"
                    color={BeanstalkPalette.logoGreen}
                  >
                    {displayFullBN(progress.multipliedBy(100), 2)}% Purchased
                  </Typography>
                ) : null}
              </Stack>
            </Stack>
            <Stack gap={0.5}>
              <Tooltip
                title="The interest rate on Fertilizer. The Humidity will decrease to 250% once Beanstalk is Replanted, and decrease 0.5% every Season until 20% Humidity is reached. The Humidity determines how many Sprouts come with Fertilizer."
                placement="top-start"
              >
                <Typography>
                  Humidity&nbsp;
                  <HelpOutlineIcon
                    sx={{ color: 'text.secondary', fontSize: FontSize.sm }}
                  />
                </Typography>
              </Tooltip>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="bodyLarge">
                  {displayFullBN(humidity.multipliedBy(100))}%
                </Typography>
                <Typography
                  variant="bodySmall"
                  color={BeanstalkPalette.trueRed}
                >
                  {nextDecreaseAmount.eq(0)
                    ? null
                    : displayFullBN(nextDecreaseAmount.multipliedBy(-100))}
                  % {nextDecreaseTimeString}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

export default RemainingFertilizer;

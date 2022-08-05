import React, { useMemo } from 'react';
import {
  Box,
  Card,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useHumidityAtId } from '~/hooks/useHumidity';
import FertilizerItem from '~/components/Barn/FertilizerItem';
import { MY_FERTILIZER } from '~/components/Barn/FertilizerItemTooltips';
import useTabs from '~/hooks/display/useTabs';
import EmptyState from '~/components/Common/ZeroState/EmptyState';
import { displayFullBN, MaxBN } from '~/util/Tokens';
import { SPROUTS, RINSABLE_SPROUTS } from '~/constants/tokens';
import { ZERO_BN } from '~/constants/index';
import { AppState } from '~/state';
import TokenIcon from '../Common/TokenIcon';
import { FontSize } from '../App/muiTheme';

enum TabState {
  ACTIVE = 0,
  USED = 1,
}

const MyFertilizer: React.FC = () => {
  /// Data
  const beanstalkBarn = useSelector<AppState, AppState['_beanstalk']['barn']>(
    (state) => state._beanstalk.barn
  );
  const farmerBarn = useSelector<AppState, AppState['_farmer']['barn']>(
    (state) => state._farmer.barn
  );

  /// Helpers
  const humidityAt = useHumidityAtId();
  const [tab, handleChange] = useTabs();

  /// Local data
  const tokenIds = useMemo(
    () =>
      Object.keys(farmerBarn.fertilizer).filter(
        () => tab === TabState.ACTIVE
      ),
    [farmerBarn.fertilizer, tab]
  );

  return (
    <Card>
      {/* Card Header */}
      <Stack sx={{ p: 2 }} gap={1}>
        <Typography variant="h4">Fertilizer</Typography>
        <Stack gap={1}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Tooltip
              title="The number of Beans left to be earned from your Fertilizer."
              placement="right"
            >
              <Typography variant="body1">
                Sprouts&nbsp;
                <HelpOutlineIcon
                  sx={{ color: 'text.secondary', fontSize: FontSize.sm }}
                />
              </Typography>
            </Tooltip>
            <Stack direction="row" alignItems="center" gap={0.2}>
              <TokenIcon token={SPROUTS} />
              <Typography>
                {displayFullBN(
                  MaxBN(farmerBarn.unfertilizedSprouts, ZERO_BN), SPROUTS.displayDecimals
                )}
              </Typography>
            </Stack>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Tooltip
              title="Sprouts that are redeemable for 1 Bean each. Rinsable Sprouts must be Rinsed in order to use them."
              placement="right"
            >
              <Typography variant="body1">
                Rinsable Sprouts&nbsp;
                <HelpOutlineIcon
                  sx={{ color: 'text.secondary', fontSize: FontSize.sm }}
                />
              </Typography>
            </Tooltip>
            <Stack direction="row" alignItems="center" gap={0.2}>
              <TokenIcon token={RINSABLE_SPROUTS} />
              <Typography>
                {displayFullBN(
                  MaxBN(farmerBarn.fertilizedSprouts, ZERO_BN), RINSABLE_SPROUTS.displayDecimals
                )}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
      <Divider />
      {/* Fertilizers */}
      <Stack sx={{ px: 2, pb: 2, pt: 1 }} spacing={0}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ pt: 1, pb: 2 }}
        >
          <Tabs value={tab} onChange={handleChange} sx={{ minHeight: 0 }}>
            <Tab label="Active" />
            <Tab label="Used" />
          </Tabs>
        </Stack>
        <Box>
          {tokenIds.length > 0 ? (
            <Grid container spacing={3}>
              {tokenIds.map((_id) => {
                const id = new BigNumber(_id);
                const season = new BigNumber(6_074);
                const amount = farmerBarn.fertilizer[_id];
                const humidity = humidityAt(id);
                const remaining = humidity ? amount.multipliedBy(humidity.plus(1)) : undefined;
                return (
                  <Grid key={_id} item xs={12} md={3}>
                    <FertilizerItem
                      id={id}
                      season={season}
                      state="active"
                      humidity={humidity}
                      remaining={remaining}
                      amount={amount}
                      progress={beanstalkBarn.currentBpf.div(id).toNumber()}
                      // season={season}
                      tooltip={MY_FERTILIZER}
                    />
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <EmptyState message={`Your ${tab === 0 ? 'Active' : 'Used'} Fertilizer will appear here.`} height={150} />
          )}
        </Box>
      </Stack>
    </Card>
  );
};

export default MyFertilizer;

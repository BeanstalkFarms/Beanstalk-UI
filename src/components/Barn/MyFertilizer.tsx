import React, { useMemo, useState } from 'react';
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
import { useHumidityFromId } from 'hooks/useHumidity';
import { AppState } from 'state';
import FertilizerItem from 'components/Barn/FertilizerItem';
import { ZERO_BN } from 'constants/index';
import { SPROUTS, FERTILIZED_SPROUTS } from 'constants/tokens';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { displayBN, displayFullBN } from 'util/Tokens';
import { MY_FERTILIZER } from 'components/Barn/FertilizerItemTooltips';
import useFarmerTotalFertilizer from 'hooks/useFarmerTotalFertilizer';
import useTabs from 'hooks/display/useTabs';
import TokenIcon from '../Common/TokenIcon';

enum TabState {
  ACTIVE = 0,
  USED = 1,
}

const MyFertilizer: React.FC = () => {
  const farmerFertilizer = useSelector<AppState, AppState['_farmer']['fertilizer']>(
    (state) => state._farmer.fertilizer
  );
  const getHumidity = useHumidityFromId();

  const [tab, handleChange] = useTabs();

  ///
  const tokenIds = useMemo(
    () =>
      Object.keys(farmerFertilizer.fertilizer).filter(
        () => tab === TabState.ACTIVE
      ),
    [farmerFertilizer.fertilizer, tab]
  );

  // const fertilizerSummary = useFarmerTotalFertilizer(tokenIds);

  return (
    <Card>
      {/* Card Header */}
      <Stack sx={{ p: 2 }} gap={1}>
        <Typography variant="h4">My Fertilizer</Typography>
        <Stack gap={1}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="body1">
              Sprouts&nbsp;
              <Tooltip
                title="The number of Beans left to be earned from your Fertilizer."
                placement="right"
              >
                <HelpOutlineIcon
                  sx={{ color: 'text.secondary', fontSize: '14px' }}
                />
              </Tooltip>
            </Typography>
            <Stack direction="row" alignItems="center" gap={0.2}>
              <TokenIcon token={SPROUTS} />
              <Typography>
                {displayFullBN(farmerFertilizer.unfertilizedSprouts, SPROUTS.displayDecimals)}
              </Typography>
            </Stack>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="body1">
              Fertilized Sprouts&nbsp;
              <Tooltip
                title="The number of Beans earned from your Fertilizer that can be Rinsed, or redeemed for 1 Bean each. Upon Rinse, they can be transferred to your wallet or Deposited in the Silo."
                placement="right"
              >
                <HelpOutlineIcon
                  sx={{ color: 'text.secondary', fontSize: '14px' }}
                />
              </Tooltip>
            </Typography>
            <Stack direction="row" alignItems="center" gap={0.2}>
              <TokenIcon token={FERTILIZED_SPROUTS} />
              <Typography>
                {displayFullBN(farmerFertilizer.fertilizedSprouts, FERTILIZED_SPROUTS.displayDecimals)}
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
          sx={{ py: 1 }}
        >
          <Tabs value={tab} onChange={handleChange} sx={{ minHeight: 0 }}>
            <Tab label="Active" />
            <Tab label="Used" />
          </Tabs>
        </Stack>
        <Box>
          {tokenIds.length > 0 ? (
            <Grid container spacing={4.5}>
              {tokenIds.map((_id) => {
                const id     = new BigNumber(_id);
                const season = new BigNumber(6_074);
                const amount = farmerFertilizer.fertilizer[_id];
                const [humidity] = getHumidity(); // Until Unpause, fixed to 6_074.
                const remaining = amount.multipliedBy(humidity.plus(1));
                return (
                  <Grid key={_id} item xs={12} md={4}>
                    <FertilizerItem
                      id={id}
                      season={season}
                      state="active"
                      humidity={humidity}
                      remaining={remaining}
                      amount={amount}
                      // season={season}
                      tooltip={MY_FERTILIZER}
                    />
                  </Grid>
                );
              })}
              {/* <Grid item xs={6} md={3}>test</Grid> */}
            </Grid>
          ) : (
            <Stack
              direction="column"
              justifyContent="center"
              alignItems="center"
              gap={2}
            >
              <Box width={250}>
                <FertilizerItem
                  state="used"
                  amount={ZERO_BN}
                  humidity={ZERO_BN}
                  remaining={ZERO_BN}
                  season={ZERO_BN}
                  tooltip={MY_FERTILIZER}
                />
              </Box>
              <Typography
                variant="body2"
                textAlign="center"
                sx={{ maxWidth: { md: 400 } }}
              >
                Buy Fertilizer using the module above.
              </Typography>
            </Stack>
          )}
        </Box>
      </Stack>
    </Card>
  );
};

export default MyFertilizer;

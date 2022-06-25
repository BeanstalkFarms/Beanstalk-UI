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
import FertilizerItem from 'components/BarnRaise/FertilizerItem';
import { ZERO_BN } from 'constants/index';
import { SupportedChainId } from 'constants/chains';
import { BEAN } from 'constants/tokens';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { displayBN } from 'util/Tokens';
import { MY_FERTILIZER } from 'components/BarnRaise/FertilizerItemTooltips';
import useFarmerTotalFertilizer from 'hooks/useFarmerTotalFertilizer';
import TokenIcon from '../Common/TokenIcon';

enum TabState {
  ACTIVE = 0,
  USED = 1,
}

const MyFertilizer: React.FC = () => {
  const farmerFertilizer = useSelector<AppState,
    AppState['_farmer']['fertilizer']>((state) => state._farmer.fertilizer);
  const getHumidity = useHumidityFromId();
  const [tab, setTab] = useState<TabState>(TabState.ACTIVE);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  const tokenIds = useMemo(
    () =>
      Object.keys(farmerFertilizer.tokens).filter(
        () => tab === TabState.ACTIVE
      ),
    [farmerFertilizer.tokens, tab]
  );

  const fertilizerSummary = useFarmerTotalFertilizer(tokenIds);

  return (
    <Card>
      {/* Card Header */}
      <Stack sx={{ p: 2 }} gap={1}>
        <Typography variant="h2">My Fertilizer</Typography>
        <Stack gap={1}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Tooltip
              title="The number of Beans to be earned from your Fertilizer."
              placement="right"
            >
              <Typography variant="body1">
                Unfertilized Beans&nbsp;
                <HelpOutlineIcon
                  sx={{ color: 'text.secondary', fontSize: '14px' }}
                />
              </Typography>
            </Tooltip>
            <Stack direction="row" alignItems="center" gap={0.2}>
              <TokenIcon token={BEAN[SupportedChainId.MAINNET]} />
              <Typography>
                {displayBN(fertilizerSummary.unfertilized)}
              </Typography>
            </Stack>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Tooltip
              title="The number of Beans earned from your Fertilizer."
              placement="right"
            >
              <Typography variant="body1">
                Fertilized Beans&nbsp;
                <HelpOutlineIcon
                  sx={{ color: 'text.secondary', fontSize: '14px' }}
                />
              </Typography>
            </Tooltip>
            <Stack direction="row" alignItems="center" gap={0.2}>
              <TokenIcon token={BEAN[SupportedChainId.MAINNET]} />
              <Typography>0</Typography>
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
                const amount = farmerFertilizer.tokens[_id];
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

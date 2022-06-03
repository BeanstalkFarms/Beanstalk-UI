import React, { useMemo, useState } from 'react';
import { Box, Card, Divider, Grid, Stack, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { useHumidityFromId } from 'hooks/useHumidity';
import { AppState } from 'state';
import FertilizerItem from 'components/v2/BarnRaise/FertilizerItem';
import { zeroBN } from 'constants/index';
import { SupportedChainId } from 'constants/chains';
import { BEAN } from 'constants/tokens';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { displayBN } from 'util/TokenUtilities';
import TokenIcon from '../Common/TokenIcon';

enum TabState {
  ACTIVE = 0,
  USED = 1,
}

const MyFertilizer : React.FC = () => {
  const farmerFertilizer = useSelector<AppState, AppState['_farmer']['fertilizer']>((state) => state._farmer.fertilizer);
  const getHumidity = useHumidityFromId();
  const [tab, setTab] = useState<TabState>(TabState.ACTIVE);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  const tokenIds = useMemo(() => 
    Object.keys(farmerFertilizer.tokens).filter(
      () => (tab === TabState.ACTIVE)
    ),
    [farmerFertilizer.tokens, tab]
  );

  const fertilizerSummary = useMemo(
    () => tokenIds.reduce(
      (agg, thisId) => {
        const [humidity] = getHumidity(); // new BigNumber(thisId);
        const amount = farmerFertilizer.tokens[thisId];
        agg.unfertilized = agg.unfertilized.plus(
          amount.multipliedBy(humidity.plus(1))
        );
        return agg;
      },
      { unfertilized: new BigNumber(0) }
    ),
    [farmerFertilizer, tokenIds, getHumidity]
  );

  return (
    <Card>
      {/* Card Header */}
      <Stack sx={{ p: 2 }} gap={1}>
        <Typography variant="h2">My Fertilizer</Typography>
        <Stack gap={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Tooltip title="Beans owed to you based on your ownership of Fertilizer." placement="right">
              <Typography variant="body1">
                Total Unfertilized Beans&nbsp;<HelpOutlineIcon fontSize="14px" sx={{ color: 'text.secondary' }} />
              </Typography>
            </Tooltip>
            <Stack direction="row" alignItems="center" gap={0.2}>
              <TokenIcon token={BEAN[SupportedChainId.MAINNET]} />&nbsp;
              <Typography>{displayBN(fertilizerSummary.unfertilized, 0)}</Typography>
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Tooltip title="Beans earned from Fertilizer. These Beans are Claimable." placement="right">
              <Typography variant="body1">
                Total Fertilized Beans&nbsp;<HelpOutlineIcon fontSize="14px" sx={{ color: 'text.secondary' }} />
              </Typography>
            </Tooltip>
            <Stack direction="row" alignItems="center" gap={0.1}>
              <TokenIcon token={BEAN[SupportedChainId.MAINNET]} />&nbsp;
              <Typography>0</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
      <Divider />
      {/* Fertilizers */}
      <Stack sx={{ px: 2, pb: 2 }} spacing={0}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
          <Tabs value={tab} onChange={handleChange} sx={{ minHeight: 0 }}>
            <Tab label="Active" />
            <Tab label="Used" />
          </Tabs>
        </Stack>
        <Box>
          {tokenIds.length > 0 ? (
            <Grid container spacing={2}>
              {tokenIds.map((id) => {
                const season = new BigNumber(id);
                const [humidity] = getHumidity(season);
                const amount = farmerFertilizer.tokens[id];
                const remaining = amount.multipliedBy(humidity.plus(1));
                return (
                  <Grid key={id} item xs={12} md={3}>
                    <FertilizerItem
                      state="active"
                      humidity={humidity}
                      remaining={remaining}
                      amount={amount}
                    />
                  </Grid>
                );
              })}
              {/* <Grid item xs={6} md={3}>test</Grid> */}
            </Grid>
          ) : (
            <Stack direction="column" justifyContent="center" alignItems="center" gap={2}>
              <Box width={155}>
                <FertilizerItem
                  state="used"
                  amount={zeroBN}
                  humidity={zeroBN}
                  remaining={zeroBN}
                />
              </Box>
              <Typography variant="body2" textAlign="center">
                Purchase Fertilizer using the module above to receive interest at the specified Humidity in the form of future Bean mints.
              </Typography>
            </Stack>
          )}
        </Box>
      </Stack>
    </Card>
  );
};

export default MyFertilizer;

import React from 'react';
import { Button, Card, Grid, Stack, Typography } from '@mui/material';
import seedIcon from 'img/beanstalk/seed-icon.svg';
import stalkIcon from 'img/beanstalk/stalk-icon.svg';
import beanCircleIcon from 'img/tokens/bean-logo-circled.svg';
import { AppState } from 'state';
import { displayBN } from 'util/index';

const RewardsCard: React.FC<{
  farmerSilo: AppState['_farmer']['silo'];
  farmerField: AppState['_farmer']['field'];
}> = ({
  farmerSilo,
  farmerField,
}) => (
  <Card sx={{ p: 2 }}>
    <Grid container direction="row" justifyContent="space-between" spacing={2}>
      <Grid item xs={12} md={5}>
        <Stack>
          <Typography variant="h2">Inactive Rewards</Typography>
          <Stack gap={0.8} sx={{ pt: 1 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography>Earned Seed</Typography>
              <Stack direction="row" alignItems="center" gap={0.2}>
                <Typography>+</Typography>
                <img alt="" src={seedIcon} height="18px" />
                <Typography>{displayBN(farmerSilo.seeds.earned)}</Typography>
              </Stack>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography>Grown Stalk</Typography>
              <Stack direction="row" alignItems="center" gap={0.2}>
                <Typography>+</Typography>
                <img alt="" src={stalkIcon} height="18px" />
                <Typography>{displayBN(farmerSilo.stalk.grown)}</Typography>
              </Stack>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography>Harvestable Pods</Typography>
              <Stack direction="row" alignItems="center" gap={0.2}>
                <Typography>+</Typography>
                <img alt="" src={beanCircleIcon} height="18px" />
                <Typography>{displayBN(farmerField.harvestablePods)}</Typography>
              </Stack>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography>Unclaimed Beans from Fertilizer</Typography>
              <Stack direction="row" alignItems="center" gap={0.2}>
                <Typography>+</Typography>
                <img alt="" src={beanCircleIcon} height="18px" />
                <Typography>2000</Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Grid>
      <Grid item xs={12} md={5}>
        <Stack height="100%">
          <Typography variant="h2">Active Rewards</Typography>
          <Stack gap={1} sx={{ pt: 1 }} justifyContent="space-between" height="100%">
            <Stack gap={0.8}>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Earned Beans</Typography>
                <Stack direction="row" alignItems="center" gap={0.2}>
                  <Typography>+</Typography>
                  <img alt="" src={beanCircleIcon} height="18px" />
                  <Typography>{displayBN(farmerSilo.beans.earned)}</Typography>
                </Stack>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Earned Stalk</Typography>
                <Stack direction="row" alignItems="center" gap={0.2}>
                  <Typography>+</Typography>
                  <img alt="" src={stalkIcon} height="18px" />
                  <Typography>{displayBN(farmerSilo.stalk.earned)}</Typography>
                </Stack>
              </Stack>
            </Stack>
            <Button sx={{ p: 1 }}>
              Claim all Rewards
            </Button>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  </Card>
  );

export default RewardsCard;

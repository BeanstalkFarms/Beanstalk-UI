/* eslint-disable */
import React from 'react';
import {Box, Button, Card, Grid, Stack, Typography} from '@mui/material';
import {makeStyles} from '@mui/styles';
import seedIcon from "../../../../img/seed-logo.svg";
import stalkIcon from "../../../../img/stalk-logo.svg";
import beanCircleIcon from "../../../../img/bean-circle.svg";

const useStyles = makeStyles(() => ({}))

export interface RewardsCardProps {
  title: string;
}

const RewardsCard: React.FC<RewardsCardProps> = ({title}) => {
  const classes = useStyles();

  return (
    <Card sx={{p: 2}}>
      <Grid container direction="row" justifyContent="space-between" spacing={2}>
        <Grid item xs={12} md={4.5}>
          <Stack>
            <Typography variant="h2">Inactive Rewards</Typography>
            <Stack gap={0.5} sx={{pt: 1}}>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Earned Seed</Typography>
                <Stack direction="row" alignItems="center" gap={0.2}>
                  <Typography>+</Typography>
                  <img alt="" src={seedIcon} height="18px"/>
                  <Typography>2000</Typography>
                </Stack>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Grown Stalk</Typography>
                <Stack direction="row" alignItems="center" gap={0.2}>
                  <Typography>+</Typography>
                  <img alt="" src={stalkIcon} height="18px"/>
                  <Typography>2000</Typography>
                </Stack>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Harvestable Pods</Typography>
                <Stack direction="row" alignItems="center" gap={0.2}>
                  <Typography>+</Typography>
                  <img alt="" src={beanCircleIcon} height="18px"/>
                  <Typography>2000</Typography>
                </Stack>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Unclaimed Beans from Fertilizer</Typography>
                <Stack direction="row" alignItems="center" gap={0.2}>
                  <Typography>+</Typography>
                  <img alt="" src={beanCircleIcon} height="18px"/>
                  <Typography>2000</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12} md={4.5}>
          <Stack height="100%">
            <Typography variant="h2">Active Rewards</Typography>
            <Stack gap={0.5} sx={{pt: 1}} justifyContent="space-between" height="100%">
              <Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Earned Beans</Typography>
                  <Stack direction="row" alignItems="center" gap={0.2}>
                    <Typography>+</Typography>
                    <img alt="" src={beanCircleIcon} height="18px"/>
                    <Typography>2000</Typography>
                  </Stack>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Earned Stalk</Typography>
                  <Stack direction="row" alignItems="center" gap={0.2}>
                    <Typography>+</Typography>
                    <img alt="" src={stalkIcon} height="18px"/>
                    <Typography>2000</Typography>
                  </Stack>
                </Stack>
              </Stack>
              <Button sx={{p: 1}}>
                Claim all Rewards
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
};

export default RewardsCard;

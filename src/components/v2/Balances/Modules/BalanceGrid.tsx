/* eslint-disable */
import React from 'react';
import {Box, Card, Grid, Link, Stack, Typography} from '@mui/material';
import {makeStyles} from '@mui/styles';
import TotalBalanceCard from "./TotalBalanceCard";
import RewardsCard from "./RewardsCard";
import StalkCard from "./QuarterCards/StalkCard";
import SeedCard from "./QuarterCards/SeedCard";
import PodCard from "./QuarterCards/PodCard";
import FertilizerCard from "./QuarterCards/FertilizerCard";

const useStyles = makeStyles(() => ({

}))

export interface BalanceGridProps {
  totalBalanceTitle: string;
  hideRewardsCard?: boolean;
  stalkCardTitle: string;
  seedCardTitle: string;
  podCardTitle: string;
  fertilizerCardTitle: string;
}

const BalanceGrid: React.FC<BalanceGridProps> =
  ({
    totalBalanceTitle,
    hideRewardsCard = false,
    stalkCardTitle,
    seedCardTitle,
    podCardTitle,
    fertilizerCardTitle
   }) => {
    const classes = useStyles();

    return (
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <TotalBalanceCard title={totalBalanceTitle}/>
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row" spacing={1}>
            <Grid item xs={12} md={6} lg={3}>
              <StalkCard title={stalkCardTitle} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <SeedCard title={seedCardTitle} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <PodCard title={podCardTitle} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <FertilizerCard title={fertilizerCardTitle} />
            </Grid>
          </Grid>
        </Grid>
        {
          (!hideRewardsCard) && (
            <Grid item xs={12}>
              <RewardsCard title={"test"}/>
            </Grid>
          )
        }
      </Grid>
    );
  };

export default BalanceGrid;

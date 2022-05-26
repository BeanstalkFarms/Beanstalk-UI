/* eslint-disable */
import React from 'react';
import {Box, Card, Grid, Stack, Typography} from '@mui/material';
import {makeStyles} from '@mui/styles';

const useStyles = makeStyles(() => ({

}))

export interface RewardsCardProps {
  title: string;
}

const RewardsCard: React.FC<RewardsCardProps> = ({title}) => {
  const classes = useStyles();

  return (
    <Card sx={{p: 2}}>
      <Grid container direction="row">
        <Grid item xs={12} md={6}>
          <Typography>Inactive Rewards</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography>Active Rewards</Typography>
        </Grid>
      </Grid>
    </Card>
  );
};

export default RewardsCard;

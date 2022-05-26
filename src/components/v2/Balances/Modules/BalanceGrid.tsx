/* eslint-disable */
import React from 'react';
import {Box, Card, Grid, Link, Stack, Typography} from '@mui/material';
import {makeStyles} from '@mui/styles';
import TotalBalanceCard from "./TotalBalanceCard";

const useStyles = makeStyles(() => ({
  sectionToggle: {
    fontSize: "20px",
    fontWeight: 600,
    cursor: "pointer"
  }
}))

export interface BalanceGridProps {
  totalBalanceTitle: string;
}

const BalanceGrid: React.FC<BalanceGridProps> =
  ({
     totalBalanceTitle
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
            <Card sx={{p: 2, height: "100%"}}>
              <Stack gap={2}>
                <Stack>
                  <Typography>My Stalk</Typography>
                  <Stack direction="row">
                    <Typography variant="h2">X</Typography>
                    <Typography variant="h2">109,364</Typography>
                  </Stack>
                </Stack>
                <Box display="flex" justifyContent="center">
                  <Typography>GRAPH</Typography>
                </Box>
                <Stack gap={0.7}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{opacity: 0.6}}>Active Stalk</Typography>
                    <Typography>$1,123.00</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{opacity: 0.6}}>Grown Stalk</Typography>
                    <Typography>$1,123.00</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{p: 2, height: "100%"}}>
              <Stack gap={2}>
                <Stack>
                  <Typography>My Seeds</Typography>
                  <Stack direction="row">
                    <Typography variant="h2">X</Typography>
                    <Typography variant="h2">109,364</Typography>
                  </Stack>
                </Stack>
                <Box display="flex" justifyContent="center">
                  <Typography>GRAPH</Typography>
                </Box>
                <Stack gap={0.7}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{opacity: 0.6}}>Active Seed</Typography>
                    <Typography>$1,123.00</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{opacity: 0.6}}>Earned Seed</Typography>
                    <Typography>$1,123.00</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{p: 2, height: "100%"}}>
              <Stack gap={2} justifyContent="space-between" height="100%">
                <Stack>
                  <Typography>My Plots</Typography>
                  <Stack direction="row">
                    <Typography variant="h2">X</Typography>
                    <Typography variant="h2">109,364</Typography>
                  </Stack>
                </Stack>
                <Box display="flex" justifyContent="center">
                  <Typography>GRAPH</Typography>
                </Box>
                <Stack gap={0.7}>
                  <Link
                    underline="none"
                    rel="noreferrer"
                    sx={{cursor: "pointer"}}
                  >
                    <Typography variant="body1" sx={{textAlign: 'center'}}>
                      View All Plots
                    </Typography>
                  </Link>
                </Stack>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{p: 2, height: "100%"}}>
              <Stack gap={2} justifyContent="space-between" height="100%">
                <Stack>
                  <Typography>My Fertilizer</Typography>
                  <Stack direction="row">
                    <Typography variant="h2">X</Typography>
                    <Typography variant="h2">109,364</Typography>
                  </Stack>
                </Stack>
                <Box display="flex" justifyContent="center">
                  <Typography>GRAPH</Typography>
                </Box>
                <Stack gap={0.7}>
                  <Link
                    underline="none"
                    rel="noreferrer"
                    sx={{cursor: "pointer"}}
                  >
                    <Typography variant="body1" sx={{textAlign: 'center'}}>
                      View All Fertilizer
                    </Typography>
                  </Link>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
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
      </Grid>
    </Grid>
  );
};

export default BalanceGrid;

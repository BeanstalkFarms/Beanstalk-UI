/* eslint-disable */
import React from 'react';
import {Box, Card, Grid, Stack, Typography} from '@mui/material';
import {makeStyles} from '@mui/styles';

const useStyles = makeStyles(() => ({
  sectionToggle: {
    fontSize: "20px",
    fontWeight: 600,
    cursor: "pointer"
  }
}))

export interface TotalBalanceCardProps {
  title: string;
}

const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({title}) => {
  const classes = useStyles();

  return (
    <Card sx={{p: 2}}>
      <Stack>
        <Typography>{title}</Typography>
        <Typography variant="h2">$109,364</Typography>
      </Stack>
      <Grid container direction="row" alignItems="center">
        <Grid item xs={12} md={3.5}>
          <Stack gap={0.5} sx={{pl: 1, pr: 1, pt: 5, pb: 5}}>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{opacity: 0.6}}>Deposited Tokens</Typography>
              <Typography>$100,243</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{opacity: 0.6}}>Withdraw Tokens</Typography>
              <Typography>$10,534</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{opacity: 0.6}}>Claimable Tokens</Typography>
              <Typography>$4,542</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{opacity: 0.6}}>Circulating Tokens</Typography>
              <Typography>$1,123.00</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{opacity: 0.6}}>Wrapped Tokens</Typography>
              <Typography>$1,234</Typography>
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12} md={5}>
          <Box display="flex" justifyContent="center">
            <Typography>GRAPH</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={3.5}>
          <Stack alignItems="center" justifyContent="center" sx={{p: 3, pt: 5, pb: 5}}>
            <Stack direction="row">
              <Typography sx={{opacity: 0.6}}>Hover a state to see breakdown</Typography>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
};

export default TotalBalanceCard;

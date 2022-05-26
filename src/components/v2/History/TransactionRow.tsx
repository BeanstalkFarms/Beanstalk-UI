/* eslint-disable */
import React from 'react';
import {Divider, Grid, Stack, Typography} from '@mui/material';
import {makeStyles} from '@mui/styles';

const useStyles = makeStyles(() => ({}))

export interface TransactionRowProps {
  title: string;
}

const TransactionRow: React.FC<TransactionRowProps> = ({title}) => {
  const classes = useStyles();

  return (
    <Grid item width="100%">
      <Stack gap={0.2} pt={1} pb={1}>
        <Typography>Season 5128</Typography>
        <Stack direction="row" justifyContent="space-between">
          <Typography>Bean Withdrawal</Typography>
          <Typography>10</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{opacity: 0.7}}>03/24/2022 13:24:24 PM</Typography>
          <Typography>20</Typography>
        </Stack>
      </Stack>
      <Divider/>
    </Grid>
  );
};

export default TransactionRow;

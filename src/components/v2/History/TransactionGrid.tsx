/* eslint-disable */
import React from 'react';
import {Box, Divider, Grid, Stack, Typography} from '@mui/material';
import {makeStyles} from '@mui/styles';
import TransactionRow from "./TransactionRow";

const useStyles = makeStyles(() => ({}))

export interface TransactionGridProps {
  title: string;
}

const TransactionGrid: React.FC<TransactionGridProps> = ({title}) => {
  const classes = useStyles();
  return (
    <Grid container>
      <TransactionRow title={"test"}/>
      <TransactionRow title={"test"}/>
      <TransactionRow title={"test"}/>
      <TransactionRow title={"test"}/>
      <TransactionRow title={"test"}/>
    </Grid>
  );
};

export default TransactionGrid;

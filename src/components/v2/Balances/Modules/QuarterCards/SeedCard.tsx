/* eslint-disable */
import React from 'react';
import {Box, Card, Grid, Stack, Typography} from '@mui/material';
import {makeStyles} from '@mui/styles';

const useStyles = makeStyles(() => ({

}))

export interface SeedCardProps {
  title: string;
}

const SeedCard: React.FC<SeedCardProps> = ({title}) => {
  const classes = useStyles();

  return (
    <Card sx={{p: 2, height: "100%"}}>
      <Stack gap={2}>
        <Stack>
          <Typography>{title}</Typography>
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
            <Typography sx={{opacity: 0.6}}>Grown Seed</Typography>
            <Typography>$1,123.00</Typography>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

export default SeedCard;

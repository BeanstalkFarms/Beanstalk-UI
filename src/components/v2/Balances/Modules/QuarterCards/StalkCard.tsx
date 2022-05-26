/* eslint-disable */
import React from 'react';
import {Box, Card, Grid, Stack, Typography} from '@mui/material';
import {makeStyles} from '@mui/styles';
import stalkIcon from "../../../../../img/stalk-logo.svg";

const useStyles = makeStyles(() => ({

}))

export interface StalkCardProps {
  title: string;
}

const StalkCard: React.FC<StalkCardProps> = ({title}) => {
  const classes = useStyles();

  return (
    <Card sx={{p: 2, height: "100%"}}>
      <Stack gap={2} justifyContent="space-between" height="100%">
        <Stack>
          <Typography>{title}</Typography>
          <Stack direction="row" alignItems="center">
            <img alt="" src={stalkIcon} height="25px" />
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
  );
};

export default StalkCard;
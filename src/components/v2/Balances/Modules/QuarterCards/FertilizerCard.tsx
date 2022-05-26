/* eslint-disable */
import React from 'react';
import {Box, Card, Grid, Link, Stack, Typography} from '@mui/material';
import {makeStyles} from '@mui/styles';
import fertilizerOpenIcon from "../../../../../img/fertilizer-opened.svg";

const useStyles = makeStyles(() => ({}))

export interface FertilizerCardProps {
  title: string;
}

const FertilizerCard: React.FC<FertilizerCardProps> = ({title}) => {
  const classes = useStyles();

  return (
    <Card sx={{p: 2, height: "100%"}}>
      <Stack gap={2} justifyContent="space-between" height="100%">
        <Stack>
          <Typography>{title}</Typography>
          <Stack direction="row">
            <Typography variant="h2">x</Typography>
            <Typography variant="h2">109,364</Typography>
          </Stack>
        </Stack>
        <Box display="flex" justifyContent="center">
          <img alt="" src={fertilizerOpenIcon} />
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
  );
};

export default FertilizerCard;

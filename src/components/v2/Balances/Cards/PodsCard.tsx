/* eslint-disable */
import React from 'react';
import {Box, Link, Stack, Typography} from '@mui/material';
import {makeStyles} from '@mui/styles';
import StatCard from '../StatCard';

const useStyles = makeStyles(() => ({}))

export interface PodCardProps {
  title: string;
  hideButton?: boolean;
}

const PodCard: React.FC<PodCardProps> = ({
  title,
}) => {
  const classes = useStyles();
  return (
    <StatCard title={title} icon={"x"} amount="109,364">
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
    </StatCard>
  );
};

export default PodCard;

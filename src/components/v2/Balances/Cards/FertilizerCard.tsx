/* eslint-disable */
import React from 'react';
import {Box, Link, Stack, Typography} from '@mui/material';
import {makeStyles} from '@mui/styles';
import fertilizerOpenIcon from "img/fertilizer-opened.svg";
import StatCard from '../StatCard';
import TokenIcon from 'components/v2/Common/TokenIcon';
import { PODS } from 'constants/v2/tokens';

const useStyles = makeStyles(() => ({}))

export interface FertilizerCardProps {
  title: string;
}

const FertilizerCard: React.FC<FertilizerCardProps> = ({
  title
}) => {
  const classes = useStyles();
  return (
    <StatCard title={title} icon={<TokenIcon token={PODS} />} amount="109,364">
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
    </StatCard>
  );
};

export default FertilizerCard;

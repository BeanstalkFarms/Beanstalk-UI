/* eslint-disable */
import React from 'react';
import {Box, Link, Stack, Typography} from '@mui/material';
import fertilizerOpenIcon from "img/fertilizer-opened.svg";
import StatCard from '../StatCard';
import TokenIcon from '~/components/Common/TokenIcon';
import { PODS } from '~/constants/tokens';

import { FC } from '~/types';

const FertilizerCard: FC<{}> = () => {
  return (
    <StatCard title="My Fertilizer" amountIcon={<TokenIcon token={PODS} />} amount="109,364">
      {/* <Box display="flex" justifyContent="center">
        <img alt="" src={fertilizerOpenIcon} />
      </Box> */}
      <Stack gap={0.7} sx={{ flex: 1 }} justifyContent="flex-end">
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

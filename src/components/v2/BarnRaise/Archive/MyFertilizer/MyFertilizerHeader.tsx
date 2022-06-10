/* eslint-disable */
import React from 'react';
import {Divider, Link, Stack, Typography} from '@mui/material';
import beanCircleIcon from 'img/tokens/bean-logo-circled.svg';

export interface MyFertilizerHeaderProps {

}

const MyFertilizerHeader: React.FC<MyFertilizerHeaderProps> = ({ }) => {

  return (
    <Stack gap={1}>
      <Typography variant="h6">My Active Fertilizer</Typography>
      <Stack gap={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography>Unclaimed Beans:</Typography>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <Stack direction="row" gap={0.2}>
              <img alt="" src={beanCircleIcon} width="16px"/>
              <Typography>200</Typography>
            </Stack>
            <Link underline="none" href="#"><Typography>(Claim)</Typography></Link>
            <Typography>or</Typography>
            <Link underline="none" href="#"><Typography>(Claim & Deposit)</Typography></Link>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography>Total Fertilizer Reward:</Typography>
          <Stack direction="row" alignItems="center" gap={0.1}>
            <img alt="" src={beanCircleIcon} width="16px"/>
            <Typography>100,000</Typography>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography>Total Owed Beans:</Typography>
          <Stack direction="row" alignItems="center" gap={0.1}>
            <img alt="" src={beanCircleIcon} width="16px"/>
            <Typography>100,000</Typography>
          </Stack>
        </Stack>
        <Divider sx={{color: '#c7ddf0'}}/>
      </Stack>
    </Stack>
  );
};

export default MyFertilizerHeader;

import React from 'react';
import { Box, Button, Card, Divider, Stack, Tooltip } from '@mui/material';
import { FarmerSiloRewards } from 'state/farmer/silo';
import { SupportedChainId } from 'constants/chains';
import BigNumber from 'bignumber.js';
import DropdownIcon from '../Common/DropdownIcon';
import RewardItem from './RewardItem';
import beanIcon from 'img/tokens/bean-logo-circled.svg';
import stalkIcon from 'img/beanstalk/stalk-icon.svg';
import seedIcon from 'img/beanstalk/seed-icon.svg';

const GAP_LG = 3.5;
const GAP_MD = 2;
const GAP_XS = 1;

const RewardsBar : React.FC<{
  chainId: SupportedChainId;
  beans: FarmerSiloRewards['beans'];
  stalk: FarmerSiloRewards['stalk'];
  seeds: FarmerSiloRewards['seeds'];
  handleOpenDialog: any;
}> = ({
  chainId,
  beans,
  stalk,
  seeds,
  handleOpenDialog
}) => (
  <Card sx={{ pl: 2, pr: 1, py: 1.5 }}>
    <Stack direction={{ md: 'row', xs: 'column' }} justifyContent={{ md: 'space-between' }} alignItems={{ md: 'center', xs: 'auto' }} rowGap={1.5}>
      {/* Statistics */}
      <Stack direction={{ md: 'row', xs: 'column' }} columnGap={{ xs: GAP_XS, md: GAP_MD, lg: GAP_LG }} rowGap={1.5}>
        {/* Earned */}
        <Stack direction="row" gap={{ xs: GAP_XS, md: GAP_MD, lg: GAP_LG }}>
          <RewardItem
            title="Earned Beans"
            tooltip="The number of Beans earned since your last interaction with the Silo. Earned Beans are automatically Deposited in the Silo."
            amount={beans.earned}
            icon={beanIcon}
          />
          <RewardItem
            title="Earned Stalk"
            tooltip="The number of Stalk earned from Earned Beans. Earned Stalk automatically contributes to total Stalk ownership."
            amount={stalk.earned}
            icon={stalkIcon}
          />
        </Stack>
        {/* Divider */}
        <Box>
          <Divider orientation="vertical" />
        </Box>
        {/* Grown */}
        <Stack direction="row" gap={{ xs: GAP_XS, md: GAP_MD, lg: GAP_LG }}>
          <RewardItem
            title="Plantable Seeds"
            tooltip="The number of Seeds earned from Earned Beans. Earned Seeds do not generate Stalk until they are claimed."
            amount={seeds.earned}
            icon={seedIcon}
          />
          <RewardItem
            title="Grown Stalk"
            tooltip="The number of Stalk earned from Seeds. Grown Stalk must be claimed in order for it to contribute to total Stalk ownership."
            amount={stalk.grown}
            icon={stalkIcon}
          />
        </Stack>
        <Box>
          <Divider orientation="vertical" />
        </Box>
        {/* Grown */}
        <Stack direction="row" gap={{ xs: GAP_XS, md: GAP_MD, lg: GAP_LG }}>
          <RewardItem
            title="Revitalized Stalk"
            tooltip="The number of Seeds earned from Earned Beans. Earned Seeds do not generate Stalk until they are claimed."
            amount={new BigNumber(0)}
            icon={stalkIcon}
          />
          <RewardItem
            title="Revitalized Seed"
            tooltip="The number of Stalk earned from Seeds. Grown Stalk must be claimed in order for it to contribute to total Stalk ownership."
            amount={new BigNumber(0)}
            icon={seedIcon}
          />
        </Stack>
      </Stack>
      {/* Claim */}
      {/* TEMP: Hide Claim button on MAINNET */}
      <Box sx={{ justifySelf: { md: 'flex-end', xs: 'auto' }, width: { xs: '100%', md: 'auto' } }}>
        <Tooltip title={chainId === SupportedChainId.MAINNET ? <>Claiming Silo rewards will be available upon Replant.</> : ''}>
          <span>
            <Button
              disabled={chainId === SupportedChainId.MAINNET}
              variant="contained"
              sx={{ height: '100%', width: { xs: '100%', md: 'auto' } }}
              endIcon={<DropdownIcon open={false} />}
              onClick={handleOpenDialog}
            >
              Claim Rewards
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Stack>
  </Card>
);

export default RewardsBar;

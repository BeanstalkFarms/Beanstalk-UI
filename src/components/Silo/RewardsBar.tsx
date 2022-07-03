import React from 'react';
import { Box, Button, Card, Divider, Stack, Tooltip, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { FarmerSiloRewards } from 'state/farmer/silo';
import { displayFullBN } from 'util/index';
import { SupportedChainId } from 'constants/chains';
import DropdownIcon from '../Common/DropdownIcon';
import RewardItem from "./RewardItem";

const GAP = 4;

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
      <Stack direction={{ md: 'row', xs: 'column' }} columnGap={GAP} rowGap={1.5}>
        {/* Earned */}
        <Stack direction="row" gap={GAP}>
          <RewardItem
            title="Earned Beans"
            tooltip="The number of Beans earned since your last interaction with the Silo. Earned Beans are automatically Deposited in the Silo."
            amount={beans.earned}
          />
          <RewardItem
            title="Earned Stalk"
            tooltip="The number of Stalk earned from Earned Beans. Earned Stalk automatically contributes to total Stalk ownership."
            amount={stalk.earned}
          />
        </Stack>
        {/* Divider */}
        <Box>
          <Divider orientation="vertical" />
        </Box>
        {/* Grown */}
        <Stack direction="row" gap={GAP}>
          <RewardItem
            title="Earned Seeds"
            tooltip="The number of Seeds earned from Earned Beans. Earned Seeds do not generate Stalk until they are claimed."
            amount={seeds.earned}
          />
          <RewardItem
            title="Grown Stalk"
            tooltip="The number of Stalk earned from Seeds. Grown Stalk must be claimed in order for it to contribute to total Stalk ownership."
            amount={stalk.grown}
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

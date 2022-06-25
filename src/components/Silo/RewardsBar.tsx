import React from 'react';
import { Box, Button, Card, Divider, Stack, Tooltip, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { FarmerSiloRewards } from 'state/farmer/silo';
import { displayBN } from 'util/index';
import { SupportedChainId } from 'constants/chains';
import DropdownIcon from '../Common/DropdownIcon';

const gap = 4;

const RewardsBar : React.FC<{
  chainId: SupportedChainId;
  beans: FarmerSiloRewards['beans'];
  stalk: FarmerSiloRewards['stalk'];
  seeds: FarmerSiloRewards['seeds'];
}> = ({
  chainId,
  beans,
  stalk,
  seeds
}) => (
  <Card sx={{ pl: 2, pr: 1, py: 1.5 }}>
    <Stack direction={{ md: 'row', xs: 'column' }} justifyContent={{ md: 'space-between', }} alignItems={{ md: 'center', xs: 'auto' }} rowGap={1.5}>
      {/* Statistics */}
      <Stack direction={{ md: 'row', xs: 'column' }} columnGap={gap} rowGap={1.5}>
        {/* Earned */}
        <Stack direction="row" gap={gap}>
          <Box sx={{ flex: { md: 'auto', xs: 1 } }}>
            <Typography color="gray">Earned Beans&nbsp;
              <Tooltip title="The number of Beans earned since your last interaction with the Silo. Earned Beans are automatically Deposited in the Silo." placement="top">
                <HelpOutlineIcon
                  sx={{ color: 'text.secondary', fontSize: '14px' }}
                />
              </Tooltip>
            </Typography>
            <Typography variant="h3">{displayBN(beans.earned)}</Typography>
          </Box>
          <Box sx={{ flex: { md: 'auto', xs: 1 } }}>
            <Typography color="gray">Earned Stalk&nbsp;
              <Tooltip title="The number of Stalk earned from Earned Beans. Earned Stalk automatically contributes to total Stalk ownership." placement="top">
                <HelpOutlineIcon
                  sx={{ color: 'text.secondary', fontSize: '14px' }}
                />
              </Tooltip>
            </Typography>
            <Typography variant="h3">{displayBN(stalk.earned)}</Typography>
          </Box>
        </Stack>
        {/* Divider */}
        <Box>
          <Divider orientation="vertical" />
        </Box>
        {/* Grown */}
        <Stack direction="row" gap={gap}>
          <Box sx={{ flex: { md: 'auto', xs: 1 } }}>
            <Typography color="gray">Earned Seeds&nbsp;
              <Tooltip title="The number of Seeds earned from Earned Beans. Earned Seeds do not generate Stalk until Earned Beans are claimed." placement="top">
                <HelpOutlineIcon
                  sx={{ color: 'text.secondary', fontSize: '14px' }}
                />
              </Tooltip>
            </Typography>
            <Typography variant="h3">{displayBN(seeds.earned)}</Typography>
          </Box>
          <Box sx={{ flex: { md: 'auto', xs: 1 } }}>
            <Typography color="gray">Grown Stalk&nbsp;
              <Tooltip title="The number of Stalk earned from Seeds. Grown Stalk must be claimed in order for it to contribute to total Stalk ownership." placement="top">
                <HelpOutlineIcon
                  sx={{ color: 'text.secondary', fontSize: '14px' }}
                />
              </Tooltip>
            </Typography>
            <Typography variant="h3">{displayBN(stalk.grown)}</Typography>
          </Box>
        </Stack>
      </Stack>
      {/* Claim */}
      {/* TEMP: Hide Claim button on MAINNET */}
      <Box sx={{ justifySelf: { md: 'flex-end', xs: 'auto' }, width: { xs: '100%', md: 'auto' } }}>
        <Tooltip title={chainId === SupportedChainId.MAINNET ? <>Claiming Silo rewards will be available when Beanstalk is Replanted.</> : false}>
          <span>
            <Button
              disabled={chainId === SupportedChainId.MAINNET}
              variant="contained"
              sx={{ height: '100%', width: { xs: '100%', md: 'auto' } }}
              endIcon={<DropdownIcon open={false} />}
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

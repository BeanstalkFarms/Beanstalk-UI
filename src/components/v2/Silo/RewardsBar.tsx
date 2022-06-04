import React from 'react';
import { Box, Button, Card, Divider, Grid, Stack, Tooltip, Typography } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { FarmerSiloRewards } from 'state/v2/farmer/silo';
import { displayBN } from 'util/index';
import { SupportedChainId } from 'constants/chains';
import { BeanstalkPalette } from '../App/muiTheme';
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
            <Typography color="gray">Earned Beans</Typography>
            <Typography variant="h3">{displayBN(beans.earned)}</Typography>
          </Box>
          <Box sx={{ flex: { md: 'auto', xs: 1 } }}>
            <Typography color="gray">Earned Stalk</Typography>
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
            <Typography color="gray">Earned Seeds</Typography>
            <Typography variant="h3">{displayBN(seeds.earned)}</Typography>
          </Box>
          <Box sx={{ flex: { md: 'auto', xs: 1 } }}>
            <Typography color="gray">Grown Stalk</Typography>
            <Typography variant="h3">{displayBN(stalk.grown)}</Typography>
          </Box>
        </Stack>
      </Stack>
      {/* Claim */}
      {/* TEMP: Hide Claim button on MAINNET */}
      <Box sx={{ justifySelf: { md: 'flex-end', xs: 'auto' }, width: { xs: '100%', md: 'auto' } }}>
        <Tooltip title={chainId === SupportedChainId.MAINNET ? <>Claiming Silo rewards will be available upon Unpause.</> : false}>
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

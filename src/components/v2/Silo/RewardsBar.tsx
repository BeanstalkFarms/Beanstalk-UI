import React from 'react';
import { Box, Button, Card, Divider, Stack, Tooltip, Typography } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { FarmerSiloAssets } from 'state/v2/farmer/silo';
import { displayBN } from 'util/index';
import { SupportedChainId } from 'constants/chains';

const gap = 4;

const RewardsBar : React.FC<{
  chainId: SupportedChainId;
  beans: FarmerSiloAssets['beans'];
  stalk: FarmerSiloAssets['stalk'];
  seeds: FarmerSiloAssets['seeds'];
}> = ({
  chainId,
  beans,
  stalk,
  seeds
}) => (
  <Card sx={{ pl: 2, pr: 1, py: 1.5 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      {/* Statistics */}
      <Stack direction="row" gap={gap}>
        {/* Earned */}
        <Stack direction="row" gap={gap}>
          <Box>
            <Typography color="gray">Earned Beans</Typography>
            <Typography variant="h3">{displayBN(beans.earned)}</Typography>
          </Box>
          <Box>
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
          <Box>
            <Typography color="gray">Earned Seeds</Typography>
            <Typography variant="h3">{displayBN(seeds.earned)}</Typography>
          </Box>
          <Box>
            <Typography color="gray">Grown Stalk</Typography>
            <Typography variant="h3">{displayBN(stalk.grown)}</Typography>
          </Box>
        </Stack>
      </Stack>
      {/* Claim */}
      {/* TEMP: Hide Claim button on MAINNET */}
      <Box sx={{ justifySelf: 'flex-end' }}>
        <Tooltip title={chainId === SupportedChainId.MAINNET ? <>Claiming Silo rewards will be available upon Unpause.</> : false}>
          <span>
            <Button
              disabled={chainId === SupportedChainId.MAINNET}
              variant="contained"
              sx={{ h: '100%' }}
              endIcon={<ArrowDropDownIcon />}
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

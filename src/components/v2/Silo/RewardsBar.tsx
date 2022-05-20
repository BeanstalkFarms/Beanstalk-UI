import React from 'react';
import { Box, Button, Card, Divider, Stack, Typography } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const gap = 4;

const RewardsBar : React.FC = () => (
  <Card sx={{ pl: 2, pr: 1, py: 1.5 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      {/* Statistics */}
      <Stack direction="row" gap={gap}>
        {/* Earned */}
        <Stack direction="row" gap={gap}>
          <Box>
            <Typography color="gray">Earned Beans</Typography>
            <Typography variant="h3">+10,012</Typography>
          </Box>
          <Box>
            <Typography color="gray">Earned Stalk</Typography>
            <Typography variant="h3">+10,012</Typography>
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
            <Typography variant="h3">+10,012</Typography>
          </Box>
          <Box>
            <Typography color="gray">Grown Stalk</Typography>
            <Typography variant="h3">+10,012</Typography>
          </Box>
        </Stack>
      </Stack>
      {/* Claim */}
      <Box sx={{ justifySelf: 'flex-end' }}>
        <Button variant="contained" sx={{ h: '100%' }} endIcon={<ArrowDropDownIcon />}>
          Claim Rewards
        </Button>
      </Box>
    </Stack>
  </Card>
  );

export default RewardsBar;

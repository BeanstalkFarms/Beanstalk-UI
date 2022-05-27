import React from 'react';
import { Box,  Stack, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import StatCard from '../StatCard';
import TokenIcon from 'components/v2/Common/TokenIcon';
import { SEEDS } from 'constants/v2/tokens';

const useStyles = makeStyles(() => ({}))

export interface SeedCardProps {
  title: string;
}

const SeedCard: React.FC<SeedCardProps> = ({ title }) => {
  const classes = useStyles();
  return (
    <StatCard title={title} icon={<TokenIcon token={SEEDS} />} amount="109,364">
      <Box display="flex" justifyContent="center">
        <Typography>GRAPH</Typography>
      </Box>
      <Stack gap={0.7}>
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ opacity: 0.6 }}>Active Seed</Typography>
          <Typography>$1,123.00</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ opacity: 0.6 }}>Grown Seed</Typography>
          <Typography>$1,123.00</Typography>
        </Stack>
      </Stack>
    </StatCard>
  );
};

export default SeedCard;

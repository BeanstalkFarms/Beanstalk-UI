import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { STALK } from 'constants/v2/tokens';
import TokenIcon from 'components/v2/Common/TokenIcon';
import StatCard from '../StatCard';

const useStyles = makeStyles(() => ({}));

export interface StalkCardProps {
  title: string;
}

const StalkCard: React.FC<StalkCardProps> = ({
  title
}) => {
  const classes = useStyles();
  return (
    <StatCard title={title} icon={<TokenIcon token={STALK} />} amount="109,364">
      <Stack gap={2} justifyContent="space-between" height="100%">
        <Box display="flex" justifyContent="center">
          <Typography>GRAPH</Typography>
        </Box>
        <Stack gap={0.7}>
          <Stack direction="row" justifyContent="space-between">
            <Typography sx={{ opacity: 0.6 }}>Active Stalk</Typography>
            <Typography>$1,123.00</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography sx={{ opacity: 0.6 }}>Grown Stalk</Typography>
            <Typography>$1,123.00</Typography>
          </Stack>
        </Stack>
      </Stack>
    </StatCard>
  );
};

export default StalkCard;

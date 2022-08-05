import React from 'react';
import { Link, Stack, Typography } from '@mui/material';
import { PODS } from 'constants/tokens';
import TokenIcon from 'components/Common/TokenIcon';
import { AppState } from '~/state';
import { displayBN } from 'util/index';
import StatCard from '../StatCard';

const PodCard: React.FC<{ state: AppState['_farmer']['field'] }> = ({ state }) => (
  <StatCard
    title="My Pods"
    amountIcon={<TokenIcon token={PODS} />}
    amount={`${displayBN(state.pods)}`}
  >
    <Stack gap={0.7} sx={{ flex: 1 }} justifyContent="flex-end">
      <Link
        underline="none"
        rel="noreferrer"
        sx={{ cursor: 'pointer' }}
      >
        <Typography variant="body1" sx={{ textAlign: 'center' }}>
          View All Plots
        </Typography>
      </Link>
    </Stack>
  </StatCard>
);

export default PodCard;

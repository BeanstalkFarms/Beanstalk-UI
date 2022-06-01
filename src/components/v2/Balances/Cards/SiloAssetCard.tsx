import React, { useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { SEEDS, STALK } from 'constants/tokens';
import TokenIcon from 'components/v2/Common/TokenIcon';
import { AppState } from 'state';
import { displayBN, displayFullBN } from 'util/index';
import ResizablePieChart, { PieDataPoint } from 'components/v2/Charts/Pie';
import StatCard from '../StatCard';

export type StalkCardProps = (
  {
    token: typeof STALK;
    state: AppState['_farmer']['silo']['stalk'];
  }
  | {
    token: typeof SEEDS;
    state: AppState['_farmer']['silo']['seeds'];
  }
);

const MAPPING = {
  active: ['Active', 'rgba(31, 120, 180, 1)'],
  grown: ['Grown', 'rgba(166, 206, 227, 1)'],
  earned: ['Earned', 'rgba(166, 206, 227, 0.5)'],
};

const SiloAssetCard: React.FC<StalkCardProps> = ({
  token,
  state,
}) => {
  const pieChartData = useMemo(() => Object.keys(state).reduce<PieDataPoint[]>((prev, _curr) => {
      const curr = _curr as keyof typeof state; // ts hack
      if (curr !== 'total' && state[curr]) {
        prev.push({
          label: MAPPING[curr][0],
          value: state[curr].toNumber(),
          color: MAPPING[curr][1],
        });
      }
      return prev;
    }, [] as PieDataPoint[]), [state]);
  return (
    <StatCard
      title={`My ${token.name}`}
      icon={<TokenIcon token={token} />}
      amount={displayBN(state.total)}
    >
      <Stack gap={2} justifyContent="space-between" height="100%">
        <Box display="hidden" justifyContent="center" sx={{ height: 150 }}>
          <ResizablePieChart
            data={state.total.gt(0) ? pieChartData : undefined}
            donutThickness={30}
          />
        </Box>
        <Stack gap={0.5}>
          {Object.keys(state).map((key) => (
            <Stack key={key} direction="row" justifyContent="space-between">
              <Typography sx={{ opacity: 0.6, textTransform: 'capitalize' }}>
                {key} {token.name}
              </Typography>
              <Typography>
                {displayFullBN(state[key as keyof typeof state], 0)}
              </Typography>
            </Stack>
            ))}
        </Stack>
      </Stack>
    </StatCard>
  );
};

export default SiloAssetCard;

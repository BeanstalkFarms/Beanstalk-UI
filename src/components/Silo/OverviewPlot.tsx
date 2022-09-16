import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useCallback, useEffect, useState } from 'react';

import LineChart, { DataPoint  } from '~/components/Common/Charts/LineChart';
import { mockDepositData } from '~/components/Common/Charts/LineChart.mock';
import WalletButton from '~/components/Common/Connection/WalletButton';
import TokenIcon from '~/components/Common/TokenIcon';
import BlurComponent from '~/components/Common/ZeroState/BlurComponent';
import { SEEDS, STALK } from '~/constants/tokens';

export type OverviewPlotProps = {
  account: string | undefined;
  season: BigNumber;
  current: BigNumber[];
  series: DataPoint[][];
  stats: (season: BigNumber, value: BigNumber[]) => React.ReactElement;
  empty: boolean;
  loading: boolean;
  label: string;
};

const MockSeries = [mockDepositData];
const FakeChart = () => (
  <LineChart
    series={MockSeries}
    onCursor={() => {}}
  />
);

const OverviewPlot: React.FC<OverviewPlotProps> = ({
  account,
  season,
  current,
  series,
  stats,
  loading,
  empty,
  label,
}) => {
  const [displaySeason, setDisplaySeason] = useState<BigNumber>(season);
  const [displayValue, setDisplayValue] = useState<BigNumber[]>(current);

  useEffect(() => setDisplayValue(current), [current]);
  useEffect(() => setDisplaySeason(season), [season]);

  const handleCursor = useCallback(
    (dps?: DataPoint[]) => {
      setDisplaySeason(dps ? new BigNumber(dps[0].season) : season);
      setDisplayValue(dps ? dps.map((dp) => new BigNumber(dp.value)) : current);
    },
    [current, season]
  );

  const ready = (
    account
    && !loading
    && !empty
  );

  return (
    <>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        gap={{ xs: 1, md: 0 }}
        sx={{ px: 2, pb: { xs: 2, md: 0 } }}
        alignItems="flex-start"
      >
        {stats(displaySeason, displayValue)}
      </Stack>
      <Box sx={{ width: '100%', height: '220px', position: 'relative' }}>
        <Box sx={{ display: ready ? 'hidden' : 'block', height: '100%' }}>
          <FakeChart />
        </Box>
        {ready ? (
          <LineChart
            series={series}
            onCursor={handleCursor}
          />
        ) : (
          <>
            <BlurComponent>
              <Stack justifyContent="center" alignItems="center" height="100%" gap={1}>
                {!account ? (
                  <>
                    <Typography variant="body1" color="gray">Your {label} will appear here.</Typography>
                    <WalletButton showFullText color="primary" sx={{ height: 45 }} />
                  </>
                ) : loading ? (
                  <CircularProgress variant="indeterminate" thickness={4} color="primary" />
                ) : empty ? (
                  <Typography variant="body1" color="gray">
                    Receive <TokenIcon token={STALK} />Stalk and <TokenIcon token={SEEDS} />Seeds for Depositing whitelisted assets in the Silo. Stalkholders earn a portion of new Bean mints. Seeds grow into Stalk every Season.
                  </Typography>
                ) : null}
              </Stack>
            </BlurComponent>
          </>
        )}
      </Box>
    </>
  );
};

export default OverviewPlot;

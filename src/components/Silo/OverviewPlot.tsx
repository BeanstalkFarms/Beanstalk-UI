import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useCallback, useEffect, useState } from 'react';

import LineChart, { DataPoint  } from '~/components/Common/Charts/LineChart';
import WalletButton from '~/components/Common/Connection/WalletButton';
import Row from '~/components/Common/Row';
import TokenIcon from '~/components/Common/TokenIcon';
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

  return (
    <>
      <Row sx={{ px: 2 }} alignItems="flex-start">
        {stats(displaySeason, displayValue)}
      </Row>
      <Box sx={{ width: '100%', height: '220px', position: 'relative' }}>
        {!account ? (
          <Stack justifyContent="center" alignItems="center" gap={1} pt={4}>
            <Typography variant="body1" color="gray">Your {label} will appear here.</Typography>
            <WalletButton showFullText color="primary" sx={{ height: 45 }} />
          </Stack>
        ) : loading ? (
          <Stack justifyContent="center" alignItems="center" height="100%">
            <CircularProgress variant="indeterminate" thickness={4} color="primary" />
          </Stack>
        ) : empty ? (
          <Stack justifyContent="center" alignItems="center" px={1} height="100%">
            <Typography variant="body1" color="gray">
              Receive <TokenIcon token={STALK} />Stalk and <TokenIcon token={SEEDS} />Seeds for Depositing whitelisted assets in the Silo. Stalkholders earn a portion of new Bean mints. Seeds grow into Stalk every Season.
            </Typography>
          </Stack>
        ) : ( 
          <LineChart
            series={series}
            onCursor={handleCursor}
          />
        )}
      </Box>
    </>
  );
};

export default OverviewPlot;

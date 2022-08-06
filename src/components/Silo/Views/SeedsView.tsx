import { Box, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useCallback, useEffect, useState } from 'react';
import { displayBN } from '~/util';
import LineChart, { DataPoint } from '~/components/Common/Charts/LineChart';
import Stat from '~/components/Common/Stat';
import BlurComponent from '~/components/Common/ZeroState/BlurComponent';
import WalletButton from '~/components/Common/Connection/WalletButton';
import useAccount from '~/hooks/ledger/useAccount';
import { TabData } from '~/components/Silo/Views';

const SeedsView: React.FC<TabData> = ({ current, series, season }) => {
  // Display value is an array [stalk, pct]
  const account = useAccount();
  const [displayValue, setDisplayValue] = useState(current);
  const handleCursor = useCallback(
    (dps?: DataPoint[]) => {
      setDisplayValue(dps ? dps.map((dp) => new BigNumber(dp.value)) : current);
    },
    [current]
  );
  useEffect(() => setDisplayValue(current), [current]);

  return (
    <>
      <Stack direction="row" gap={4} sx={{ px: 2 }}>
        <Stat
          title="Seed Balance"
          titleTooltip="This is your total Seed Balance."
          subtitle={`Season ${displayBN(season)}`}
          amount={displayBN(displayValue[0])}
          color="primary"
          sx={{ minWidth: 180, ml: 0 }}
          amountIcon={undefined}
          gap={0.25}
        />
      </Stack>
      <Box sx={{ width: '100%', height: '200px', position: 'relative' }}>
        {!account ? (
          <BlurComponent>
            <Stack justifyContent="center" alignItems="center" gap={1}>
              <Typography variant="body1" color="gray">Your Seed Ownership will appear here.</Typography>
              <WalletButton showFullText color="primary" sx={{ height: 45 }} />
            </Stack>
          </BlurComponent>
        ) : (
          <BlurComponent blur={6}>Historical Seed balance will be available soon.</BlurComponent>
        )}
        <LineChart
          series={series}
          onCursor={handleCursor}
        />
      </Box>
    </>
  );
};

export default SeedsView;

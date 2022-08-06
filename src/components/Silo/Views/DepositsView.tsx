import { Box, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useCallback, useEffect, useState } from 'react';
import { displayBN, displayUSD } from '~/util';
import LineChart, { DataPoint } from '~/components/Common/Charts/LineChart';
import Stat from '~/components/Common/Stat';
import BlurComponent from '~/components/Common/ZeroState/BlurComponent';
import WalletButton from '~/components/Common/Connection/WalletButton';
import useAccount from '~/hooks/ledger/useAccount';
import { TabData } from '~/components/Silo/Views';

// ------------------------------------------------

const DepositsView: React.FC<TabData> = ({ season, current, series }) => {
  const account = useAccount();
  const [displayValue, setDisplayValue] = useState(current);
  const handleCursor = useCallback(
    (ds?: DataPoint[]) => {
      setDisplayValue(ds ? ds.map((d) => new BigNumber(d?.value)) : current);
    },
    [current]
  );
  useEffect(() => setDisplayValue(current), [current]);

  return (
    <>
      <Box sx={{ px: 2 }}>
        <Stat
          title="Total Silo Deposits"
          subtitle={`Season ${displayBN(season)}`}
          amount={displayUSD(displayValue[0])}
          color="primary"
          amountIcon={undefined}
          gap={0.25}
          sx={{ ml: 0 }}
        />
      </Box>
      <Box sx={{ width: '100%', height: '200px', position: 'relative' }}>
        {!account ? (
          <BlurComponent>
            <Stack justifyContent="center" alignItems="center" gap={1}>
              <Typography variant="body1" color="gray">Your Silo Deposits will appear here.</Typography>
              <WalletButton showFullText color="primary" sx={{ height: 45 }} />
            </Stack>
          </BlurComponent>
        ) : (
          <BlurComponent blur={6}>Historical Deposit value will be available soon.</BlurComponent>
        )}
        <LineChart
          series={series}
          onCursor={handleCursor}
        />
      </Box>
    </>
  );
};

export default DepositsView;

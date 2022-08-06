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

const StalkView: React.FC<TabData> = ({ current, series, season }) => {
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
          title="Stalk Balance"
          titleTooltip="This is your total Stalk Balance. Stalk are the governance token of the Beanstalk DAO. The Stalk token entitles holders to passive interest in the form of a share of future Bean mints, and the right to propose and vote on BIPs. Your Stalk is forfeited when you Withdraw your Deposited assets from the Silo."
          subtitle={`Season ${displayBN(season)}`}
          amount={displayBN(displayValue[0])}
          color="primary"
          sx={{ minWidth: 180, ml: 0 }}
          amountIcon={undefined}
          gap={0.25}
        />
        <Stat
          title="Stalk Ownership"
          titleTooltip="Your current ownership of Beanstalk is displayed as a percentage. Ownership is determined by your proportional ownership of the total Stalk supply."
          amount={`${displayValue[1].multipliedBy(100).toFixed(3)}%`}
          color="secondary.dark"
          amountIcon={undefined}
          gap={0.25}
          sx={{ ml: 0 }}
        />
      </Stack>
      <Box sx={{ width: '100%', height: '200px', position: 'relative' }}>
        {!account ? (
          <BlurComponent>
            <Stack justifyContent="center" alignItems="center" gap={1}>
              <Typography variant="body1" color="gray">Your Stalk Ownership will appear here.</Typography>
              <WalletButton showFullText color="primary" sx={{ height: 45 }} />
            </Stack>
          </BlurComponent>
        ) : (
          <BlurComponent blur={6}>Historical Stalk balance and ownership will be available soon.</BlurComponent>
        )}
        <LineChart
          series={series}
          onCursor={handleCursor}
        />
      </Box>
    </>
  );
};

export default StalkView;

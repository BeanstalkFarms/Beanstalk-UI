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
import TokenIcon from '~/components/Common/TokenIcon';
import { SEEDS, STALK } from '~/constants/tokens';
import useFarmerBalancesBreakdown from '~/hooks/farmer/useFarmerBalancesBreakdown';

const StalkView: React.FC<TabData> = ({ current, series, season }) => {
  // Display value is an array [stalk, pct]
  const account = useAccount();

  // state
  const breakdown     = useFarmerBalancesBreakdown();

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
          titleTooltip="Stalk is the governance token of the Beanstalk DAO. Stalk entitles holders to passive interest in the form of a share of future Bean mints, and the right to propose and vote on BIPs. Your Stalk is forfeited when you Withdraw your Deposited assets from the Silo."
          subtitle={`Season ${displayBN(season)}`}
          amount={displayBN(displayValue[0])}
          color="primary"
          sx={{ minWidth: 180, ml: 0 }}
          amountIcon={undefined}
          gap={0.25}
        />
        <Stat
          title="Stalk Ownership"
          titleTooltip="Your current ownership of Beanstalk is displayed as a percentage. Ownership is determined by your proportional ownership of the total Stalk supply"
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
          (breakdown.totalValue?.eq(0)) ? (
            <BlurComponent>
              <Stack justifyContent="center" alignItems="center" gap={1} px={1}>
                <Typography variant="body1" color="gray">Receive <TokenIcon token={STALK} />Stalk and <TokenIcon token={SEEDS} />Seeds for Depositing whitelisted assets in the Silo. Stalkholders earn a portion of new Bean mints. Seeds grow into Stalk every Season.</Typography>
              </Stack>
            </BlurComponent>
          ) : (
            <BlurComponent blur={6}>Historical Stalk balance and ownership will be available soon.</BlurComponent>
          )
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

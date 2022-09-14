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
import Row from '~/components/Common/Row';

const SeedsView: React.FC<TabData> = ({ current, series, season }) => {
  const account = useAccount();
  const breakdown = useFarmerBalancesBreakdown();
  
  const [displaySeason, setDisplaySeason] = useState<BigNumber>(season);
  const [displayValue, setDisplayValue] = useState(current);
  
  const handleCursor = useCallback(
    (dps?: DataPoint[]) => {
      setDisplaySeason(dps ? new BigNumber(dps[0].season) : season);
      setDisplayValue(dps ? dps.map((dp) => new BigNumber(dp.value)) : current);
    },
    [current, season]
  );

  //
  useEffect(() => setDisplayValue(current), [current]);
  useEffect(() => setDisplaySeason(season), [season]);

  return (
    <>
      <Row gap={4} sx={{ px: 2 }}>
        <Stat
          title="Seed Balance"
          titleTooltip="Seeds are illiquid tokens that yield 1/10,000 Stalk each Season."
          subtitle={`Season ${displaySeason.toString()}`}
          amount={displayBN(displayValue[0])}
          color="primary"
          sx={{ minWidth: 180, ml: 0 }}
          amountIcon={undefined}
          gap={0.25}
        />
      </Row>
      <Box sx={{ width: '100%', height: '200px', position: 'relative' }}>
        {!account ? (
          <BlurComponent>
            <Stack justifyContent="center" alignItems="center" gap={1}>
              <Typography variant="body1" color="gray">Your Seed Ownership will appear here.</Typography>
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
          ) : null
        )}
        <LineChart
          series={series}
          onCursor={handleCursor}
          curve="stepBefore"
        />
      </Box>
    </>
  );
};

export default SeedsView;

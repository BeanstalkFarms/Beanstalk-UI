import { Box, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useCallback, useEffect, useState } from 'react';
import LineChart, { DataPoint } from '~/components/Common/Charts/LineChart';
import Stat from '~/components/Common/Stat';
import BlurComponent from '~/components/Common/ZeroState/BlurComponent';
import WalletButton from '~/components/Common/Connection/WalletButton';
import useAccount from '~/hooks/ledger/useAccount';
import { TabData } from '~/components/Silo/Views';
import TokenIcon from '~/components/Common/TokenIcon';
import { SEEDS, STALK } from '~/constants/tokens';
import useFarmerBalancesBreakdown from '~/hooks/farmer/useFarmerBalancesBreakdown';
import { displayUSD } from '~/util';

// ------------------------------------------------

const DepositsView: React.FC<TabData> = ({ season, current, series }) => {
  const account = useAccount();
  const breakdown     = useFarmerBalancesBreakdown();
  
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
      <Box sx={{ px: 2 }}>
        <Stat
          title="Value Deposited"
          titleTooltip="The "
          subtitle={`Season ${displaySeason.toString()}`}
          amount={
            displayUSD(displayValue[0])
            // <Fiat value={displayValue[0]} amount={displayValue[0]} />
          }
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
        ) : breakdown.totalValue?.eq(0) ? (
          <BlurComponent>
            <Stack justifyContent="center" alignItems="center" gap={1} px={1}>
              <Typography variant="body1" color="gray">Receive <TokenIcon token={STALK} />Stalk and <TokenIcon token={SEEDS} />Seeds for Depositing whitelisted assets in the Silo. Stalkholders earn a portion of new Bean mints. Seeds grow into Stalk every Season.</Typography>
            </Stack>
          </BlurComponent>
        ) : null}
        <LineChart
          series={series}
          onCursor={handleCursor}
        />
      </Box>
    </>
  );
};

export default DepositsView;

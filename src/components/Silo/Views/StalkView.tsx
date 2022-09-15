import { Box, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useCallback, useEffect, useState } from 'react';
import { displayPercentage, displayStalk } from '~/util';
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
import useFarmerSilo from '~/hooks/farmer/useFarmerSilo';

const StalkView: React.FC<TabData> = ({ current, series, season }) => {
  const account = useAccount();
  const breakdown = useFarmerBalancesBreakdown();
  const silo = useFarmerSilo();

  const [displaySeason, setDisplaySeason] = useState<BigNumber>(season);
  const [displayValue, setDisplayValue] = useState<TabData['current']>(current);

  const handleCursor = useCallback(
    (dps?: DataPoint[]) => {
      setDisplaySeason(dps ? new BigNumber(dps[0].season) : season);
      setDisplayValue(dps ? dps.map((dp) => new BigNumber(dp.value)) : current);
    },
    [current, season]
  );

  // If current data point changes upstream, update display value
  useEffect(() => setDisplayValue(current), [current]);
  useEffect(() => setDisplaySeason(season), [season]);

  return (
    <>
      <Row sx={{ px: 2 }} alignItems="flex-start">
        <Stat
          title="Stalk Balance"
          titleTooltip="Stalk is the governance token of the Beanstalk DAO. Stalk entitles holders to passive interest in the form of a share of future Bean mints, and the right to propose and vote on BIPs. Your Stalk is forfeited when you Withdraw your Deposited assets from the Silo."
          subtitle={`Season ${displaySeason.toString()}`}
          amount={displayStalk(displayValue[0])}
          color="primary"
          sx={{ minWidth: 220, ml: 0 }}
          amountIcon={undefined}
          gap={0.25}
        />
        <Stat
          title="Stalk Ownership"
          titleTooltip="Your current ownership of Beanstalk is displayed as a percentage. Ownership is determined by your proportional ownership of the total Stalk supply"
          amount={displayPercentage(current[1].multipliedBy(100))}
          color="secondary.dark"
          amountIcon={undefined}
          gap={0.25}
          sx={{ minWidth: 190, ml: 0 }}
        />
        <Stat
          title="Stalk Grown per Day"
          titleTooltip="Your current ownership of Beanstalk is displayed as a percentage. Ownership is determined by your proportional ownership of the total Stalk supply"
          amount={`${displayStalk(silo.seeds.active.times(1 / 10_000).times(24))}`}
          color="text.secondary"
          amountIcon={undefined}
          gap={0.25}
          sx={{ minWidth: 120, ml: 0 }}
        />
      </Row>
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
          ) : null
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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';

import TimeTabs, { TimeTabState } from '~/components/Common/Charts/TimeTabs';
import WalletButton from '~/components/Common/Connection/WalletButton';
import Row from '~/components/Common/Row';
import TokenIcon from '~/components/Common/TokenIcon';
import BlurComponent from '~/components/Common/ZeroState/BlurComponent';
import MockPlot from '~/components/Silo/MockPlot';
import { SEEDS, STALK } from '~/constants/tokens';
import { SeasonAggregation, SeasonRange, SEASON_RANGE_TO_COUNT } from '~/hooks/beanstalk/useSeasonsQuery';

import { FC } from '~/types';
import StackedAreaChart2, { DataPoint2 } from '~/components/Common/Charts/StackedAreaChart2';

export type BalancesOverTimeProps = {
  account: string | undefined;
  season: BigNumber;
  current: BigNumber[];
  series: DataPoint2[][];
  stats: (season: BigNumber, value: BigNumber[]) => React.ReactElement;
  empty: boolean;
  loading: boolean;
  label: string;
};

const BalancesOverTime: FC<BalancesOverTimeProps> = ({
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
    (dps?: DataPoint2) => {
      setDisplaySeason(dps ? new BigNumber(dps?.season) : season);
      setDisplayValue(dps ? [new BigNumber(dps?.value)] : current);
    },
    [current, season]
  );

  const [tabState, setTimeTab] = useState<TimeTabState>([SeasonAggregation.HOUR, SeasonRange.WEEK]);
  const handleChangeTimeTab = useCallback(
    (tabs: TimeTabState) => {
      setTimeTab(tabs);
    },
    []
  );

  const filteredSeries = useMemo(() => {
    if (tabState[1] !== SeasonRange.ALL) {
      return series.map((s) => s.slice(-(SEASON_RANGE_TO_COUNT[tabState[1]] as number)));
    }
    return series;
  }, [series, tabState]);

  const ready = (
    account
    && !loading
    && !empty
  );

  return (
    <>
      <Row alignItems="flex-start" justifyContent="space-between" pr={2} pb={1}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          gap={{ xs: 1, md: 0 }}
          sx={{ px: 0, pb: { xs: 2, md: 0 } }}
          alignItems="flex-start"
        >
          {stats(displaySeason, displayValue)}
        </Stack>
        <Stack alignItems="right">
          <TimeTabs
            state={tabState}
            setState={handleChangeTimeTab}
            aggregation={false}
          />
        </Stack>
      </Row>
      <Box sx={{ width: '100%', height: '220px', position: 'relative' }}>
        {ready ? (
          <StackedAreaChart2
            series={filteredSeries}
            onCursor={handleCursor as any}
          />
        ) : (
          <>
            <MockPlot />
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

export default BalancesOverTime;

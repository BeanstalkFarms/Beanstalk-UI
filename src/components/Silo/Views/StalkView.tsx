import BigNumber from 'bignumber.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Stack } from '@mui/material';
import { displayBN, toTokenUnitsBN } from '~/util';
import LineChart, { DataPoint } from '~/components/Common/Charts/LineChart';
import useAccount from '~/hooks/ledger/useAccount';
import { TabData } from '~/components/Silo/Views';
import useFarmerBalancesBreakdown from '~/hooks/useFarmerBalancesBreakdown';
import TimeTabs, { TimeTabState } from '~/components/Common/Charts/TimeTabs';
import { SeasonAggregation, SeasonRange } from '~/hooks/useSeasonsQuery';
import { SeasonalFarmerStalkQuery, useSeasonalFarmerStalkQuery
} from '~/generated/graphql';
import SeasonPlot, { SeasonDataPoint } from '~/components/Common/Charts/SeasonPlot';
import { STALK } from '~/constants/tokens';
import Stat from '~/components/Common/Stat';
import { sortSeasons } from '~/util/Season';

const getValue = (season: SeasonalFarmerStalkQuery['seasons'][number]) => toTokenUnitsBN(season.totalStalk, STALK.decimals).toNumber();
const formatValue = (value: number) => `${value.toFixed(0)}`;
const StatProps: (React.ComponentProps<typeof SeasonPlot>)['StatProps'] = {
  title: 'Stalk Balance',
  gap: 0.25,
  color: 'primary',
  sx: { ml: 0 },
};
const LineChartProps: React.ComponentProps<typeof SeasonPlot>['LineChartProps'] = {
  curve: 'stepAfter',
};

const StalkView: React.FC<TabData> = ({ current, series, season }) => {
  // Display value is an array [stalk, pct]
  const account = useAccount();

  /// Selected state
  const [tabState, setTimeTab] = useState<TimeTabState>([SeasonAggregation.HOUR, SeasonRange.WEEK]);

  // state
  const breakdown = useFarmerBalancesBreakdown();

  const [displayValue, setDisplayValue] = useState(current);
  const handleCursor = useCallback(
    (dps?: DataPoint[]) => {
      setDisplayValue(dps ? dps.map((dp) => new BigNumber(dp.value)) : current);
    },
    [current]
  );

  /// Handlers
  const handleChangeTimeTab = useCallback(
    (tabs: TimeTabState) => {
      setTimeTab(tabs);
    },
    []
  );

  const queryConfig = useMemo(() => ({
    variables: {
      account: account as string,
    }
  }), [account]);

  const { loading, error, data } = useSeasonalFarmerStalkQuery(queryConfig);
  // const { loading, error, data } = useSeasonalFarmerStalk2Query(queryConfig);
  // const { loading, error, data } = useSeasonsQuery(SeasonalFarmerStalkDocument, tabState[1], queryConfig);

  // remove nulls and sort by season in ascending order
  const filteredData = data?.seasons.filter((d) => d !== null).sort((a, b) => a.season - b.season);

  console.log('STALK DATA', filteredData);

  const series2 = useMemo(() => {
    console.debug(`[SeasonPlot] Building series with ${data?.seasons.length || 0} data points`);
    if (filteredData) {
      const firstSeason = filteredData[0]?.season;
      const baseData  = filteredData.reduce<SeasonDataPoint[]>(
        (prev, curr, index) => {
          const currentSeason = curr?.season;
          const nextRecordedSeason = filteredData[index + 1]?.season; // handle if there is not another season
          const numSeasonsToFill = nextRecordedSeason - currentSeason;
          
          prev.push({
            season: curr?.season as number,
            date: new Date(parseInt(`${curr.timestamp}000`, 10)), // FIXME: inefficient
            value: getValue(curr),
          });

          // const date = ;
          let currentTime = new Date(parseInt(`${curr.timestamp}000`, 10)).getTime();
          let totalStalk = toTokenUnitsBN(curr.totalStalk, STALK.decimals).toNumber();
          for (let s = currentSeason + 1; s < nextRecordedSeason; s += 1) {
            currentTime += 1 * 60 * 60 * 1000;
            totalStalk += totalStalk * 0.0001;
            prev.push({
              season: s as number,
              date: new Date(currentTime), // FIXME: inefficient
              value: totalStalk,
            });
            // console.log(s);
          }

          // FIXME: use different query for day aggregation
          // const useThisDataPoint = tabState[0] === SeasonAggregation.DAY ? (
          //   index === 0              // first in the series
          //   || index === lastIndex   // last in the series
          //   || index % 24 === 0      // grab every 24th data point
          // ) : true;
          //
          // if (useThisDataPoint && curr !== null) {
          //   prev.push({
          //     season: curr.season as number,
          //     date: new Date(parseInt(`${curr.timestamp}000`, 10)), // FIXME: inefficient
          //     value: getValue(curr),
          //   });
          // }
          return prev;
        },
        []
      );
      return baseData.sort(sortSeasons);
    }
    return [];
  }, [data?.seasons.length, filteredData]);

  console.log('SERIES', series2);

  useEffect(() => setDisplayValue(current), [current]);

  // return (
  //   <SeasonPlot
  //     document={SeasonalFarmerStalkDocument}
  //     height={300}
  //     getValue={getValue}
  //     formatValue={formatValue}
  //     StatProps={StatProps}
  //     LineChartProps={LineChartProps}
  //     queryConfig={queryConfig}
  //   />
  // );

  return (
    <>
      <Stack direction="row" justifyContent="space-between" gap={4} sx={{ px: 2 }}>
        <Stack direction="row">
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
            amount={`${displayValue[1]?.multipliedBy(100).toFixed(3)}%`}
            color="secondary.dark"
            amountIcon={undefined}
            gap={0.25}
            sx={{ ml: 0 }}
          />
        </Stack>
        <Stack alignItems="right">
          <TimeTabs
            state={tabState}
            setState={handleChangeTimeTab}
          />
        </Stack>
      </Stack>
      <Box sx={{ width: '100%', height: '200px', position: 'relative' }}>
        {/* {!account ? ( */}
        {/*  <BlurComponent> */}
        {/*    <Stack justifyContent="center" alignItems="center" gap={1}> */}
        {/*      <Typography variant="body1" color="gray">Your Stalk Ownership will appear here.</Typography> */}
        {/*      <WalletButton showFullText color="primary" sx={{ height: 45 }} /> */}
        {/*    </Stack> */}
        {/*  </BlurComponent> */}
        {/* ) : ( */}
        {/*  (breakdown.totalValue?.eq(0)) ? ( */}
        {/*    <BlurComponent> */}
        {/*      <Stack justifyContent="center" alignItems="center" gap={1} px={1}> */}
        {/*        <Typography variant="body1" color="gray">Receive <TokenIcon token={STALK} />Stalk and <TokenIcon token={SEEDS} />Seeds for Depositing whitelisted assets in the Silo. Stalkholders earn a portion of new Bean mints. Seeds grow into Stalk every season.</Typography> */}
        {/*      </Stack> */}
        {/*    </BlurComponent> */}
        {/*  ) : ( */}
        {/*    <BlurComponent blur={6}>Historical Stalk balance and ownership will be available soon.</BlurComponent> */}
        {/*  ) */}
        {/* )} */}
        <LineChart
          series={[
            series2,
          ]}
          onCursor={handleCursor}
        />
      </Box>
    </>
  );
};

export default StalkView;

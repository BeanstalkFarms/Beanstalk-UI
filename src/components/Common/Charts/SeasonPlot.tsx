import React, { useCallback, useMemo, useState } from 'react';
import { Stack, CardProps, Box, CircularProgress } from '@mui/material';
import BigNumber from 'bignumber.js';
import Stat from 'components/Common/Stat';
import TokenIcon from 'components/Common/TokenIcon';
import { BEAN } from 'constants/tokens';
import { SupportedChainId } from 'constants/index';
import SimpleLineChart, { DataPoint } from 'components/Common/Charts/SimpleLineChart';
import useSeasons, { SeasonAggregation, SeasonRange } from 'hooks/useSeasons';
import TimeTabs, { TimeTabState }  from './TimeTabs2';
import { Season } from 'generated/graphql';

export type SeasonPlotProps = {
  defaultValue: number;
  defaultSeason: number;
  getValue: (season: Season) => number,
}

type SeasonDataPoint = DataPoint & {
  season: number;
}

const SeasonPlot: React.FC<SeasonPlotProps & CardProps> = ({
  defaultValue,
  defaultSeason,
  getValue,
  sx
}) => {
  const [tabState, setTimeTab] = useState<TimeTabState>([SeasonAggregation.HOUR, SeasonRange.WEEK]);
  const { loading, data } = useSeasons(tabState[1]);

  // Display values
  const [displayValue,  setDisplayValue]  = useState<number | undefined>(undefined);
  const [displaySeason, setDisplaySeason] = useState<number | undefined>(undefined);

  // Handlers
  const handleChangeTimeTab = useCallback(
    (tabs: TimeTabState) => {
      setTimeTab(tabs);
    },
    []
  );
  const handleCursor = useCallback(
    (dps?: SeasonDataPoint[]) => {
      setDisplayValue(dps  ? dps[0].value  : undefined);
      setDisplaySeason(dps ? dps[0].season : undefined);
    },
    []
  );

  const series = useMemo(() => {
    console.debug(`[TWAPCard] Building series with ${data?.seasons.length || 0} data points`)
    if (data) {
      const lastIndex = data.seasons.length - 1;
      const baseData  = data.seasons.reduce<SeasonDataPoint[]>((prev, curr, index) => {
        const useThisDataPoint = tabState[0] === SeasonAggregation.DAY ? (
          index === 0              // first in the series
          || index === lastIndex   // last in the series
          || index % 24 === 0      // grab every 24th data point
        ) : true;

        if (useThisDataPoint && curr !== null) {
          prev.push({
            season: curr.seasonInt as number,
            date:   new Date(parseInt(`${curr.timestamp}000`, 10)),
            value:  getValue(curr as Season),
          });
        }
        return prev;
      }, [])
      
      return baseData.sort((a, b) => a.season - b.season);
    }
    return [];
  }, [data, tabState, getValue])

  return (
    <>
      {/* Statistic & Controls */}
      <Stack direction="row" justifyContent="space-between" sx={{ px: 1.5, pt: 1.5 }}>
        <Stat
          gap={0.5}
          topIcon={<TokenIcon token={BEAN[SupportedChainId.MAINNET]} />}
          icon={undefined}
          color="primary"
          title="Time Weighted Average Price"
          amount={`$${(displayValue || defaultValue).toFixed(4)}`}
          bottomText={`Season ${(displaySeason || defaultSeason).toFixed()}`}
        />
        <Stack alignItems="right">
          <TimeTabs
            state={tabState}
            setState={handleChangeTimeTab}
          />
        </Stack>
      </Stack>
      {/* Chart Container */}
      <Box sx={{ width: '100%', height: '175px', position: 'relative' }}>
        {loading || series.length === 0 ? (
          <Stack width="100%" height="100%" alignItems="center" justifyContent="center">
            <CircularProgress variant="indeterminate" />
          </Stack>
        ) : (
          <SimpleLineChart
            isTWAP
            series={[series]}
            onCursor={handleCursor as any}
          />
        )}
      </Box>
    </>
  );
};

export default SeasonPlot;

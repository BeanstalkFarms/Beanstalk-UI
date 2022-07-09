import React, { useCallback, useMemo, useState } from 'react';
import { Stack, Box, CircularProgress } from '@mui/material';
import Stat, { StatProps } from 'components/Common/Stat';
import LineChart, { DataPoint, LineChartProps } from 'components/Common/Charts/LineChart';
import useSeasons, { SeasonAggregation, SeasonRange } from 'hooks/useSeasons';
import TimeTabs, { TimeTabState }  from './TimeTabs2';
import { Season } from 'generated/graphql';
import { DocumentNode } from 'graphql';

export type SeasonPlotProps = {
  /** The value displayed when the chart isn't being hovered. */
  defaultValue: number;
  /** The season displayed when the chart isn't being hovered. */
  defaultSeason: number;
  /** Which value to display from the Season object */
  getValue: (season: Season) => number,
  /** Format the value from number -> string */
  formatValue?: (value: number) => string,
}

type SeasonDataPoint = DataPoint & {
  season: number;
}

const defaultValueFormatter = (value: number) => value.toFixed(4);

type SeasonPlotFinalProps = (
  SeasonPlotProps 
  & { document: DocumentNode }
  & { StatProps: Omit<StatProps, 'amount' | 'subtitle'> }
  & { LineChartProps?: Pick<LineChartProps, 'curve' | 'isTWAP'> }
)

function SeasonPlot({
  document,
  defaultValue,
  defaultSeason,
  getValue,
  StatProps: statProps, // renamed to prevent type collision
  LineChartProps: lineChartProps,
  formatValue = defaultValueFormatter,
}: SeasonPlotFinalProps) {
  const [tabState, setTimeTab] = useState<TimeTabState>([SeasonAggregation.HOUR, SeasonRange.WEEK]);
  const { loading, data } = useSeasons(document, tabState[1]);

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
          {...statProps}
          amount={formatValue(displayValue || defaultValue)}
          subtitle={`Season ${(displaySeason || defaultSeason).toFixed()}`}
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
        {(loading || series.length === 0) ? (
          <Stack width="100%" height="100%" alignItems="center" justifyContent="center">
            <CircularProgress variant="indeterminate" />
          </Stack>
        ) : (
          <LineChart
            series={[series]}
            onCursor={handleCursor as any} // FIXME
            {...lineChartProps}
          />
        )}
      </Box>
    </>
  );
}

export default SeasonPlot;

import React, { useCallback, useMemo, useState } from 'react';
import { Stack, Box, CircularProgress } from '@mui/material';
import Stat, { StatProps } from 'components/Common/Stat';
import { Line } from '@visx/shape';
import LineChart, { DataPoint, LineChartProps } from 'components/Common/Charts/LineChart';
import useSeasons, { MinimumViableSnapshotQuery, SeasonAggregation, SeasonRange } from 'hooks/useSeasons';
import { DocumentNode } from 'graphql';
import { BeanstalkPalette } from 'components/App/muiTheme';
import TimeTabs, { TimeTabState }  from './TimeTabs';

type SeasonDataPoint = DataPoint & { season: number; };

const defaultValueFormatter = (value: number) => value.toFixed(4);

export type SeasonPlotBaseProps = {
  /** */
  document: DocumentNode;
  /**
   * The value displayed when the chart isn't being hovered.
   * If not provided, uses the `value` of the last data point if available,
   * otherwise returns 0.
   */
  defaultValue?: number;
  /**
   * The season displayed when the chart isn't being hovered.
   * If not provided, uses the `season` of the last data point if available,
   * otherwise returns 0.
   */
  defaultSeason?: number;
  /**
   * Height applied to the chart range. Can be a fixed
   * pixel number or a percent if the parent element has a constrained height.
   */
  height?: number | string;
}
type SeasonPlotFinalProps<T extends MinimumViableSnapshotQuery> = (
  SeasonPlotBaseProps
  & {
    /**
     * Which value to display from the Season object
     */
    getValue: (snapshot: T['seasons'][number]) => number,
    /**
     * Format the value from number -> string
     */
    formatValue?: (value: number) => string,
  } 
  & { StatProps: Omit<StatProps, 'amount' | 'subtitle'> }
  & { LineChartProps?: Pick<LineChartProps, 'curve' | 'isTWAP'> }
)

/**
 * 
 */
function SeasonPlot<T extends MinimumViableSnapshotQuery>({
  document,
  defaultValue: _defaultValue,
  defaultSeason: _defaultSeason,
  getValue,
  formatValue = defaultValueFormatter,
  height = '175px',
  StatProps: statProps,           // renamed to prevent type collision
  LineChartProps: lineChartProps, // renamed to prevent type collision
}: SeasonPlotFinalProps<T>) {
  /// Selected state
  const [tabState, setTimeTab] = useState<TimeTabState>([SeasonAggregation.HOUR, SeasonRange.WEEK]);
  const { loading, data } = useSeasons<T>(document, tabState[1]);

  /// Display values
  const [displayValue,  setDisplayValue]  = useState<number | undefined>(undefined);
  const [displaySeason, setDisplaySeason] = useState<number | undefined>(undefined);

  ///
  const series = useMemo(() => {
    console.debug(`[TWAPCard] Building series with ${data?.seasons.length || 0} data points`);
    if (data) {
      const lastIndex = data.seasons.length - 1;
      const baseData  = data.seasons.reduce<SeasonDataPoint[]>(
        (prev, curr, index) => {
          const useThisDataPoint = tabState[0] === SeasonAggregation.DAY ? (
            index === 0              // first in the series
            || index === lastIndex   // last in the series
            || index % 24 === 0      // grab every 24th data point
          ) : true;

          if (useThisDataPoint && curr !== null) {
            prev.push({
              season: curr.season as number,
              date:   new Date(parseInt(`${curr.timestamp}000`, 10)),
              value:  getValue(curr),
            });
          }
          return prev;
        },
        []
      );
      
      return baseData.sort((a, b) => a.season - b.season);
    }
    return [];
  }, [
    data,
    tabState,
    getValue
  ]);

  /// Handlers
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

  /// If one of the defaults is missing, use the last data point.
  let defaultValue  = _defaultValue  || 0;
  let defaultSeason = _defaultSeason || 0;
  if (!defaultValue || !defaultSeason) {
    if (data && series.length > 0) {
      defaultValue  = series[series.length - 1].value;
      defaultSeason = series[series.length - 1].season;
    }
  }

  const seriesInput = useMemo(() => [series], [series]);

  return (
    <>
      {/* Statistic & Controls */}
      <Stack direction="row" justifyContent="space-between" sx={{ px: 2 }}>
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
      <Box sx={{ width: '100%', height, position: 'relative' }}>
        {(loading || series.length === 0) ? (
          <Stack width="100%" height="100%" alignItems="center" justifyContent="center">
            <CircularProgress variant="indeterminate" />
          </Stack>
        ) : (
          <LineChart
            series={seriesInput}
            onCursor={handleCursor as any} // FIXME
            {...lineChartProps}
          >
            {(props) => {
              const x = props.scales[0].xScale(6074) as number;
              return x ? (
                <Line
                  from={{ x, y: props.dataRegion.yTop }}
                  to={{ x, y: props.dataRegion.yBottom }}
                  stroke={BeanstalkPalette.logoGreen}
                  strokeDasharray={4}
                  strokeDashoffset={2}
                  strokeWidth={1}
                />
              ) : null;
            }}
          </LineChart>
        )}
      </Box>
    </>
  );
}

export default SeasonPlot;

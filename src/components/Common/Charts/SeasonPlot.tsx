import React, { useCallback, useMemo, useState } from 'react';
import { Stack, Box, CircularProgress, Typography } from '@mui/material';
import { Line } from '@visx/shape';
import { DocumentNode } from 'graphql';
import { QueryOptions } from '@apollo/client';
import BigNumber from 'bignumber.js';
import Stat, { StatProps } from '~/components/Common/Stat';
import LineChart, {
  DataPoint,
  LineChartProps,
} from '~/components/Common/Charts/LineChart';
import useSeasonsQuery, {
  MinimumViableSnapshotQuery,
  SeasonAggregation,
  SeasonRange,
} from '~/hooks/beanstalk/useSeasonsQuery';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import TimeTabs, { TimeTabState } from './TimeTabs';
import { sortSeasons } from '~/util/Season';
import StackedAreaChart from '~/components/Common/Charts/StackedAreaChart';
import Row from '~/components/Common/Row';
import { secondsToDate } from '~/util';

export const defaultValueFormatter = (value: number) => value.toFixed(4);

export type SeasonDataPoint = DataPoint;

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
  /** True if this plot should be a StackedAreaChard */
  stackedArea?: boolean;
};
type SeasonPlotFinalProps<T extends MinimumViableSnapshotQuery> =
  SeasonPlotBaseProps & {
    /**
     * Which value to display from the Season object
     */
    getValue: (snapshot: T['seasons'][number]) => number;
    /**
     * Format the value from number -> string
     */
    formatValue?: (value: number) => string | JSX.Element;
    /**
     *
     */
    queryConfig?: Partial<QueryOptions>
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
  StatProps: statProps, // renamed to prevent type collision
  LineChartProps: lineChartProps, // renamed to prevent type collision
  queryConfig,
  stackedArea,
}: SeasonPlotFinalProps<T>) {
  /// Selected state
  const [tabState, setTimeTab] = useState<TimeTabState>([
    SeasonAggregation.HOUR,
    SeasonRange.WEEK,
  ]);

  /// Display values
  const [displayValue, setDisplayValue] = useState<number | undefined>(
    undefined
  );
  const [displaySeason, setDisplaySeason] = useState<number | undefined>(
    undefined
  );

  ///
  const { loading, error, data } = useSeasonsQuery<T>(
    document,
    tabState[1],
    queryConfig
  );
  const series = useMemo(() => {
    console.debug(
      `[SeasonPlot] Building series with ${
        data?.seasons.length || 0
      } data points`,
      data
    );
    if (data) {
      const lastIndex = data.seasons.length - 1;
      const points : SeasonDataPoint[] = [];

      if (tabState[0] === SeasonAggregation.DAY) {
        let v = 0; // value aggregator
        let i = 0; // total iterations
        let j = 0; // points averaged into this day
        let d : Date | undefined; // current date for this avg
        let s : number | undefined; // current season for this avg
        for (let k = lastIndex; k >= 0; k -= 1) {
          const season = data.seasons[k];
          if (!season) continue; // skip empty points
          v += getValue(season);
          if (j === 0) {
            d = secondsToDate(season.timestamp);
            s = season.season as number;
            j += 1;
          } else if (
            i === lastIndex // last iteration
            || j === 24 // full day of data ready
          ) {
            points.push({
              season: s as number,
              date:   d as Date,
              value:  new BigNumber(v).div(j + 1).toNumber()
            });
            v = 0;
            j = 0;
          } else {
            j += 1;
          }
          i += 1;
        }
      } else {
        for (const season of data.seasons) {
          if (!season) continue;
          points.push({
            season: season.season as number,
            date:   secondsToDate(season.timestamp),
            value:  getValue(season),
          });
        }
      }
    }
    return [];
  }, [data, tabState, getValue]);

  /// Handlers
  const handleChangeTimeTab = useCallback(
    (tabs: TimeTabState) => {
      setTimeTab(tabs);
    },
    []
  );
  const handleCursor = useCallback(
    (dps?: SeasonDataPoint[]) => {
      setDisplaySeason(dps ? dps[0].season : undefined);
      setDisplayValue(dps ? dps[0].value : undefined);
    },
    []
  );

  /// If one of the defaults is missing, use the last data point.
  let defaultValue = _defaultValue || 0;
  let defaultSeason = _defaultSeason || 0;
  if (!defaultValue || !defaultSeason) {
    if (data && series.length > 0) {
      defaultValue = series[series.length - 1].value;
      defaultSeason = series[series.length - 1].season;
    }
  }

  const seriesInput = useMemo(() => [series], [series]);

  return (
    <>
      {/* Statistic & Controls */}
      <Row justifyContent="space-between" sx={{ px: 2 }}>
        <Stat
          {...statProps}
          amount={
            loading ? (
              <CircularProgress
                variant="indeterminate"
                size="1.18em"
                thickness={5}
              />
            ) : (
              formatValue(
                displayValue !== undefined ? displayValue : defaultValue
              )
            )
          }
          subtitle={`Season ${(displaySeason !== undefined
            ? displaySeason
            : defaultSeason
          ).toFixed()}`}
        />
        <Stack alignItems="right" alignSelf="flex-start">
          <TimeTabs state={tabState} setState={handleChangeTimeTab} />
        </Stack>
      </Row>
      {/* Chart Container */}
      <Box sx={{ width: '100%', height, position: 'relative' }}>
        {loading || series.length === 0 ? (
          <Stack height="100%" alignItems="center" justifyContent="center">
            {error ? (
              <Typography>
                An error occurred while loading this data.
              </Typography>
            ) : (
              <CircularProgress variant="indeterminate" />
            )}
          </Stack>
        ) : (
          <>
            {stackedArea ? (
              <StackedAreaChart
                series={seriesInput}
                onCursor={handleCursor as any} // FIXME
                {...lineChartProps}
              />
            ) : (
              <LineChart
                series={seriesInput}
                onCursor={handleCursor as any} // FIXME
                curve="linear"
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
          </>
        )}
      </Box>
    </>
  );
}

export default SeasonPlot;

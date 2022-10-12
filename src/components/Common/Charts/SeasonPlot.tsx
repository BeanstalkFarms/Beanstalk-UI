import React, { useCallback, useMemo } from 'react';
import { DocumentNode } from 'graphql';
import { QueryOptions } from '@apollo/client';
import { StatProps } from '~/components/Common/Stat';
import { DataPoint } from '~/components/Common/Charts/LineChart';
import useSeasonsQuery, {
  MinimumViableSnapshotQuery,
} from '~/hooks/beanstalk/useSeasonsQuery';
import BaseSeasonPlot from './BaseSeasonPlot';
import useTimeTabState from '~/hooks/app/useTimeTabState';
import { BaseChartProps, BaseDataPoint } from './ChartPropProvider';

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
    queryConfig?: Partial<QueryOptions>;
    StatProps: Omit<StatProps, 'amount' | 'subtitle'>;
    LineChartProps?: Pick<BaseChartProps, 'curve' | 'isTWAP'>;
  };

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
  LineChartProps,
  queryConfig,
  stackedArea,
}: SeasonPlotFinalProps<T>) {
  const timeTabParams = useTimeTabState();
  const getDisplayValue = useCallback((v?: BaseDataPoint[]) => {
    if (!v?.length) return 0;
    const curr = v[0];
    return curr && 'value' in curr ? curr.value : 0;
  }, []);

  const seasonsQuery = useSeasonsQuery<T>(
    document,
    timeTabParams[0][1],
    queryConfig
  );

  const queryParams = useMemo(
    () => [{ query: seasonsQuery, getValue, key: 'value' }],
    [seasonsQuery, getValue]
  );

  return (
    <BaseSeasonPlot
      queryData={queryParams}
      height={height}
      StatProps={statProps}
      timeTabParams={timeTabParams}
      stackedArea={stackedArea}
      formatValue={formatValue}
      ChartProps={{
        getDisplayValue: getDisplayValue,
        tooltip: false,
        ...LineChartProps,
      }}
    />
  );
}

export default SeasonPlot;

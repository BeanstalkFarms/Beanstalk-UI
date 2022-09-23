import { DocumentNode, QueryOptions } from '@apollo/client';
import { DataPoint } from '~/components/Common/Charts/LineChart';
import { MinimumViableSnapshotQuery } from './useSeasonsQuery';

export type SubgraphContext = 'bean' | 'beanstalk';

export type SeasonQueryParams<T extends MinimumViableSnapshotQuery> = {
  queryConfig?: Partial<QueryOptions>;
  document: DocumentNode;
  getValue: (snapshot: T['seasons'][number]) => number;
};

export type SeasonPlotBaseParams<T extends MinimumViableSnapshotQuery> = {
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
};

export type SeasonDataPoint = DataPoint;

export const combineSeasonsQueries = <T extends MinimumViableSnapshotQuery>(
  params: SeasonQueryParams<T>[]
) => {
  const document = params[0].document;
};

const useCombineSeasonsQueries = () => {};

export default useCombineSeasonsQueries;

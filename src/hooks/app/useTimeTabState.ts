import { useMemo, useState } from 'react';
import { TimeTabState } from '~/components/Common/Charts/TimeTabs';
import { SeasonAggregation, SeasonRange } from '../beanstalk/useSeasonsQuery';

type UseTimeTabStateParams = [
  TimeTabState,
  (aggregation: SeasonAggregation) => void,
  (range: SeasonRange) => void,
];

/**
 * @returns [0]: {}
 * @returns [1]: setAggregation
 * @returns [2]: setRange
 */
export default function useTimeTabState(): UseTimeTabStateParams {
  const [tabState, setTimeTab] = useState<TimeTabState>([
    SeasonAggregation.HOUR,
    SeasonRange.WEEK,
  ]);

  const set = useMemo(() => {
    const aggregation = (_aggregation: SeasonAggregation) => {
      setTimeTab((prev) => [_aggregation, prev[1]]);
    };
    const range = (_range: SeasonRange) => {
      setTimeTab((prev) => [prev[0], _range]);
    };
    return { aggregation, range };
  }, []);

  return [tabState, set.aggregation, set.range];
}

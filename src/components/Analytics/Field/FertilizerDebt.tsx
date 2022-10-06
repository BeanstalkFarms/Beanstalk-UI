import BigNumber from 'bignumber.js';
import React, { useMemo } from 'react';
import SeasonPlotMulti from '~/components/Common/Charts/SeasonPlotMulti';
import { BEAN } from '~/constants/tokens';
import { SeasonalPodsDocument, SeasonalPodsQuery } from '~/generated/graphql';
import useTimeTabState from '~/hooks/app/useTimeTabState';
import useSeasonsQuery, {
  SnapshotData,
} from '~/hooks/beanstalk/useSeasonsQuery';
import useUnfertilizedSprouts, {
  UnfertilizedSproutsBySeasonQuery,
} from '~/hooks/beanstalk/useUnfertilizedSprouts';
import { toTokenUnitsBN } from '~/util';

const getUnfertilizedSprouts = (
  season: SnapshotData<UnfertilizedSproutsBySeasonQuery>
) => new BigNumber(season.unfertilizedSprouts).dividedBy(1e6).toNumber();

const getPods = (season: SnapshotData<SeasonalPodsQuery>) =>
  toTokenUnitsBN(season.totalPods, BEAN[1].decimals).toNumber();

const formatValue = (value: number) =>
  `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

const FertilizerDebt: React.FC<{}> = () => {
  const timeTabParams = useTimeTabState();
  const fertilizerQuery = useUnfertilizedSprouts(timeTabParams[0][1]);
  const podsQuery = useSeasonsQuery<SeasonalPodsQuery>(
    SeasonalPodsDocument,
    timeTabParams[0][1],
    undefined
  );

  const statProps = useMemo(
    () => ({
      title: 'Total Debt',
      gap: 0.5,
    }),
    []
  );

  const queryParams = useMemo(
    () => [
      {
        query: fertilizerQuery,
        key: 'sprouts',
        getValue: getUnfertilizedSprouts,
      },
      {
        query: podsQuery,
        key: 'pods',
        getValue: getPods,
      },
    ],
    [podsQuery, fertilizerQuery]
  );

  return (
    <SeasonPlotMulti
      queryData={queryParams}
      timeTabParams={timeTabParams}
      height={300}
      getStatValue={(data) => {
        if (Array.isArray(data)) return 0;
        return data.sprouts + data.pods;
      }}
      formatValue={formatValue}
      StatProps={statProps}
      stackedArea
      // ChartProps={{
      //   tooltip: true,
      // }}
    />
  );
};

export default FertilizerDebt;

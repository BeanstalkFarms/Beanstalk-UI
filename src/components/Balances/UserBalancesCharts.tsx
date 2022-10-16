import React, { useMemo } from 'react';
import useAccount from '~/hooks/ledger/useAccount';
import useFarmerBalancesOverview from '~/hooks/farmer/useFarmerBalancesOverview';
import { BaseDataPoint } from '~/components/Common/Charts/ChartPropProvider';
import useTimeTabState from '~/hooks/app/useTimeTabState';
import BaseSeasonPlot, { QueryData } from '~/components/Common/Charts/BaseSeasonPlot';
import { SILO_WHITELIST } from '~/constants/tokens';
import { SEASON_RANGE_TO_COUNT, SeasonRange } from '~/hooks/beanstalk/useSeasonsQuery';

const UserBalancesCharts: React.FC<{}> = () => {
  //
  const account = useAccount();
  const timeTabParams = useTimeTabState();
  const { data, loading } = useFarmerBalancesOverview(account);

  const formatValue = (value: number) =>
    `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

  const getStatValue = <T extends BaseDataPoint>(v?: T[]) => {
    if (!v?.length) return 0;
    const dataPoint = v[0];
    return dataPoint?.value || 0;
  };

  const seriesInput = useMemo(() => data.deposits, [data.deposits]);

  // filter data using selected time tab
  const filteredSeries = useMemo(() => {
    if (timeTabParams[0][1] !== SeasonRange.ALL) {
      if (Array(seriesInput)) {
        return [seriesInput].map((s) =>
          s.slice(-(SEASON_RANGE_TO_COUNT[timeTabParams[0][1]] as number)
        ));
      }
    }
    return Array(seriesInput);
  }, [seriesInput, timeTabParams]);

  const queryData: QueryData = {
    data: filteredSeries as BaseDataPoint[][],
    loading: loading,
    keys: SILO_WHITELIST.map((t) => t[1].address),
    error: undefined
  };

  return (
    <BaseSeasonPlot
      queryData={queryData}
      height={300}
      StatProps={{
        title: 'Total Deposited Value',
        gap: 0.5,
      }}
      timeTabParams={timeTabParams}
      formatValue={formatValue}
      stackedArea
      ChartProps={{
        getDisplayValue: getStatValue,
        tooltip: true,
      }}
    />
  );
};

export default UserBalancesCharts;

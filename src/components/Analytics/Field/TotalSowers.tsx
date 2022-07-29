import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from 'components/Common/Charts/SeasonPlot';
import { SeasonalTotalSowersDocument, SeasonalTotalSowersQuery } from 'generated/graphql';
import useSeason from 'hooks/useSeason';
import usePodRate from 'hooks/usePodRate';
import { SnapshotData } from 'hooks/useSeasons';

const getValue = (season: SnapshotData<SeasonalTotalSowersQuery>) => season.totalNumberOfSowers;
const formatValue = (value: number) => `${(value * 100).toFixed(2)}%`;
const StatProps = {
  title: 'TotalSowers',
  gap: 0.25,
  sx: { ml: 0 }
};

const TotalSowers: React.FC<{height?: SeasonPlotBaseProps['height']}> = ({ height }) => {
  const podRate = usePodRate();
  const season  = useSeason();
  return (
    <SeasonPlot<SeasonalTotalSowersQuery>
      height={height}
      document={SeasonalTotalSowersDocument}
      // defaultValue={podRate?.gt(0) ? podRate.div(100).toNumber() : 0}
      defaultSeason={season?.gt(0) ? season.toNumber() : 0}
      getValue={getValue}
      formatValue={formatValue}
      StatProps={StatProps}
    />
  );
};

export default TotalSowers;

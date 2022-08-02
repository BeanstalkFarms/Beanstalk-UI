import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from 'components/Common/Charts/SeasonPlot';
import { SeasonalTotalSowersDocument, SeasonalTotalSowersQuery } from 'generated/graphql';
import useSeason from 'hooks/useSeason';
import { SnapshotData } from 'hooks/useSeasons';

const getValue = (season: SnapshotData<SeasonalTotalSowersQuery>) => season.totalNumberOfSowers;
const formatValue = (value: number) => `${value}`;
const StatProps = {
  title: 'Total Sowers',
  gap: 0.25,
  sx: { ml: 0 }
};

const TotalSowers: React.FC<{height?: SeasonPlotBaseProps['height']}> = ({ height }) => {
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

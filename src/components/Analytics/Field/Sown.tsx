import React from 'react';
import SeasonPlot from 'components/Common/Charts/SeasonPlot';
import { SeasonalSownDocument, SeasonalSownQuery } from 'generated/graphql';
import useSeason from 'hooks/useSeason';
import usePodRate from 'hooks/usePodRate';
import { SnapshotData } from 'hooks/useSeasons';

const getValue = (season: SnapshotData<SeasonalSownQuery>) => parseFloat(season.sownBeans);
const formatValue = (value: number) => `${(value * 100).toFixed(2)}%`;
const StatProps = {
  title: 'Sown',
  gap: 0.25,
  sx: { ml: 0 }
};

const Sown: React.FC<{}> = () => {
  const podRate = usePodRate();
  const season  = useSeason();
  return (
    <SeasonPlot<SeasonalSownQuery>
      document={SeasonalSownDocument}
      // defaultValue={podRate?.gt(0) ? podRate.div(100).toNumber() : 0}
      defaultSeason={season?.gt(0) ? season.toNumber() : 0}
      getValue={getValue}
      formatValue={formatValue}
      StatProps={StatProps}
    />
  );
};

export default Sown;

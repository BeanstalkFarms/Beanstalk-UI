import React from 'react';
import SeasonPlot from 'components/Common/Charts/SeasonPlot';
import { Season, SeasonalPodRateDocument } from 'generated/graphql';
import useSeason from 'hooks/useSeason';
import usePodRate from 'hooks/usePodRate';

const getValue = (season: Season) => parseFloat(season.field.podRate);
const formatValue = (value: number) => `${value.toFixed(2)}%`;
const StatProps = {
  title: 'Pod Rate',
  gap: 0.5,
};

const PodRate: React.FC<{}> = () => {
  const podRate = usePodRate();
  const season = useSeason();
  return (
    <SeasonPlot
      document={SeasonalPodRateDocument}
      defaultValue={podRate?.gt(0) ? podRate.toNumber() : 0}
      defaultSeason={season?.gt(0) ? season.toNumber() : 0}
      getValue={getValue}
      formatValue={formatValue}
      StatProps={StatProps}
    />
  );
};

export default PodRate;

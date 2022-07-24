import React from 'react';
import SeasonPlot from 'components/Common/Charts/SeasonPlot';
import { SeasonalHarvestedPodsDocument, SeasonalHarvestedPodsQuery } from 'generated/graphql';
import { SnapshotData } from 'hooks/useSeasons';

const getValue = (season: SnapshotData<SeasonalHarvestedPodsQuery>) => parseFloat(season.totalHarvestedPods);
const formatValue = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const StatProps = {
  title: 'Harvested Pods',
  gap: 0.5,
};

const HarvestedPods: React.FC<{}> = () => (
  <SeasonPlot<SeasonalHarvestedPodsQuery>
    document={SeasonalHarvestedPodsDocument}
    getValue={getValue}
    formatValue={formatValue}
    StatProps={StatProps}
  />
);

export default HarvestedPods;

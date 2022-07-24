import React from 'react';
import SeasonPlot from 'components/Common/Charts/SeasonPlot';
import { SeasonalPodsDocument, SeasonalPodsQuery } from 'generated/graphql';
import { SnapshotData } from 'hooks/useSeasons';

const getValue = (season: SnapshotData<SeasonalPodsQuery>) => parseFloat(season.totalPods);
const formatValue = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const StatProps = {
  title: 'Pods',
  gap: 0.5,
};

const Pods: React.FC<{}> = () => (
  <SeasonPlot<SeasonalPodsQuery>
    document={SeasonalPodsDocument}
    getValue={getValue}
    formatValue={formatValue}
    StatProps={StatProps}
  />
);

export default Pods;

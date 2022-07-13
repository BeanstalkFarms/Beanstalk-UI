import React from 'react';
import SeasonPlot from 'components/Common/Charts/SeasonPlot';
import { Season, SeasonalHarvestedPodsDocument } from 'generated/graphql';

const getValue = (season: Season) => parseFloat(season.field.harvestedPods);
const formatValue = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const StatProps = {
  title: 'Harvested Pods',
  gap: 0.5,
};

const HarvestedPods: React.FC<{}> = () => (
  <SeasonPlot
    document={SeasonalHarvestedPodsDocument}
    getValue={getValue}
    formatValue={formatValue}
    StatProps={StatProps}
    />
  );

export default HarvestedPods;

import React from 'react';
import SeasonPlot from 'components/Common/Charts/SeasonPlot';
import { Season, SeasonalPodsDocument } from 'generated/graphql';

const getValue = (season: Season) => parseFloat(season.field.totalPods);
const formatValue = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const StatProps = {
  title: 'Pods',
  gap: 0.5,
};

const Pods: React.FC<{}> = () => (
  <SeasonPlot
    document={SeasonalPodsDocument}
    getValue={getValue}
    formatValue={formatValue}
    StatProps={StatProps}
    />
  );

export default Pods;

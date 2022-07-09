import React from 'react';
import SeasonPlot from 'components/Common/Charts/SeasonPlot';
import { Season, SeasonalPodsDocument } from 'generated/graphql';
import useSeason from 'hooks/useSeason';
import { ZERO_BN } from 'constants/index';

const getValue = (season: Season) => parseFloat(season.field.totalPods);
const formatValue = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
const StatProps = {
  title: "Pods",
  gap: 0.5,
};

const Pods: React.FC<{}> = () => {
  const pods = ZERO_BN;
  const season = useSeason();
  return (
    <SeasonPlot
      document={SeasonalPodsDocument}
      defaultValue={pods?.gt(0) ? pods.toNumber() : 0}
      defaultSeason={season?.gt(0) ? season.toNumber() : 0}
      getValue={getValue}
      formatValue={formatValue}
      StatProps={StatProps}
    />
  );
};

export default Pods;

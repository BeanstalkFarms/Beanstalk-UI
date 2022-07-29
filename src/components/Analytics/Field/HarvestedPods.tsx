import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from 'components/Common/Charts/SeasonPlot';
import { SeasonalHarvestedPodsDocument, SeasonalHarvestedPodsQuery } from 'generated/graphql';
import { SnapshotData } from 'hooks/useSeasons';
import { toTokenUnitsBN } from 'util/index';
import { BEAN } from 'constants/tokens';

const getValue = (season: SnapshotData<SeasonalHarvestedPodsQuery>) => toTokenUnitsBN(season.totalHarvestedPods, BEAN[1].decimals).toNumber();
const formatValue = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const StatProps = {
  title: 'Harvested Pods',
  gap: 0.5,
};

const HarvestedPods: React.FC<{height?: SeasonPlotBaseProps['height']}> = ({ height }) => (
  <SeasonPlot<SeasonalHarvestedPodsQuery>
    height={height}
    document={SeasonalHarvestedPodsDocument}
    getValue={getValue}
    formatValue={formatValue}
    StatProps={StatProps}
  />
);

export default HarvestedPods;

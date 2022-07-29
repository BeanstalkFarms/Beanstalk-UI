import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from 'components/Common/Charts/SeasonPlot';
import { SeasonalPodsDocument, SeasonalPodsQuery } from 'generated/graphql';
import { SnapshotData } from 'hooks/useSeasons';
import { toTokenUnitsBN } from '../../../util';
import { BEAN } from '../../../constants/tokens';

const getValue = (season: SnapshotData<SeasonalPodsQuery>) => toTokenUnitsBN(season.totalPods, BEAN[1].decimals).toNumber();
const formatValue = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const StatProps = {
  title: 'Pods',
  gap: 0.5,
};

const Pods: React.FC<{height?: SeasonPlotBaseProps['height']}> = ({ height }) => (
  <SeasonPlot<SeasonalPodsQuery>
    height={height}
    document={SeasonalPodsDocument}
    getValue={getValue}
    formatValue={formatValue}
    StatProps={StatProps}
  />
);

export default Pods;

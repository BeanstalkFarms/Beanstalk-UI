import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { SeasonalRRoRDocument, SeasonalRRoRQuery } from '~/generated/graphql';
import { SnapshotData } from '~/hooks/beanstalk/useSeasonsQuery';

const getValue = (season: SnapshotData<SeasonalRRoRQuery>) => parseFloat(season.realRateOfReturn) * 100;
const formatValue = (value: number) => `${value.toFixed(2)}%`;
const StatProps = {
  title: 'Real Rate of Return',
  gap: 0.5,
};

const RRoR: React.FC<{height?: SeasonPlotBaseProps['height']}> = ({ height }) => (
  <SeasonPlot<SeasonalRRoRQuery>
    height={height}
    document={SeasonalRRoRDocument}
    getValue={getValue}
    formatValue={formatValue}
    StatProps={StatProps}
  />
);

export default RRoR;

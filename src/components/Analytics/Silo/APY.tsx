import BigNumber from 'bignumber.js';
import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { SeasonalApyDocument, SeasonalApyQuery } from '~/generated/graphql';
import { SnapshotData } from '~/hooks/beanstalk/useSeasonsQuery';

const getValue = (season: SnapshotData<SeasonalApyQuery>) => new BigNumber(season.twoSeedBeanAPY).times(100).toNumber();
const formatValue = (value: number) => `${value.toFixed(2)}%`;
const StatProps = {
  title: 'vAPY',
  titleTooltip: 'A variable estimate of return for depositing into the Silo.',
  gap: 0.5,
};
const queryConfig = {
  variables: {
    season_gt: 6074,
  }
};

const APY: React.FC<{
  height?: SeasonPlotBaseProps['height'];
}> = ({ 
  height,
}) => (
  <SeasonPlot<SeasonalApyQuery>
    height={height}
    document={SeasonalApyDocument}
    getValue={getValue}
    formatValue={formatValue}
    StatProps={StatProps}
    queryConfig={queryConfig}
  />
);

export default APY;

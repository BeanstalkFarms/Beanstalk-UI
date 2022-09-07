import BigNumber from 'bignumber.js';
import React, { useCallback, useMemo } from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { SeasonalApyDocument, SeasonalApyQuery } from '~/generated/graphql';
import { SnapshotData } from '~/hooks/beanstalk/useSeasonsQuery';

const formatValue = (value: number) => `${value.toFixed(2)}%`;
const queryConfig = {
  variables: {
    season_gt: 6074,
  }
};

const metricToKey = {
  Bean: 'twoSeedBeanAPY',
  LP: 'fourSeedBeanAPY',
  Stalk: 'twoSeedStalkAPY',
};

const APY: React.FC<{
  height?: SeasonPlotBaseProps['height'];
  metric: keyof typeof metricToKey
}> = ({ 
  height,
  metric,
}) => (
  <SeasonPlot<SeasonalApyQuery>
    height={height}
    document={SeasonalApyDocument}
    getValue={useCallback((season: SnapshotData<SeasonalApyQuery>) => 
      new BigNumber(season[metricToKey[metric] as keyof typeof season]).times(100).toNumber(), 
      [metric]
    )}
    formatValue={formatValue}
    StatProps={useMemo(() => ({
      title: `${metric} vAPY`,
      titleTooltip: 'A variable estimate of return for depositing into the Silo.',
      gap: 0.5,
    }), [metric])}
    queryConfig={queryConfig}
  />
);

export default APY;

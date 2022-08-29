import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { SeasonalPodRateDocument, SeasonalPodRateQuery } from '~/generated/graphql';
import useSeason from '~/hooks/beanstalk/useSeason';
import usePodRate from '~/hooks/beanstalk/usePodRate';
import { SnapshotData } from '~/hooks/beanstalk/useSeasonsQuery';

const getValue = (season: SnapshotData<SeasonalPodRateQuery>) => parseFloat(season.podRate);
const formatValue = (value: number) => `${(value * 100).toFixed(2)}%`;
const StatProps = {
  title: 'Pod Rate',
  titleTooltip: 'The number of Pods per Bean as a percentage. The Pod Rate is often used as a proxy for Beanstalk\'s health.',
  gap: 0.25,
  sx: { ml: 0 }
};

const PodRate: React.FC<{height?: SeasonPlotBaseProps['height']}> = ({ height }) => {
  const podRate = usePodRate();
  const season  = useSeason();
  return (
    <SeasonPlot<SeasonalPodRateQuery>
      height={height}
      document={SeasonalPodRateDocument}
      defaultValue={podRate?.gt(0) ? podRate.div(100).toNumber() : 0}
      defaultSeason={season?.gt(0) ? season.toNumber() : 0}
      getValue={getValue}
      formatValue={formatValue}
      StatProps={StatProps}
      LineChartProps={{ yAxisMultiplier: 100 }}
    />
  );
};

export default PodRate;

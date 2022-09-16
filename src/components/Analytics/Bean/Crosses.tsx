import React from 'react';
import { tickFormatLocale } from '~/components/Analytics/formatters';
import { LineChartProps } from '~/components/Common/Charts/LineChart';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { SeasonalCrossesDocument, SeasonalCrossesQuery } from '~/generated/graphql';
import useSeason from '~/hooks/beanstalk/useSeason';
import { SnapshotData } from '~/hooks/beanstalk/useSeasonsQuery';

const getValue = (season: SnapshotData<SeasonalCrossesQuery>) => season.totalCrosses;
const formatValue = (value: number) => `${value}`;
const statProps = {
  title: 'Peg Crosses',
  titleTooltip: 'The number of times Bean has crossed its peg.',
  gap: 0.25,
  sx: { ml: 0 }
};
const queryConfig = { context: { subgraph: 'bean' } };
const lineChartProps : Partial<LineChartProps> = {
  yTickFormat: tickFormatLocale
};

const Crosses: React.FC<{height?: SeasonPlotBaseProps['height']}> = ({ height }) => {
  const season = useSeason();
  return (
    <SeasonPlot<SeasonalCrossesQuery>
      height={height}
      document={SeasonalCrossesDocument}
      defaultSeason={season?.gt(0) ? season.toNumber() : 0}
      getValue={getValue}
      formatValue={formatValue}
      queryConfig={queryConfig}
      StatProps={statProps}
      LineChartProps={lineChartProps}
    />
  );
};

export default Crosses;

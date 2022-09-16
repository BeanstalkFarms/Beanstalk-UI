import React from 'react';
import { tickFormatUSD } from '~/components/Analytics/formatters';
import { CURVES, LineChartProps } from '~/components/Common/Charts/LineChart';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { SeasonalVolumeDocument, SeasonalVolumeQuery } from '~/generated/graphql';
import useSeason from '~/hooks/beanstalk/useSeason';

const getValue = (season: SeasonalVolumeQuery['seasons'][number]) => parseFloat(season.hourlyVolumeUSD);
const formatValue = (value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const statProps = {
  title: 'Volume',
  titleTooltip: 'The USD volume in the BEAN:3CRV pool at the end of every Season/day.',
  gap: 0.25,
};
const queryConfig = { context: { subgraph: 'bean' } };
const lineChartProps : Partial<LineChartProps> = {
  curve: CURVES.step,
  yTickFormat: tickFormatUSD,
};

const Volume: React.FC<{ height?: SeasonPlotBaseProps['height'] }> = ({ height }) => {
  const season = useSeason();
  return (
    <SeasonPlot
      document={SeasonalVolumeDocument}
      height={height}
      defaultSeason={season?.gt(0) ? season.toNumber() : 0}
      getValue={getValue}
      formatValue={formatValue}
      StatProps={statProps}
      LineChartProps={lineChartProps}
      queryConfig={queryConfig}
    />
  );
};

export default Volume;

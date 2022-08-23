import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { SeasonalVolumeDocument, SeasonalVolumeQuery } from '~/generated/graphql';
import useSeason from '~/hooks/beanstalk/useSeason';

const getValue = (season: SeasonalVolumeQuery['seasons'][number]) => parseFloat(season.hourlyVolumeUSD);
const formatValue = (value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const StatProps = {
  title: 'Volume',
  gap: 0.25,
  color: 'primary',
  sx: { ml: 0 },
};

const queryConfig = { context: { subgraph: 'bean' } };

const Volume: React.FC<{ height?: SeasonPlotBaseProps['height'] }> = ({ height }) => {
  const season = useSeason();
  return (
    <SeasonPlot
      document={SeasonalVolumeDocument}
      height={height}
      defaultSeason={season?.gt(0) ? season.toNumber() : 0}
      getValue={getValue}
      formatValue={formatValue}
      StatProps={StatProps}
      queryConfig={queryConfig}
    />
  );
};

export default Volume;

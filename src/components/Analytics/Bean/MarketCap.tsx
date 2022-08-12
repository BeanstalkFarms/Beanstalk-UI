import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { Season, SeasonalMarketCapDocument } from '~/generated/graphql';
import useSeason from '~/hooks/useSeason';

const getValue = (season: Season) => parseFloat(season.marketCap);
const formatValue = (value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const StatProps = {
  title: 'Market Cap',
  gap: 0.25,
  color: 'primary',
  sx: { ml: 0 },
};

const MarketCap: React.FC<{ height?: SeasonPlotBaseProps['height'] }> = ({ height }) => {
  const season = useSeason();
  return (
    <SeasonPlot
      document={SeasonalMarketCapDocument}
      height={height}
      defaultSeason={season?.gt(0) ? season.toNumber() : 0}
      getValue={getValue}
      formatValue={formatValue}
      StatProps={StatProps}
    />
  );
};

export default MarketCap;

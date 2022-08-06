import React from 'react';
import { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { Season } from '~/generated/graphql';
import useSeason from '~/hooks/useSeason';

const getValue = (season: Season) => parseFloat(season.marketCap);
const formatValue = (value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const useStatProps = () => ({
  title: 'Volume',
  gap: 0.25,
  color: 'primary',
  sx: { ml: 0 },
});

const MarketCap: React.FC<{ height?: SeasonPlotBaseProps['height'] }> = ({ height }) => {
  const season = useSeason();
  const StatProps = useStatProps();
  return (
    null
    // <SeasonPlot
    //   document={SeasonalMarketCapDocument}
    //   height={height}
    //   defaultSeason={season?.gt(0) ? season.toNumber() : 0}
    //   getValue={getValue}
    //   formatValue={formatValue}
    //   StatProps={StatProps}
    // />
  );
};

export default MarketCap;

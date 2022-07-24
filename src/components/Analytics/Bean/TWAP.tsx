import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from 'components/Common/Charts/SeasonPlot';
import { Season, SeasonalTwapDocument } from 'generated/graphql';
import usePrice from 'hooks/usePrice';
import useSeason from 'hooks/useSeason';

const getValue = (season: Season) => parseFloat(season.twap);
const formatValue = (value: number) => `$${value.toFixed(4)}`;
const StatProps = {
  title: 'Time Weighted Avg. Price',
  // titleIcon: <TokenIcon token={BEAN[SupportedChainId.MAINNET]} />,
  gap: 0.25,
  color: 'primary',
  sx: { ml: 0 }
};
const LineChartProps = {
  isTWAP: true,
};

const TWAP: React.FC<{ height?: SeasonPlotBaseProps['height'] }> = ({ height }) => {
  const price  = usePrice();
  const season = useSeason();
  return (
    <SeasonPlot
      document={SeasonalTwapDocument}
      height={height}
      defaultValue={price?.gt(0) ? price.toNumber() : 0}
      defaultSeason={season?.gt(0) ? season.toNumber() : 0}
      getValue={getValue}
      formatValue={formatValue}
      StatProps={StatProps}
      LineChartProps={LineChartProps}
    />
  );
};

export default TWAP;

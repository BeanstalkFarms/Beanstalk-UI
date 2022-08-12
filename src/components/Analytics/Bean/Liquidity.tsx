import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { SeasonalLiquidityDocument, SeasonalLiquidityQuery } from '~/generated/graphql';
import useSeason from '~/hooks/useSeason';

const getValue = (season: SeasonalLiquidityQuery['seasons'][number]) => parseFloat(season.totalLiquidityUSD);
const formatValue = (value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const StatProps = {
  title: 'Liquidity',
  gap: 0.25,
  color: 'primary',
  sx: { ml: 0 },
};
const queryConfig = {
  variables: { season_gt: 6073 },
  context: { subgraph: 'bean' }
};

const Liquidity: React.FC<{ height?: SeasonPlotBaseProps['height'] }> = ({ height }) => {
  const season = useSeason();
  return (
    <SeasonPlot
      document={SeasonalLiquidityDocument}
      height={height}
      defaultSeason={season?.gt(0) ? season.toNumber() : 0}
      getValue={getValue}
      formatValue={formatValue}
      StatProps={StatProps}
      queryConfig={queryConfig}
    />
  );
};

export default Liquidity;

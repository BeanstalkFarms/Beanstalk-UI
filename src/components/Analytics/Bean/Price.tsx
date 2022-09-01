import BigNumber from 'bignumber.js';
import React from 'react';
import SeasonPlot, {
  SeasonPlotBaseProps,
} from '~/components/Common/Charts/SeasonPlot';
import { Season, SeasonalPriceDocument } from '~/generated/graphql';
import usePrice from '~/hooks/beanstalk/usePrice';
import useSeason from '~/hooks/beanstalk/useSeason';

const getValue = (season: Season) => parseFloat(season.price);
const formatValue = (value: number) => `$${value.toFixed(4)}`;
const StatProps = {
  title: 'Bean Price',
  titleTooltip: 'The price at the end of every Season/day.',
  gap: 0.25,
};
const LineChartProps = {
  isTWAP: true,
};

const Price: React.FC<{ height?: SeasonPlotBaseProps['height'] }> = ({
  height,
}) => {
  const price = usePrice();
  const season = useSeason();
  return (
    <SeasonPlot
      document={SeasonalPriceDocument}
      height={height}
      defaultValue={price?.gt(0) ? price.dp(4, BigNumber.ROUND_FLOOR).toNumber() : 0} // FIXME: partial dup of `displayBeanPrice`
      defaultSeason={season?.gt(0) ? season.toNumber() : 0}
      getValue={getValue}
      formatValue={formatValue}
      StatProps={StatProps}
      LineChartProps={LineChartProps}
    />
  );
};

export default Price;

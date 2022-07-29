import React from 'react';
import SeasonPlot, {
  SeasonPlotBaseProps,
} from 'components/Common/Charts/SeasonPlot';
import { Season, SeasonalTwapDocument } from 'generated/graphql';
import usePrice from 'hooks/usePrice';
import useSeason from 'hooks/useSeason';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const getValue = (season: Season) => parseFloat(season.twap);
const formatValue = (value: number) => `$${value.toFixed(4)}`;

const LineChartProps = {
  isTWAP: true,
};

const useStatProps = () => {
  const theme = useTheme();
  const isTiny = useMediaQuery(theme.breakpoints.down('md'));
  return {
    title: isTiny ? 'TWAP' : 'Time Weighted Avg. Price',
    // titleIcon: <TokenIcon token={BEAN[SupportedChainId.MAINNET]} />,
    gap: 0.25,
    color: 'primary',
    sx: { ml: 0 },
  };
};

const TWAP: React.FC<{ height?: SeasonPlotBaseProps['height'] }> = ({
  height,
}) => {
  const price = usePrice();
  const season = useSeason();
  const StatProps = useStatProps();

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

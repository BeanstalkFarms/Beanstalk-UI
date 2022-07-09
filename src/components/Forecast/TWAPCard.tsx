import React from 'react';
import { CardProps, Card } from '@mui/material';
import SeasonPlot from 'components/Common/Charts/SeasonPlot';
import { Season } from 'generated/graphql';
import TokenIcon from 'components/Common/TokenIcon';
import { BEAN } from 'constants/tokens';
import { SupportedChainId } from 'constants/index';
import usePrice from 'hooks/usePrice';
import useSeason from 'hooks/useSeason';

const getValue = (season: Season) => parseFloat(season.twap);
const formatValue = (value: number) => `$${value.toFixed(4)}`;
const StatProps = {
  title: "Time Weighted Average Price",
  titleIcon: <TokenIcon token={BEAN[SupportedChainId.MAINNET]} />,
  gap: 0.5,
  color: "primary",
};
const LineChartProps = {
  isTWAP: true,
}

const TWAPCard: React.FC<CardProps> = ({ sx, ...props }) => {
  const price  = usePrice();
  const season = useSeason();
  return (
    <Card sx={{ width: '100%', ...sx }} {...props}>
      <SeasonPlot
        defaultValue={price?.gt(0) ? price.toNumber() : 0}
        defaultSeason={season?.gt(0) ? season.toNumber() : 0}
        getValue={getValue}
        formatValue={formatValue}
        StatProps={StatProps}
        LineChartProps={LineChartProps}
      />
    </Card>
  );
};

export default TWAPCard;

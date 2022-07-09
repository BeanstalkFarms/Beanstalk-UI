import React from 'react';
import { CardProps, Card } from '@mui/material';
import SeasonPlot from 'components/Common/Charts/SeasonPlot';
import { Season, SeasonalPodRateDocument } from 'generated/graphql';
import useSeason from 'hooks/useSeason';
import usePodRate from 'hooks/usePodRate';
import LineChart from 'components/Common/Charts/LineChart';

const getValue = (season: Season) => parseFloat(season.field.podRate);
const formatValue = (value: number) => `${value.toFixed(2)}%`
const StatProps = {
  title: "Pod Rate",
  gap: 0.5,
};
const LineChartProps = {
  curve: 'natural' as const,
}

const PodRateCard: React.FC<CardProps> = ({ sx, ...props }) => {
  const podRate = usePodRate();
  const season = useSeason();
  return (
    <Card sx={{ width: '100%', ...sx }} {...props}>
      <SeasonPlot
        document={SeasonalPodRateDocument}
        defaultValue={podRate?.gt(0) ? podRate.toNumber() : 0}
        defaultSeason={season?.gt(0) ? season.toNumber() : 0}
        getValue={getValue}
        formatValue={formatValue}
        StatProps={StatProps}
        LineChartProps={LineChartProps}
      />
    </Card>
  );
};

export default PodRateCard;

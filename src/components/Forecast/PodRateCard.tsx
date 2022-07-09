import React from 'react';
import { CardProps, Card } from '@mui/material';
import SeasonPlot from 'components/Common/Charts/SeasonPlot';
import { Season } from 'generated/graphql';
import useSeason from 'hooks/useSeason';
import usePodRate from 'hooks/usePodRate';

const getValue = (season: Season) => parseFloat(season.field.podRate);
const StatProps = {
  title: "Pod Rate",
  gap: 0.5,
};

const PodRateCard: React.FC<CardProps> = ({ sx, ...props }) => {
  const podRate = usePodRate();
  const season = useSeason();
  return (
    <Card sx={{ width: '100%', ...sx }} {...props}>
      <SeasonPlot
        defaultValue={podRate?.gt(0) ? podRate.toNumber() : 0}
        defaultSeason={season?.gt(0) ? season.toNumber() : 0}
        getValue={getValue}
        StatProps={StatProps}
      />
    </Card>
  );
};

export default PodRateCard;

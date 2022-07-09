import React from 'react';
import { CardProps, Card } from '@mui/material';
import BigNumber from 'bignumber.js';
import SeasonPlot from 'components/Common/Charts/SeasonPlot';
import { Season } from 'generated/graphql';

export type TWAPCardProps = {
  beanPrice: BigNumber;
  season: BigNumber;
}

const getValue = (season: Season) => parseFloat(season.twap);

const TWAPCard: React.FC<TWAPCardProps & CardProps> = ({
  beanPrice,
  season,
  sx
}) => {
  return (
    <Card sx={{ width: '100%', ...sx }}>
      <SeasonPlot
        defaultValue={beanPrice?.gt(0) ? beanPrice.toNumber() : 0}
        defaultSeason={season?.gt(0) ? season.toNumber() : 0}
        getValue={getValue}
      />
    </Card>
  );
};

export default TWAPCard;

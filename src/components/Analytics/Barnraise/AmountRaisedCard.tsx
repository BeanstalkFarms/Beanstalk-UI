import { Card, LinearProgress, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React from 'react';
import { displayBN } from '../../../util';
import { BeanstalkPalette } from '../../App/muiTheme';
import Stat from '../../Common/Stat';

export type AmountRaisedProps = {
  totalRaised: BigNumber;
};

const AmountRaisedCard: React.FC<AmountRaisedProps> = ({
  children,
  totalRaised,
}) => {
  const startingAmount = new BigNumber(77000000);
  const percentageRaised = totalRaised.div(startingAmount).multipliedBy(100);
  return (
    <Card sx={{ p: 2 }}>
      <Stack gap={1.3}>
        <Stack direction="row" justifyContent="space-between" alignItems="end">
          <Stat
            title="Total Recapitalization (Amount raised)"
            amount={`${displayBN(percentageRaised)}%`}
          />
          <Typography variant="h1">
            ${displayBN(totalRaised)}/${displayBN(startingAmount)}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={12}
          sx={{
            height: '45px',
            borderRadius: '25px',
            // background: '#f5fff6',
            background: 'transparent',
            border: 2,
            borderColor: BeanstalkPalette.logoGreen,
          }}
        />
      </Stack>
    </Card>
  );
};

export default AmountRaisedCard;

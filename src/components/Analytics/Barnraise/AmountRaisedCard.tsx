import React from 'react';
import { Stack, Typography, LinearProgress, Card } from '@mui/material';
import BigNumber from 'bignumber.js';
import Stat from '../../Common/Stat';
import { displayBN } from '../../../util';

const AmountRaisedCard: React.FC<{}> =
  ({ children }) => (
    <Card sx={{ p: 2 }}>
      <Stack gap={1.3}>
        <Stack direction="row" justifyContent="space-between" alignItems="end">
          <Stat
            title="Total Recapitalization (Amount raised)"
            amount={`${displayBN(new BigNumber(10000000))}`}
            />
          <Typography variant="h1">
            $0/$77,000,000
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={12}
          sx={{
              height: '40px',
              borderRadius: '25px'
            }}
          />
      </Stack>
    </Card>
    );

export default AmountRaisedCard;

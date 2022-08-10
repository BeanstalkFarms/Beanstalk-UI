import React from 'react';
import { Card, CardProps, Grid, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import Stat from '~/components/Common/Stat';
import TokenIcon from '~/components/Common/TokenIcon';
import { displayFullBN } from '~/util';
import { Token } from '~/classes';

export type StatItem = {
  title: string;
  tooltip: string;
  token?: Token;
  amount: BigNumber;
  amountModifier?: BigNumber;
}

const StatsCard: React.FC<{
  stats: StatItem[];
} & CardProps> = ({ stats }, props) => (
  <Card sx={{ p: 1 }} {...props}>
    <Grid container spacing={1} rowSpacing={3}>
      {stats.map((stat) => (
        <Grid item xs={12} md={3}>
          <Stat
            title={stat.title}
            titleTooltip={stat.tooltip}
            amountIcon={stat.token && <TokenIcon token={stat.token} />}
            amount={(
              <>
                {displayFullBN(stat.amount, stat.token ? stat.token.displayDecimals : 2)}
                {stat.amountModifier !== undefined && (
                  <Typography
                    color="primary"
                    variant="h4">+ {displayFullBN(stat.amountModifier, stat.token ? stat.token.displayDecimals : 2)}
                  </Typography>
                )}
              </>
            )}
            variant="h4"
            gap={0}
          />
        </Grid>
      ))}
    </Grid>
  </Card>
);

export default StatsCard;

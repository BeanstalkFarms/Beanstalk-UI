import React from 'react';
import { Card, CardProps } from '@mui/material';
import Soon from 'components/Analytics/Soon';
import Stat from '../Common/Stat';
import { TokenMap } from '../../constants';
import { displayUSD } from '../../util';
import { BeanstalkSiloBalance } from '../../state/beanstalk/silo';
import useBeanstalkSiloBreakdown from '../../hooks/useBeanstalkSiloBreakdown';

export type LiquidityOverviewProps = {
  balances: TokenMap<BeanstalkSiloBalance>;
}

const LiquidityOverTime: React.FC<LiquidityOverviewProps & CardProps> = ({
  balances,
  sx
}) => {
  const breakdown = useBeanstalkSiloBreakdown();

  return (
    <Card sx={{ p: 2, width: '100%', ...sx }}>
      <Stat
        title="Total Bean Liquidity"
        amount={displayUSD(breakdown.totalValue.abs())}
        amountIcon={undefined}
        gap={0.25}
        sx={{ ml: 0 }}
      />
      {/* <LiquidityBalances
        balances={balances}
      /> */}
      <Soon />
    </Card>
  );
};

export default LiquidityOverTime;

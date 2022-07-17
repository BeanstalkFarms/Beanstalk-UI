import React from 'react';
import { CardProps, Card } from '@mui/material';
import Stat from '../Common/Stat';
import { displayUSD } from '../../util';
import SiloBalances from '../Common/SiloBalances';
import useWhitelist from '../../hooks/useWhitelist';
import useBeanstalkSiloBreakdown from '../../hooks/useBeanstalkSiloBreakdown';

const LiquidityByState: React.FC<CardProps> = ({ sx }) => {
  const breakdown = useBeanstalkSiloBreakdown();
  const whitelist = useWhitelist();

  return (
    <Card sx={{ p: 2, width: '100%', ...sx }}>
      <Stat
        title="Total Value"
        amount={displayUSD(breakdown.totalValue.abs())}
        amountIcon={undefined}
        gap={0}
      />
      <SiloBalances breakdown={breakdown} whitelist={whitelist} />
    </Card>
  );
};

export default LiquidityByState;

import React from 'react';
import { Box, Card, CardProps } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from '~/state';
import Fiat from '~/components/Common/Fiat';
import Stat from '../Common/Stat';
import { TokenMap, ZERO_BN } from '../../constants';
import { BeanstalkSiloBalance } from '../../state/beanstalk/silo';
import LiquidityBalances from './LiquidityBalances';

export type LiquidityOverviewProps = {
  balances: TokenMap<BeanstalkSiloBalance>;
}

const LiquidityOverTime: React.FC<LiquidityOverviewProps & CardProps> = ({
  balances,
  sx
}) => {
  // const breakdown = useBeanstalkSiloBreakdown();
  const beanPools = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);
  const liquidity = Object.values(beanPools).reduce((prev, curr) => prev.plus(curr.liquidity), ZERO_BN);

  return (
    <Card sx={{ width: '100%', ...sx }}>
      <Box sx={{ p: 2 }}>
        <Stat
          title="Total Liquidity"
          amount={<Fiat value={liquidity} amount={liquidity} />}
          amountIcon={undefined}
          gap={0.25}
          sx={{ ml: 0 }}
        />
      </Box>
      <Box sx={{ position: 'relative' }}>
        {/* <BlurComponent blur={10} opacity={0.7} sx={{ borderRadius: 1 }}> */}
        {/*  <Typography variant="body1" color="gray">Historical liquidity will be available soon.</Typography> */}
        {/* </BlurComponent> */}
        <LiquidityBalances
          balances={balances}
        />
      </Box>
    </Card>
  );
};

export default LiquidityOverTime;

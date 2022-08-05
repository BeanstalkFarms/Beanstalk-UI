import React from 'react';
import { Box, Card, CardProps } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from '~/state';
import Fiat from '~/components/Common/Fiat';
import BlurComponent from '~/components/Common/ZeroState/BlurComponent';
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
    <Card sx={{ p: 2, width: '100%', ...sx }}>
      <Stat
        title="Total Liquidity"
        amount={<Fiat value={liquidity} amount={liquidity} />}
        amountIcon={undefined}
        gap={0.25}
        sx={{ ml: 0 }}
      />
      <Box sx={{ position: 'relative ' }}>
        <BlurComponent blur={10} opacity={0.7}>
          Historical liquidity will be available soon.
        </BlurComponent>
        <LiquidityBalances
          balances={balances}
        />
      </Box>
    </Card>
  );
};

export default LiquidityOverTime;

import React, { useCallback, useEffect, useState } from 'react';
import { Stack, Typography, CardProps, Box, Card, Divider, Tabs, Tab } from '@mui/material';
import BigNumber from 'bignumber.js';
import Stat from '../Common/Stat';
import TokenIcon from '../Common/TokenIcon';
import { BEAN } from '../../constants/tokens';
import { SupportedChainId, TokenMap } from '../../constants';
import { displayBN, displayFullBN } from '../../util';
import TimeTabs from '../TimeTabs';
import SimpleLineChart, { DataPoint } from '../Charts/SimpleLineChart';
import { mockPodRateData, mockTWAPData } from '../Charts/SimpleLineChart.mock';
import { BeanstalkPalette } from '../App/muiTheme';
import LiquidityBalances from './LiquidityBalances';
import SiloBalances from '../Common/SiloBalances';
import { useGeneralizedWhitelist } from '../../hooks/useWhitelist';
import { Beanstalk } from '../../constants/generated';
import { BeanstalkSiloBalance } from '../../state/beanstalk/silo';
import useBeanstalkSiloBreakdown from '../../hooks/useBeanstalkSiloBreakdown';

export type LiquidityOverviewProps = {
  balances: TokenMap<BeanstalkSiloBalance>;
}

const LiquidityOverview: React.FC<LiquidityOverviewProps & CardProps> =
  ({
     children,
     balances,
     sx
   }) => {
    const [tab, setTab] = useState(0);
    const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
      setTab(newValue);
    };
    const breakdown = useBeanstalkSiloBreakdown();

    return (
      <Card sx={{ p: 2, width: '100%', ...sx }}>
        <Tabs value={tab} onChange={handleChangeTab}>
          <Tab label="Liquidity Over Time" />
          <Tab label="Liquidity By State" />
        </Tabs>
        <Stat
          title="Total Beanstalk Liquidity"
          amount={`$${displayFullBN(breakdown.totalValue.abs(), 2)}`}
          icon={undefined}
        />
        <Box sx={{ display: tab === 0 ? 'block' : 'none' }}>
          <LiquidityBalances balances={balances} />
        </Box>
        <Box sx={{ display: tab === 1 ? 'block' : 'none' }}>
          <SiloBalances breakdown={breakdown} whitelist={useGeneralizedWhitelist()} />
        </Box>
      </Card>
    );
  };

export default LiquidityOverview;

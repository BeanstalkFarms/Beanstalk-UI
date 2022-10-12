import { Typography } from '@mui/material';
import React, { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { Module, ModuleContent, ModuleHeader } from '~/components/Common/Module';
import BalancesOverTime from '~/components/Balances/BalancesOverTime';
import useAccount from '~/hooks/ledger/useAccount';
import useFarmerSiloOverview from '~/hooks/farmer/useFarmerSiloOverview';
import useFarmerBalancesBreakdown from '~/hooks/farmer/useFarmerBalancesBreakdown';
import useSeason from '~/hooks/beanstalk/useSeason';
import Stat from '~/components/Common/Stat';
import { displayUSD } from '~/util';

const depositStats = (s: BigNumber, v: BigNumber[]) => (
  <Stat
    title="Value Deposited"
    titleTooltip={(
      <>
        Shows the historical value of your Silo Deposits. <br />
        <Typography variant="bodySmall">
          Note: Unripe assets are valued based on the current Chop Rate. Earned Beans are shown upon Plant.
        </Typography>
      </>
    )}
    subtitle={`Season ${s.toString()}`}
    amount={displayUSD(v[0])}
    color="primary"
    amountIcon={undefined}
    gap={0.25}
    sx={{ ml: 0 }}
  />
);

const UserBalancesCharts : React.FC<{}> = () => {
  //
  const account = useAccount();
  const { data, loading } = useFarmerSiloOverview(account);
  const breakdown     = useFarmerBalancesBreakdown();
  const season        = useSeason();
  
  return (
    <Module>
      <ModuleHeader>
        <Typography variant="h4">Deposited Balance</Typography>
      </ModuleHeader>
      <ModuleContent px={2} pb={2}>
        <BalancesOverTime
          label="Silo Deposits"
          account={account}
          current={useMemo(() => ([
            breakdown.states.deposited.value
          ]), [breakdown.states.deposited.value])}
          series={useMemo(() => ([
            data.deposits
          ]), [data.deposits])}
          season={season}
          stats={depositStats}
          loading={loading}
          empty={breakdown.states.deposited.value.eq(0)}
        />
      </ModuleContent>
    </Module>
  );
};

export default UserBalancesCharts;

import { Typography } from '@mui/material';
import React from 'react';
import BigNumber from 'bignumber.js';
import { Module, ModuleContent, ModuleHeader } from '~/components/Common/Module';
import useAccount from '~/hooks/ledger/useAccount';
import useFarmerBalancesBreakdown from '~/hooks/farmer/useFarmerBalancesBreakdown';
import useSeason from '~/hooks/beanstalk/useSeason';
import Stat from '~/components/Common/Stat';
import { displayUSD } from '~/util';
import useFarmerBalancesOverview from '~/hooks/farmer/useFarmerBalancesOverview';
import { BaseDataPoint } from '~/components/Common/Charts/ChartPropProvider';
import useTimeTabState from '~/hooks/app/useTimeTabState';

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
  const timeTabParams = useTimeTabState();
  const { data, loading } = useFarmerBalancesOverview(account);
  const breakdown     = useFarmerBalancesBreakdown();
  const season        = useSeason();

  const formatValue = (value: number) =>
  `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

  const getStatValue = <T extends BaseDataPoint>(v?: T[]) => {
    if (!v?.length) return 0;
    const dataPoint = v[0];
    return dataPoint?.value || 0;
  };
  
  return (
    <Module>
      <ModuleHeader>
        <Typography variant="h4">Deposited Balance</Typography>
      </ModuleHeader>
      <ModuleContent px={2} pb={2}>
        {/* <BaseSeasonPlot */}
        {/*  queryData={queryParams} */}
        {/*  height={300} */}
        {/*  StatProps={{ */}
        {/*    title: 'Total Deposited Bean & Bean3Crv', */}
        {/*    gap: 0.5, */}
        {/*  }} */}
        {/*  timeTabParams={timeTabParams} */}
        {/*  formatValue={formatValue} */}
        {/*  stackedArea */}
        {/*  ChartProps={{ */}
        {/*    getDisplayValue: getStatValue, */}
        {/*    tooltip: true, */}
        {/*  }} */}
        {/* /> */}
        {/* <BalancesOverTime */}
        {/*  label="Silo Deposits" */}
        {/*  account={account} */}
        {/*  current={useMemo(() => ([ */}
        {/*    breakdown.states.deposited.value */}
        {/*  ]), [breakdown.states.deposited.value])} */}
        {/*  series={useMemo(() => ([ */}
        {/*    data.deposits */}
        {/*  ]), [data.deposits]) as DataPoint[][]} */}
        {/*  season={season} */}
        {/*  stats={depositStats} */}
        {/*  loading={loading} */}
        {/*  empty={breakdown.states.deposited.value.eq(0)} */}
        {/* /> */}
      </ModuleContent>
    </Module>
  );
};

export default UserBalancesCharts;

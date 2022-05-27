/* eslint-disable */
import React from 'react';
import BalanceGrid from "./Modules/BalanceGrid";

export interface BeanstalkBalancesProps {
  title: string;
}

const BeanstalkBalances: React.FC<BeanstalkBalancesProps> = ({title}) => {
  return (
    <BalanceGrid
      // titles
      totalBalanceTitle={"Total Beanstalk Liquidity"}
      stalkCardTitle={"Total Outstanding Stalk"}
      seedCardTitle={"Total Outstanding Seeds"}
      podCardTitle={"Total Outstanding Pods"}
      fertilizerCardTitle={"Total Available Fertilizer"}
      // switches
      hideRewardsCard
      hidePodCardButton
    />
  );
};

export default BeanstalkBalances;

/* eslint-disable */
import React from 'react';
import BalanceGrid from "./Modules/BalanceGrid";

export interface BeanstalkBalancesProps {
  title: string;
}

const BeanstalkBalances: React.FC<BeanstalkBalancesProps> = ({title}) => {
  return (
    <BalanceGrid
      totalBalanceTitle={"Total Beanstalk Liquidity"}
      hideRewardsCard
    />
  );
};

export default BeanstalkBalances;

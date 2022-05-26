/* eslint-disable */
import React from 'react';
import BalanceGrid from "./Modules/BalanceGrid";

export interface UserBalancesProps {
  title: string;
}

const UserBalances: React.FC<UserBalancesProps> = ({title}) => {
  return (
    <BalanceGrid
      // titles
      totalBalanceTitle={"My Total Balance"}
      stalkCardTitle={"My Stalk"}
      seedCardTitle={"My Seeds"}
      podCardTitle={"My Pods"}
      fertilizerCardTitle={"My Fertilizer"}
    />
  );
};

export default UserBalances;

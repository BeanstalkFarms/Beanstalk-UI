/* eslint-disable */
import React from 'react';
import BalanceGrid from "./Modules/BalanceGrid";

export interface UserBalancesProps {
  title: string;
}

const UserBalances: React.FC<UserBalancesProps> = ({title}) => {
  return (
    <BalanceGrid
      totalBalanceTitle={"My Total Balance"}
    />
  );
};

export default UserBalances;

import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import BigNumber from 'bignumber.js';
import Deposits from './Deposits';
import { Deposit, FarmerSiloBalance, Withdrawal } from '../../../state/v2/farmer/silo';
import { BEAN_ETH_UNISWAP_V2_LP } from '../../../constants/tokens';
import { SupportedChainId } from '../../../constants/chains';

export default {
  component: Deposits,
  args: {}
} as ComponentMeta<typeof Deposits>;

const deposit: Deposit = {
  season: new BigNumber(100),
  amount: new BigNumber(100),
  bdv: new BigNumber(100),
  stalk: new BigNumber(100),
  seeds: new BigNumber(100),
};

const deposit2: Deposit = {
  season: new BigNumber(345),
  amount: new BigNumber(345),
  bdv: new BigNumber(345),
  stalk: new BigNumber(345),
  seeds: new BigNumber(345),
};

const withdrawal: Withdrawal = {
  season: new BigNumber(698),
  amount: new BigNumber(760)
};

const withdrawal2: Withdrawal = {
  season: new BigNumber(345),
  amount: new BigNumber(753460)
};

const siloToken: FarmerSiloBalance = {
  circulating: new BigNumber(100), // The circulating balance in the Farmer's wallet.
  wrapped: new BigNumber(100), // The Farmer's wrapped balance.
  deposited: new BigNumber(100), //
  deposits: [deposit, deposit2],
  withdrawn: new BigNumber(100),
  withdrawals: [withdrawal, withdrawal2],
  claimable: new BigNumber(100)
};

const Template: ComponentStory<typeof Deposits> = (args: any) => (
  <Deposits token={BEAN_ETH_UNISWAP_V2_LP[SupportedChainId.MAINNET]} balance={siloToken} {...args} />
);

export const Default = Template.bind({});

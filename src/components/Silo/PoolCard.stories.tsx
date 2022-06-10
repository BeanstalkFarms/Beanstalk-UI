import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import BigNumber from 'bignumber.js';
import { BEAN_ETH_UNIV2_POOL_MAINNET } from 'constants/pools';
import { BeanPoolState } from 'state/v2/bean/pools';
import PoolCard from './PoolCard';

export default {
  component: PoolCard,
  args: {}
} as ComponentMeta<typeof PoolCard>;

const poolState: BeanPoolState = {
  price: new BigNumber(100),
  reserves: [new BigNumber(100), new BigNumber(100)],
  deltaB: new BigNumber(100000),
  liquidity: new BigNumber(123567),
  totalCrosses: new BigNumber(100),
  supply: new BigNumber(1234)
};

const Template: ComponentStory<typeof PoolCard> = (args: any) => (
  <PoolCard
    {...args}
    pool={BEAN_ETH_UNIV2_POOL_MAINNET}
    poolState={poolState}
  />
);

export const Default = Template.bind({});

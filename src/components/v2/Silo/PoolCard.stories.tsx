import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import PoolCard from './PoolCard';
import { BEAN_ETH_UNISWAP_V2_POOL_MAINNET } from '../../../constants/v2/pools';
import { BeanPoolState } from '../../../state/v2/bean/pools';
import BigNumber from 'bignumber.js';

export default {
  component: PoolCard,
  args: {}
} as ComponentMeta<typeof PoolCard>;

const pool: BeanPoolState = {
  price: new BigNumber(100),
  reserves: [new BigNumber(100), new BigNumber(100)],
  deltaB: new BigNumber(100000),
  liquidity: new BigNumber(123567),
  totalCrosses: new BigNumber(100)
};

const Template: ComponentStory<typeof PoolCard> = (args: any) => (
  <PoolCard
    {...args}
    address={BEAN_ETH_UNISWAP_V2_POOL_MAINNET.address}
    pool={pool}
  />
);

export const Default = Template.bind({});

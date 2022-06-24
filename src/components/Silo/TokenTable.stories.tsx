import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { SupportedChainId } from 'constants/chains';
import { BEAN, BEAN_ETH_UNIV2_LP } from 'constants/tokens';
import BigNumber from 'bignumber.js';
import TokenTable from './TokenTable';

export default {
  component: TokenTable,
  args: {}
} as ComponentMeta<typeof TokenTable>;

const Template: ComponentStory<typeof TokenTable> = (args: any) => (
  <TokenTable
    {...args}
    config={{
      whitelist: [
        BEAN[SupportedChainId.MAINNET],
        BEAN_ETH_UNIV2_LP[SupportedChainId.MAINNET]
      ]
    }}
    farmerSilo={{
      balances: {
        [BEAN[SupportedChainId.MAINNET].address]: {
          // input fake data here
          deposited: new BigNumber(123_456_789)
        },
        [BEAN_ETH_UNIV2_LP[SupportedChainId.MAINNET].address]: {
          // input fake data here
          deposited: new BigNumber(0.0001)
        },
      }
    }}
  />
);

export const Main = Template.bind({});

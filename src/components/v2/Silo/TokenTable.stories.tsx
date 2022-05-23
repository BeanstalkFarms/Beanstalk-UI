import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import TokenTable from './TokenTable';
import { SupportedChainId } from 'constants/chains';
import { BEAN, BEAN_ETH_UNISWAP_V2_LP } from 'constants/v2/tokens';
import BigNumber from 'bignumber.js';

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
        BEAN_ETH_UNISWAP_V2_LP[SupportedChainId.MAINNET]
      ]
    }}
    data={{
      tokens: {
        [BEAN[SupportedChainId.MAINNET].address]: {
          // input fake data here
          deposited: new BigNumber(100_000)
        },
        [BEAN_ETH_UNISWAP_V2_LP[SupportedChainId.MAINNET].address]: {
          // input fake data here
          deposited: new BigNumber(0.0001)
        },
      }
    }}
  />
);

export const Default = Template.bind({});

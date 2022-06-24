import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { initialFarmerSilo } from 'state/farmer/silo/reducer';
import { initialBeanstalkSilo } from 'state/beanstalk/silo/reducer';

import BigNumber from 'bignumber.js';
import OverviewCard from './OverviewCard';

export default {
  component: OverviewCard,
} as ComponentMeta<typeof OverviewCard>;

const n = new BigNumber(60_740);
const s = {
  value: n,
  byToken: {}
};

const Template: ComponentStory<typeof OverviewCard> = (args: any) => (
  <OverviewCard
    farmerSilo={initialFarmerSilo}
    beanstalkSilo={initialBeanstalkSilo}
    breakdown={{
      totalValue: n,
      states: {
        circulating: s,
        wrapped: s,
        claimable: s,
        deposited: s,
        withdrawn: s,
      }
    }}
    season={new BigNumber(6074)}
  />
);

export const Main = Template.bind({});

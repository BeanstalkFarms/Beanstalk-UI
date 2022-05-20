import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import RewardsBar from './RewardsBar';

export default {
  component: RewardsBar,
  args: {}
} as ComponentMeta<typeof RewardsBar>;

const Template: ComponentStory<typeof RewardsBar> = (args: any) => (
  <RewardsBar {...args} />
  );

export const Default = Template.bind({});

import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import OverviewCard from './OverviewCard';

export default {
  component: OverviewCard,
  args: {}
} as ComponentMeta<typeof OverviewCard>;

const Template: ComponentStory<typeof OverviewCard> = (args: any) => (
  <OverviewCard {...args} />
  );

export const Default = Template.bind({});

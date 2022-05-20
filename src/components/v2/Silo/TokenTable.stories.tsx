import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import TokenTable from './TokenTable';

export default {
  component: TokenTable,
  args: {}
} as ComponentMeta<typeof TokenTable>;

const Template: ComponentStory<typeof TokenTable> = (args: any) => (
  <TokenTable {...args} />
  );

export const Default = Template.bind({});

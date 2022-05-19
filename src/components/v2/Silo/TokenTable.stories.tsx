import React from "react";
import { Button } from "@mui/material";
import { ComponentMeta, ComponentStory } from '@storybook/react';
import TokenTable from "./TokenTable";

export default {
  component: TokenTable,
  args: {}
} as ComponentMeta<typeof TokenTable>;

const Template: ComponentStory<typeof TokenTable> = (args: any) => {
  return (
    <TokenTable {...args} />
  )
};

export const Default = Template.bind({})
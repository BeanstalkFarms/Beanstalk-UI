import React from "react";
import { Button } from "@mui/material";
import { ComponentMeta, ComponentStory } from '@storybook/react';
import RewardsBar from "./RewardsBar";

export default {
  component: RewardsBar,
  args: {}
} as ComponentMeta<typeof RewardsBar>;

const Template: ComponentStory<typeof RewardsBar> = (args: any) => {
  return (
    <RewardsBar {...args} />
  )
};

export const Default = Template.bind({})
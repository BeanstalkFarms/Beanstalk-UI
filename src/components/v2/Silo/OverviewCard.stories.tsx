import React from "react";
import { Button } from "@mui/material";
import { ComponentMeta, ComponentStory } from '@storybook/react';
import OverviewCard from "./OverviewCard";

export default {
  component: OverviewCard,
  args: {}
} as ComponentMeta<typeof OverviewCard>;

const Template: ComponentStory<typeof OverviewCard> = (args: any) => {
  return (
    <OverviewCard {...args} />
  )
};

export const Default = Template.bind({})
import React from "react";
import { Box, Button } from "@mui/material";
import { ComponentMeta, ComponentStory } from '@storybook/react';
import NavBar from "./NavBar";
import { BeanstalkPalette } from "components/App/muiTheme";

export default {
  component: NavBar,
  args: {},
  parameters: {
    layout: 'fullscreen'
  }
} as ComponentMeta<typeof NavBar>;

const Template: ComponentStory<typeof NavBar> = (args: any) => {
  return (
    <Box sx={{ backgroundColor: BeanstalkPalette.lightBlue, minHeight: 200 }}>
      <NavBar {...args} />
    </Box>
  )
};

export const Default = Template.bind({})
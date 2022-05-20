import React from 'react';
import { Box } from '@mui/material';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { BeanstalkPalette } from 'components/App/muiTheme';
import NavBar from './NavBar';

export default {
  component: NavBar,
  args: {},
  parameters: {
    layout: 'fullscreen'
  }
} as ComponentMeta<typeof NavBar>;

const Template: ComponentStory<typeof NavBar> = (args: any) => (
  <Box sx={{ backgroundColor: BeanstalkPalette.lightBlue, minHeight: 200 }}>
    <NavBar {...args} />
  </Box>
  );

export const Default = Template.bind({});

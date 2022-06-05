import React from 'react';
import { Button, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { ComponentMeta, ComponentStory } from '@storybook/react';

export default {
  argTypes: {},
  args: {}
} as ComponentMeta<typeof Button>;

const variants = [
  ['h1', null],
  ['h2', null],
  ['h3', null],
  ['h4', null],
  ['h5', null],
  ['h6', null],
  ['subtitle1', null],
  ['subtitle2', null],
  ['body1', null],
  ['body2', null],
];
const Template: ComponentStory<typeof Button> = (args) => (
  <Box sx={{ width: 800 }}>
    {variants.map(([v, t]) => <Typography key={v} variant={v}>{t || v}</Typography>)}
  </Box>
);

export const Primary = Template.bind({});

Primary.args = {};
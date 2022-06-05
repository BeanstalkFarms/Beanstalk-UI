import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { ComponentMeta, ComponentStory } from '@storybook/react';

export default {
  component: Card,
  args: {
  }
} as ComponentMeta<typeof Card>;

const Template: ComponentStory<typeof Card> = (args: any) => (
  <Box sx={{ backgroundColor: '#f5f5f5', p: 4 }}>
    <Card {...args}>
      <CardContent>
        <Typography>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
        </Typography>
      </CardContent>
    </Card>
  </Box>
  );

export const Primary = Template.bind({});
Primary.args = {};

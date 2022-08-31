import { Chip, Stack, styled, Tab, TabProps } from '@mui/material';
import React from 'react';
import { Token } from 'graphql';

export const ChipLabel : React.FC<{ name: string; token?: Token }> = ({ name, children }) => (
  <Stack direction="row" alignItems="center" gap={0.2}>
    {name}&nbsp;
    <Chip label={children} size="small" />
  </Stack>
); 

export const StyledTab = styled((props: TabProps) => (
  <Tab {...props} />
))(() => ({
  root: {
    opacity: 1,
  },
  '&:hover': {
    cursor: 'pointer'
  },
  '& .MuiChip-label': {
    opacity: 0.7
  },
  '&.Mui-selected .MuiChip-root': {
    // backgroundColor: BeanstalkPalette.lightGrey
  },
  '&:hover .MuiChip-label, &.Mui-selected .MuiChip-label': {
    opacity: 1,
  },
  '& .MuiChip-root:hover': {
    cursor: 'pointer'
  }
}));

import { Chip, styled, Tab, TabProps } from '@mui/material';
import React from 'react';
import { Token } from 'graphql';
import Row from '~/components/Common/Row';

export const ChipLabel : React.FC<{ name: string; token?: Token }> = ({ name, children }) => (
  <Row gap={0.2}>
    {name}&nbsp;
    <Chip label={children} size="small" />
  </Row>
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

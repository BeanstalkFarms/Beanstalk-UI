import { Stack } from '@mui/material';
import { useAtomValue } from 'jotai';
import React from 'react';
import { marketBottomTabsAtom } from './info/atom-context';

const PodsChart: React.FC<{}> = () => {
  const openState = useAtomValue(marketBottomTabsAtom);

  return (
    <Stack
      sx={{
        maxHeight: openState === 2 ? '0%' : '100%',
        overflow: 'hidden',
        transition: 'max-height 200ms ease-in',
        height: '100%',
      }}
    >
      <Stack width="100%" height="100%" sx={{ backgroundColor: 'green' }}>
        podsChart
      </Stack>
    </Stack>
  );
};

export default PodsChart;

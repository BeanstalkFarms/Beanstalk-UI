import React from 'react';
import {  Box, Stack } from '@mui/material';
import useNavHeight from '~/hooks/app/usePageDimensions';
import { FC } from '~/types';
import PodsMarketInfo from './marketInfo';

const SECTION_MAX_WIDTH = 300;

const FullPageWrapper: FC<{}> = ({ children }) =>  {
  const navHeight = useNavHeight();

  return (
    <Box sx={{ position: 'absolute', bottom: 0, width: '100vw', height: `calc(100vh -${navHeight}px)` }}>
      <Box sx={{ height: '100%', width: '100%', p: 1 }}>
        {children}
      </Box>
    </Box>
);
};
const PodsMarketNew = () => (
  <FullPageWrapper>
    <Stack width="100%">
      <Stack width="100%">
        <PodsMarketInfo />
      </Stack>
      <Stack maxWidth={SECTION_MAX_WIDTH} width="100%" sx={{ backgroundColor: 'red' }} height="100%">
        sup
      </Stack>
    </Stack>
  </FullPageWrapper>
  );

export default PodsMarketNew;

import React from 'react';
import { Container, Stack } from '@mui/material';
import BeanCharts from '../../components/Analytics/Bean/BeanCharts';

const BeanAnalytics: React.FC<{}> = () => (
  <Container maxWidth="lg">
    <Stack gap={2}>
      <BeanCharts />
    </Stack>
  </Container>
  );

export default BeanAnalytics;

import React from 'react';
import { Container, Stack } from '@mui/material';
import FieldCharts from '../../components/Analytics/Field/FieldCharts';

const FieldAnalytics: React.FC<{}> = () => (
  <Container maxWidth="lg">
    <Stack gap={2}>
      <FieldCharts />
    </Stack>
  </Container>
  );

export default FieldAnalytics;

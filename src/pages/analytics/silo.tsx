import React from 'react';
import { Container, Stack } from '@mui/material';
import RipeAssetCharts from '../../components/Analytics/Silo/RipeAssetCharts';
import UnripeAssetCharts from '../../components/Analytics/Silo/UnripeAssetCharts';

const SiloAnalytics: React.FC<{}> = () => (
  <Container maxWidth="lg">
    <Stack gap={2}>
      <RipeAssetCharts />
      <UnripeAssetCharts />
    </Stack>
  </Container>
  );

export default SiloAnalytics;

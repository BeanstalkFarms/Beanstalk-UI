import { Container, Stack } from '@mui/material';
import BeanAnalytics from 'components/Analytics/Bean';
import FieldAnalytics from 'components/Analytics/Field';
import SiloAnalytics from 'components/Analytics/Silo';

import PageHeader from 'components/Common/PageHeader';
import React from 'react';

const AnalyticsPage: React.FC<{}> = () => (
  <Container maxWidth="lg">
    <Stack gap={2}>
      <PageHeader
        title="Analytics"
        description="View historical data on Beanstalk"
      />
      <BeanAnalytics />
      <SiloAnalytics />
      <FieldAnalytics />
    </Stack>
  </Container>
);

export default AnalyticsPage;

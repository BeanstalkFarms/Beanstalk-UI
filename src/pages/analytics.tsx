import { Container, Stack } from '@mui/material';
import React from 'react';
import BeanAnalytics from '~/components/Analytics/Bean';
import FieldAnalytics from '~/components/Analytics/Field';
import SiloAnalytics from '~/components/Analytics/Silo';
import PageHeader from '~/components/Common/PageHeader';

import { FC } from '~/types';
import BeanVs3Crv from '~/components/Analytics/Silo/BeanVs3Crv';

const AnalyticsPage: FC<{}> = () => (
  <Container maxWidth="lg">
    <Stack gap={2}>
      <PageHeader
        title="Analytics"
        description="View historical data on Beanstalk"
      />
      <BeanAnalytics />
      <SiloAnalytics />
      <FieldAnalytics />
      <BeanVs3Crv />
    </Stack>
  </Container>
);

export default AnalyticsPage;

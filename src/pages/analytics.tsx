import { Container, Stack } from '@mui/material';
import {
  BeanAnalytics,
  FieldAnalytics,
  SiloAnalytics,
} from 'components/Analytics';
import ComingSoonCard from 'components/Common/ComingSoonCard';
import PageHeader from 'components/Common/PageHeader';
import { SupportedChainId } from 'constants/index';
import useChainId from 'hooks/useChain';
import React from 'react';

const AnalyticsPage: React.FC<{}> = () => {
  const chainId = useChainId();

  if (chainId === SupportedChainId.MAINNET) {
    return (
      <Container maxWidth="lg">
        <ComingSoonCard title="Barn Raise Analytics" />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader
          title="Analytics"
          description="View historical performance of Beanstalk"
        />
        <BeanAnalytics />
        <SiloAnalytics />
        <FieldAnalytics />
        {/* <BarnraiseAnalytics /> */}
      </Stack>
    </Container>
  );
};
export default AnalyticsPage;

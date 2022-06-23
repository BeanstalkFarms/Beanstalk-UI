import React from 'react';
import { Container, Stack } from '@mui/material';
import FieldCharts from 'components/Analytics/Field/FieldCharts';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/index';
import ComingSoonCard from 'components/Common/ComingSoonCard';

const FieldAnalytics: React.FC<{}> = () => {
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
        <FieldCharts />
      </Stack>
    </Container>
  );
};

export default FieldAnalytics;

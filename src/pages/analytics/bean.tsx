import React from 'react';
import { Container, Stack } from '@mui/material';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/index';
import ComingSoonCard from 'components/Common/ComingSoonCard';
import BeanCharts from '../../components/Analytics/Bean/BeanCharts';

const BeanAnalytics: React.FC<{}> = () => {
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
        <BeanCharts />
      </Stack>
    </Container>
  );
};

export default BeanAnalytics;

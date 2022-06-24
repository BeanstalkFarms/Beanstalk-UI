import React from 'react';
import { Container, Stack } from '@mui/material';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/index';
import ComingSoonCard from 'components/Common/ComingSoonCard';
import RipeAssetCharts from 'components/Analytics/Silo/RipeAssetCharts';
import UnripeAssetCharts from 'components/Analytics/Silo/UnripeAssetCharts';

const SiloAnalytics: React.FC<{}> = () => {
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
        <RipeAssetCharts />
        <UnripeAssetCharts />
      </Stack>
    </Container>
  );
};

export default SiloAnalytics;

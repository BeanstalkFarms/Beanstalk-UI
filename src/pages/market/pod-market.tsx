import React from 'react';
import { Box, Card, Container, Stack, Typography } from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import MarketPlots from 'components/Market/MarketPlots';
import ComingSoonCard from 'components/Common/ComingSoonCard';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from '../../constants';
import CreateButtons from '../../components/Market/CreateButtons';

const PodMarketPage: React.FC = () => {
  const chainId = useChainId();

  let content;
  if (chainId === SupportedChainId.MAINNET) {
    content = <ComingSoonCard title="Pod Market" />;
  } else {
    content = (
      <>
        <Card sx={{ p: 2 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height={300}
          >
            <Typography variant="h2">insert graph</Typography>
          </Box>
        </Card>
        <MarketPlots />
      </>
    );
  }

  return (
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <PageHeader
          title="The Pod Market"
          description="Trade Pods, the Beanstalk-native debt asset"
          control={<CreateButtons />}
        />
        {content}
      </Stack>
    </Container>
  );
};
export default PodMarketPage;

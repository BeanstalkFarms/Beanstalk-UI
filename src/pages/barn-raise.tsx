import React from 'react';
import { Container, Stack } from '@mui/material';
import PageHeader from 'components/v2/Common/PageHeader';
import PurchaseForm from 'components/v2/BarnRaise/PurchaseForm';
import RemainingFertilizer from 'components/v2/BarnRaise/RemainingFertilizer';
import MyFertilizer from 'components/v2/BarnRaise/MyFertilizer';

const BarnRaisePage: React.FC = () => (
  <Container maxWidth="md">
    <Stack gap={2}>
      <PageHeader
        title="The Barn Raise"
        purpose="Rebuilding Beanstalk"
        description="Earn yield through purchasing & activating Fertilizer, the Barn Raise token"
      />
      {/* Section 1: Fertilizer Remaining */}
      <RemainingFertilizer />
      {/* Section 2: Purchase Fertilizer */}
      <PurchaseForm />
      {/* Section 3: My Fertilizer */}
      <MyFertilizer />
    </Stack>
  </Container>
);

export default BarnRaisePage;

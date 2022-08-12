 import React from 'react';
import { Container, Stack } from '@mui/material';
import PageHeader from '~/components/Common/PageHeader';
import RemainingFertilizer from '~/components/Barn/RemainingFertilizer';
import MyFertilizer from '~/components/Barn/MyFertilizer';
import BarnActions from '~/components/Barn/Actions';

const Barn: React.FC = () => (
  <Container maxWidth="sm">
    <Stack gap={2}>
      <PageHeader
        title="The Barn"
        description="Earn yield and recapitalize Beanstalk by buying Fertilizer"
        href="https://docs.bean.money/farm/barn"
      />
      {/* Section 1: Fertilizer Remaining */}
      <RemainingFertilizer />
      {/* Section 2: Purchase Fertilizer */}
      <BarnActions />
      {/* Section 3: My Fertilizer */}
      <MyFertilizer />
    </Stack>
  </Container>
);

export default Barn;

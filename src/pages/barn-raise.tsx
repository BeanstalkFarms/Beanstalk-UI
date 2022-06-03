import React, { useState } from 'react';
import { Box, Button, Container, Stack } from '@mui/material';
import PageHeader from 'components/v2/Common/PageHeader';
import PurchaseForm from 'components/v2/BarnRaise/PurchaseForm';
import RemainingFertilizer from 'components/v2/BarnRaise/RemainingFertilizer';
import MyFertilizer from 'components/v2/BarnRaise/MyFertilizer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WelcomeBackModal from '../components/v2/Common/WelcomeBackModal';

const BarnRaisePage: React.FC = () => (
  <Container maxWidth="md">
    <Stack gap={2}>
      <PageHeader
        title={<><strong>The Barn Raise</strong><Box component="span" sx={{ display: { md: 'inline', xs: 'none' } }}>: Fertilizing Beanstalk</Box></>}
        description="Earn yield through purchasing & activating Fertilizer"
        control={(
          <Button
            href="https://bean.money/blog/path-forward"
            target="_blank"
            rel="noreferrer"
            color="light"
            variant="contained"
            endIcon={<ArrowForwardIcon sx={{ transform: 'rotate(-45deg)' }} />}
          >
            Learn more
          </Button>
        )}
      />
      <WelcomeBackModal />
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

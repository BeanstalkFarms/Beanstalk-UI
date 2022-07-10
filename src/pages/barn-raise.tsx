import React from 'react';
import { Button, Container, Stack } from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import PurchaseForm from 'components/BarnRaise/PurchaseForm';
import RemainingFertilizer from 'components/BarnRaise/RemainingFertilizer';
import MyFertilizer from 'components/BarnRaise/MyFertilizer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const BarnRaisePage: React.FC = () => (
  <Container maxWidth="md">
    <Stack gap={2}>
      <PageHeader
        title={<><strong>The Barn: The Recapitalization Facility</strong></>}
        description="Earn yield and recapitalize Beanstalk by buying Fertilizer"
        control={(
          <Stack direction="row" gap={1}>
            <Button
              href="https://dune.com/tbiq/beanstalk-barn-raise"
              target="_blank"
              rel="noreferrer"
              color="light"
              variant="contained"
              endIcon={<ArrowForwardIcon sx={{ transform: 'rotate(-45deg)' }} />}
            >
              Analytics
            </Button>
            <Button
              href="https://bean.money/blog/how-to-purchase-fertilizer"
              target="_blank"
              rel="noreferrer"
              color="light"
              variant="contained"
              endIcon={<ArrowForwardIcon sx={{ transform: 'rotate(-45deg)' }} />}
            >
              Guide
            </Button>
          </Stack>
        )}
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

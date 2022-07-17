import React from 'react';
import {
  Box,
  Card,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import { useParams } from 'react-router-dom';
import BuyNow from '../../components/Market/Actions/BuyNow';
import PlotListingDetails from '../../components/Market/Cards/PlotListingDetails';
import { mockPodListingData } from '../../components/Market/Plots.mock';

const ListingPage: React.FC = () => {
  // index of plot
  const { id } = useParams<{ id: string }>();

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <PageHeader
          returnPath="/market"
        />
        <PlotListingDetails podListing={mockPodListingData[0]} harvestableIndex={mockPodListingData[0].index} />
        <Card sx={{ position: 'relative' }}>
          <Stack gap={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ overflow: 'visible', px: 2, pt: 2 }}>
              <Typography variant="h4">Buy Pods from Pod Listing</Typography>
            </Stack>
            <Box sx={{ px: 1, pb: 1 }}>
              <BuyNow podListing={mockPodListingData[0]} />
            </Box>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

export default ListingPage;

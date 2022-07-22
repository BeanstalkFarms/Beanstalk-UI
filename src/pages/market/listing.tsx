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
import FillListing from '../../components/Market/Actions/FillListing';
import PlotListingDetails from '../../components/Market/Cards/PlotListingDetails';
import { mockPodListingData } from '../../components/Market/Plots.mock';
import AddressIcon from '../../components/Common/AddressIcon';
import { getAccount } from '../../util';

const ListingPage: React.FC = () => {
  // index of plot
  // eslint-disable-next-line
  const { id } = useParams<{ id: string }>();

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <PageHeader
          returnPath="/market"
          title={(
            <Stack direction="row" gap={0.5} alignItems="center">
              <AddressIcon address={mockPodListingData[0].account} />
              <Typography variant="h2">{`${getAccount(mockPodListingData[0].account).substring(0, 7)}...'s Pod Listing`}</Typography>
            </Stack>
          )}
        />
        <PlotListingDetails podListing={mockPodListingData[0]} harvestableIndex={mockPodListingData[0].index} />
        <Card sx={{ position: 'relative' }}>
          <Stack gap={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ overflow: 'visible', px: 2, pt: 2 }}>
              <Typography variant="h4">Buy Pods from Pod Listing</Typography>
            </Stack>
            <Box sx={{ px: 1, pb: 1 }}>
              <FillListing podListing={mockPodListingData[0]} />
            </Box>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

export default ListingPage;

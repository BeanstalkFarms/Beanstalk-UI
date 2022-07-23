import React from 'react';
import {
  Box,
  Card,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { usePodListingQuery } from 'generated/graphql';
import { castPodListing } from 'state/farmer/market';
import { trimAddress } from 'util/index';
import FillListing from 'components/Market/Actions/FillListing';
import ListingDetails from 'components/Market/Cards/ListingDetails';
import { mockPodListingData } from 'components/Market/Plots.mock';
import AddressIcon from 'components/Common/AddressIcon';
import PageHeaderSecondary from 'components/Common/PageHeaderSecondary';
import useHarvestableIndex from 'hooks/redux/useHarvestableIndex';

const ListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = usePodListingQuery({ variables: { index: id } });
  const harvestableIndex = useHarvestableIndex();

  if (loading) return <div>Loading</div>;
  if (error) return <div>{error}</div>;
  if (!data?.podListings[0]) return <div>Not found</div>;

  const listing = castPodListing(data?.podListings[0]);

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <PageHeaderSecondary
          title={(
            <Stack direction="row" gap={0.5} alignItems="center">
              <AddressIcon address={mockPodListingData[0].account} />
              <Typography variant="h2">{`${trimAddress(listing.account)}'s Pod Listing`}</Typography>
            </Stack>
          )}
          returnPath="/market"
        />
        <ListingDetails
          podListing={listing}
          harvestableIndex={harvestableIndex}
        />
        <Card sx={{ position: 'relative' }}>
          <Stack gap={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ overflow: 'visible', px: 2, pt: 2 }}>
              <Typography variant="h4">
                Buy Pods from Pod Listing
              </Typography>
            </Stack>
            <Box sx={{ px: 1, pb: 1 }}>
              <FillListing
                podListing={listing}
              />
            </Box>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

export default ListingPage;

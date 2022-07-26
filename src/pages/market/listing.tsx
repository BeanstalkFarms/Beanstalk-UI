import React from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { Source, trimAddress } from 'util/index';
import FillListing from 'components/Market/Actions/FillListing';
import ListingDetails from 'components/Market/Cards/ListingDetails';
import AddressIcon from 'components/Common/AddressIcon';
import PageHeaderSecondary from 'components/Common/PageHeaderSecondary';
import useHarvestableIndex from 'hooks/redux/useHarvestableIndex';
import usePodListing from 'hooks/usePodListing';
import useAccount from 'hooks/ledger/useAccount';

const ListingPage: React.FC = () => {
  const account = useAccount();
  const { id } = useParams<{ id: string }>();
  const { data: listing, source, loading, error } = usePodListing(id);
  const harvestableIndex = useHarvestableIndex();

  if (loading) return <div>Loading</div>;
  if (error) return <div>{error}</div>;
  if (!listing) return <div>Not found</div>;

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <PageHeaderSecondary
          title={(
            <Stack direction="row" gap={0.5} alignItems="center">
              <AddressIcon address={listing.account} />
              <Typography variant="h2">{`${trimAddress(listing.account)}'s Pod Listing`}</Typography>
            </Stack>
          )}
          returnPath="/market"
        />
        {/* Details Card */}
        <ListingDetails
          podListing={listing}
          harvestableIndex={harvestableIndex}
        />
        {/* Buy Pods */}
        {account === listing.account ? (
          // <Card>
          <Button
            color="error"
            variant="contained"
            fullWidth
            >
            Cancel
          </Button>
          // </Card>
        ) : (
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
        )}
        <Box sx={{ }}>
          <Typography color="text.secondary">
            Data source: {source === Source.SUBGRAPH ? 'Subgraph' : 'RPC'}
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
};

export default ListingPage;

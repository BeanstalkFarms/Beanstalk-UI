import React from 'react';
import {
  Box,
  Card,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { Source } from 'util/index';
import FillListing from 'components/Market/Actions/FillListing';
import ListingDetails from 'components/Market/Cards/ListingDetails';
import PageHeaderSecondary from 'components/Common/PageHeaderSecondary';
import useHarvestableIndex from 'hooks/redux/useHarvestableIndex';
import usePodListing from 'hooks/usePodListing';
import useAccount from 'hooks/ledger/useAccount';
import CancelListing from 'components/Market/Actions/CancelListing';

const ListingPage: React.FC = () => {
  const account = useAccount();
  const { id } = useParams<{ id: string }>();
  const { data: _listing, source, loading, error } = usePodListing(id);
  const harvestableIndex = useHarvestableIndex();

  if (loading) return <div>Loading</div>;
  if (error) return <div>{error}</div>;
  if (!_listing) return <div>Not found</div>;

  /// TEMP: override order for testing
  // const testListing : PodListing = {
  //   id: '',          // index with no decimals
  //   index: '',       // index with decimals
  //   account: '',
  //   maxHarvestableIndex: new BigNumber(''),
  //   pricePerPod:     new BigNumber(''),
  //   amount:          new BigNumber(''),
  //   totalAmount:     new BigNumber(''),
  //   remainingAmount: new BigNumber(''),
  //   filledAmount: new BigNumber('0'),
  //   mode: FarmToMode.EXTERNAL,
  //   status: 'active'
  // };
  const listing = _listing;

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <PageHeaderSecondary
          title={(
            <Stack direction="row" gap={0.5} alignItems="center">
              <Typography variant="h2">
                Listing #{listing.id}
                {/* {`${trimAddress(listing.account)}'s Pod Listing`} */}
              </Typography>
            </Stack>
          )}
          returnPath="/market"
        />
        {/* Details Card */}
        <Card sx={{ p: 1 }}>
          <Box sx={{ p: 1 }}>
            <ListingDetails
              podListing={listing}
              harvestableIndex={harvestableIndex}
            />
          </Box>
          {account === listing.account ? (
            <Box>
              <Divider
                color="secondary"
                sx={{ mt: 1, mb: 1, borderWidth: 0, borderTopWidth: 1 }}
              />
              <CancelListing
                id={listing.id}
              />
            </Box>
          ) : null}
        </Card>
        {/* Buy Pods */}
        {account === listing.account ? null : (
          <Card sx={{ position: 'relative' }}>
            <Stack gap={1.5} sx={{ p: 1 }}>
              <Box sx={{ pt: 1, px: 1 }}>
                <Typography variant="h4">Fill</Typography>
              </Box>
              <Box>
                <FillListing
                  podListing={listing}
                />
              </Box>
            </Stack>
          </Card>
        )}
        <Box sx={{ }}>
          <Typography color="text.secondary" textAlign="right">
            Data source: {source === Source.SUBGRAPH ? 'Subgraph' : 'RPC'}
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
};

export default ListingPage;

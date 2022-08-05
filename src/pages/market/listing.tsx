import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { bigNumberResult, Source } from 'util/index';
import FillListing from 'components/Market/Actions/FillListing';
import ListingDetails from 'components/Market/Cards/ListingDetails';
import PageHeaderSecondary from 'components/Common/PageHeaderSecondary';
import useHarvestableIndex from 'hooks/redux/useHarvestableIndex';
import usePodListing from 'hooks/usePodListing';
import useAccount from 'hooks/ledger/useAccount';
import CancelListing from 'components/Market/Actions/CancelListing';
import { useBeanstalkContract } from 'hooks/useContract';
import { BeanstalkReplanted } from 'generated';
import GenericZero from 'components/Common/ZeroState/GenericZero';

const ListingPage: React.FC = () => {
  const account = useAccount();
  const { id } = useParams<{ id: string }>();
  const { data: _listing, source, loading, error } = usePodListing(id);
  const harvestableIndex = useHarvestableIndex();
  const beanstalk = useBeanstalkContract() as unknown as BeanstalkReplanted;

  const [listingValid, setListingValid] = useState<null | boolean>(null);
  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const listing = await beanstalk.podListing(id.toString()).then(bigNumberResult);
          console.debug('[pages/listing] listing = ', listing);
          setListingValid(listing?.gt(0));
        } catch (e) {
          console.error(e);
          setListingValid(false);
        }
      })();
    }
  }, [beanstalk, id]);

  if (loading) {
    return (
      <GenericZero loading />
    );
  }
  if (error) {
    return (
      <GenericZero title="Error">
        <Typography>{error.message.toString()}</Typography>
      </GenericZero>
    );
  }
  if (!_listing || !listingValid) {
    return (
      <GenericZero title="Not found">
        <Typography>Listing not found.</Typography>
      </GenericZero>
    );
  }
  
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

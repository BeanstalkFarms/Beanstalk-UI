import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Stack, Typography } from '@mui/material';
import usePodListing from '~/hooks/beanstalk/usePodListing';
import FillListingForm from '~/components/Market/PodsV2/Actions/Buy/FillListingForm';
import { bigNumberResult } from '~/util';
import { useBeanstalkContract } from '~/hooks/ledger/useContract';

const FillListing: React.FC<{}> = () => {
  const { listingID } = useParams<{ listingID: string }>();
  const { data: listing, loading, error } = usePodListing(listingID);
  const beanstalk = useBeanstalkContract();
  
  /// Verify that this listing is still live via the contract.
  const [listingValid, setListingValid] = useState<null | boolean>(null);
  useEffect(() => {
    if (listingID) {
      (async () => {
        try {
          const _listing = await beanstalk.podListing(listingID.toString()).then(bigNumberResult);
          console.debug('[pages/listing] listing = ', _listing);
          setListingValid(_listing?.gt(0));
        } catch (e) {
          console.error(e);
          setListingValid(false);
        }
      })();
    }
  }, [beanstalk, listingID]);

  /// Loading isn't complete until listingValid is set
  if (loading || listingValid === null) {
    return (
      <Stack height={200} alignItems="center" justifyContent="center">
        <CircularProgress color="primary" />
      </Stack>
    );
  }
  if (error) {
    return (
      <Stack height={200} alignItems="center" justifyContent="center">
        <Typography>{error.message.toString()}</Typography>
      </Stack>
    );
  }
  if (!listing || !listingValid) {
    return (
      <Stack height={200} alignItems="center" justifyContent="center">
        <Typography>Listing not found.</Typography>
      </Stack>
    );
  }

  return (
    <FillListingForm podListing={listing} />
  );
};

export default FillListing;

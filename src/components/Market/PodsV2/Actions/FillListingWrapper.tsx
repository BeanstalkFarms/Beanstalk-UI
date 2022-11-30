import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import usePodListing from '~/hooks/beanstalk/usePodListing';
import FillListingV2 from '~/components/Market/PodsV2/Actions/FillListingV2';
import GenericZero from '~/components/Common/ZeroState/GenericZero';
import { bigNumberResult } from '~/util';
import { useBeanstalkContract } from '~/hooks/ledger/useContract';

const FillListingWrapper: React.FC<{}> = () => {
  const { listingID } = useParams<{ listingID: string }>();
  const { data: listing, source, loading, error } = usePodListing(listingID);
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
  if (!listing || !listingValid) {
    return (
      <GenericZero title="Not found">
        <Typography>Listing not found.</Typography>
      </GenericZero>
    );
  }

  return (
    <FillListingV2 podListing={listing} />
  );
};

export default FillListingWrapper;

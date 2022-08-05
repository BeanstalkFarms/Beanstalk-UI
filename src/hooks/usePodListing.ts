import { useMemo } from 'react';
import { usePodListingQuery } from '~/generated/graphql';
import { Source } from '~/util';
import { castPodListing } from '~/state/farmer/market';
import useFarmerListings from './redux/useFarmerListings';

const usePodListing = (index: string | undefined) => {
  const farmerListings = useFarmerListings();
  const query          = usePodListingQuery({ variables: { index: index || '' }, skip: !index });
  const [data, source] = useMemo(() => {
    if (index && query.data?.podListings?.[0]) {
      return [castPodListing(query.data.podListings[0]), Source.SUBGRAPH];
    }
    if (index && farmerListings[index]) {
      return [farmerListings[index], Source.LOCAL];
    }
    return [undefined, undefined];
  }, [farmerListings, index, query.data?.podListings]);
  
  return {
    ...query,
    /// If the query finished loading and has no data,
    /// check redux for a local order that was loaded
    /// via direct event processing.
    data,
    source,
  };
};

export default usePodListing;

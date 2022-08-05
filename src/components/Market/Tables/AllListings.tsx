import React, { useCallback, useMemo } from 'react';
import { DataGridProps, GridRowParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import COLUMNS from '~/components/Common/Table/cells';
import { useAllPodListingsQuery } from '~/generated/graphql';
import useHarvestableIndex from '~/hooks/redux/useHarvestableIndex';
import { castPodListing, PodListing } from '~/state/farmer/market';
import { toStringBaseUnitBN } from '~/util';
import { BEAN } from '~/constants/tokens';
import MarketBaseTable from './Base';

const AllListings : React.FC<{}> = () => {
  /// Data
  const harvestableIndex  = useHarvestableIndex();
  const { data, loading } = useAllPodListingsQuery({
    variables: {
      first: 1000,
      maxHarvestableIndex: toStringBaseUnitBN(harvestableIndex, BEAN[1].decimals),
    }
  });
  const rows : PodListing[] = useMemo(() => {
    if (loading || !data?.podListings) return [];
    return data.podListings.map<PodListing>(castPodListing);
  }, [data?.podListings, loading]);

  /// Navigation
  const navigate = useNavigate();
  const handleClick = useCallback((params: GridRowParams) => {
    navigate(`/market/listing/${params.row.id.toString()}`);
  }, [navigate]);

  /// Data Grid setup
  const columns: DataGridProps['columns'] = [
    COLUMNS.listingId,
    // index
    COLUMNS.plotIndex(harvestableIndex),
    // pricePerPod
    COLUMNS.pricePerPod,
    // amount
    COLUMNS.numPodsActive,
    // maxHarvestableIndex
    COLUMNS.expiry(harvestableIndex),
    // other
    COLUMNS.rightChevron
  ];
  
  return (
    <MarketBaseTable
      columns={columns}
      rows={rows}
      loading={loading}
      maxRows={8}
      onRowClick={handleClick}
      getRowId={(row : PodListing) => `${row.account}-${row.id}`}
    />
  );
};

export default AllListings;

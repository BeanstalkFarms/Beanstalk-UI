import React, { useCallback, useMemo } from 'react';
import { DataGridProps, GridRowParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import COLUMNS from '~/components/Common/Table/cells';
import { castPodListing, PodListing } from '~/state/farmer/market';
import { toStringBaseUnitBN } from '~/util/index';
import { BEAN } from '~/constants/tokens';
import { useAllPodListingsQuery } from '~/generated/graphql';
import useHarvestableIndex from '~/hooks/beanstalk/useHarvestableIndex';
import MarketBaseTable from './Base';

const AllListings : React.FC<{}> = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  /// Data
  const harvestableIndex  = useHarvestableIndex();
  const { data, loading } = useAllPodListingsQuery({
    variables: {
      first: 1000,
      maxHarvestableIndex: toStringBaseUnitBN(harvestableIndex, BEAN[1].decimals),
    },
    fetchPolicy: 'cache-and-network',
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
  const columns: DataGridProps['columns'] = !isMobile
    ? [
      COLUMNS.listingId(1.3),
      // index
      COLUMNS.plotIndex(harvestableIndex, 1),
      // pricePerPod
      COLUMNS.pricePerPod(1),
      // amount
      COLUMNS.numPodsActive(1),
      // maxHarvestableIndex
      COLUMNS.expiry(harvestableIndex, 1),
      // other
      COLUMNS.rightChevron
    ]
    : [
      COLUMNS.listingId(0.7),
      // index
      COLUMNS.plotIndex(harvestableIndex, 1),
      // pricePerPod
      COLUMNS.pricePerPod(1),
      // amount
      COLUMNS.numPodsActive(1),
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

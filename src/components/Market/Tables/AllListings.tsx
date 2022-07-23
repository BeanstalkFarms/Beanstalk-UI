import React, { useCallback, useMemo } from 'react';
import { DataGridProps, GridRowParams } from '@mui/x-data-grid';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { useNavigate } from 'react-router-dom';
import COLUMNS from 'components/Common/Table/cells';
import { castPodListing, PodListing } from 'state/farmer/market';
import { toStringBaseUnitBN } from 'util/index';
import { BEAN } from 'constants/tokens';
import { useAllPodListingsQuery } from 'generated/graphql';
import MarketBaseTable from './Base';

const AllListings : React.FC<{}> = () => {
  /// Data
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>((state) => state._beanstalk.field);
  const { data, loading } = useAllPodListingsQuery({
    variables: {
      first: 1000,
      maxHarvestableIndex: toStringBaseUnitBN(beanstalkField.harvestableIndex, BEAN[1].decimals),
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
    // index
    COLUMNS.placeInLine(beanstalkField.harvestableIndex, {
      field: 'index',
      range: false
    }),
    // pricePerPod
    COLUMNS.pricePerPod,
    // amount
    COLUMNS.numPods,
    // maxHarvestableIndex
    COLUMNS.expiry(beanstalkField.harvestableIndex),
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

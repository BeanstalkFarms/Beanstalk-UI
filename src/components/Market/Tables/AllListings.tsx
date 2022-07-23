import React, { useCallback, useMemo } from 'react';
import { DataGridProps, GridRowParams } from '@mui/x-data-grid';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { useNavigate } from 'react-router-dom';
import COLUMNS from 'components/Common/Table/cells';
import { useAllListingsQuery } from 'generated/graphql';
import { PodListing } from 'state/farmer/market';
import { toTokenUnitsBN } from 'util/index';
import { BEAN } from 'constants/tokens';
import { ZERO_BN } from 'constants/index';
import MarketBaseTable from './MarketBaseTable';

const AllListings : React.FC<{}> = () => {
  /// Data
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>((state) => state._beanstalk.field);
  const listings       = useSelector<AppState, AppState['_farmer']['market']['listings']>((state) => state._farmer.market.listings);
  // const rows           = useMemo(() => Object.values(listings),   [listings]);
  const { data, loading } = useAllListingsQuery({ variables: { first: 1000 } });
  const rows : PodListing[] = useMemo(() => {
    if (loading || !data?.podListings) return [];
    return data.podListings.map<PodListing>((listing) => {
      const [account, id] = listing.id.split('-');
      const amount = toTokenUnitsBN(listing.totalAmount,   BEAN[1].decimals);
      const filled = toTokenUnitsBN(listing.filledAmount,  BEAN[1].decimals);
      return {
        id,
        account,
        index:        toTokenUnitsBN(id, BEAN[1].decimals),
        totalAmount:  amount,
        filledAmount: filled,
        remainingAmount: amount.minus(filled),
        maxHarvestableIndex: toTokenUnitsBN(listing.maxHarvestableIndex, BEAN[1].decimals),
        pricePerPod:  toTokenUnitsBN(listing.pricePerPod, BEAN[1].decimals),
        start:        ZERO_BN,
        status:       listing.status as 'active' | 'filled',
        toWallet:     false,
      };
    });
  }, [data?.podListings, loading]);

  /// Navigation
  const navigate = useNavigate();
  const handleClick = useCallback((params: GridRowParams) => {
    navigate(`/market/listing/${params.row.id}`);
  }, [navigate]);

  /// Data Grid setup
  const columns: DataGridProps['columns'] = [
    // status
    COLUMNS.status(beanstalkField.harvestableIndex),
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
    />
  );
};

export default AllListings;

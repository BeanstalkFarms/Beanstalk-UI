// import React, { useCallback, useMemo } from 'react';
// import { DataGridProps, GridRowParams } from '@mui/x-data-grid';
// import { useNavigate } from 'react-router-dom';
// import COLUMNS from 'components/Common/Table/cells';
// import { castPodOrder, PodOrder } from 'state/farmer/market';
// import { useAllPodOrdersQuery } from 'generated/graphql';
// import useHarvestableIndex from 'hooks/redux/useHarvestableIndex';
// import MarketBaseTable from './MarketBaseTable';

// const AllListings : React.FC<{}> = () => {
//   /// Data
//   const harvestableIndex = useHarvestableIndex();
//   const { data, loading } = useAllPodOrdersQuery({
//     variables: { first: 1000, }
//   });
  
//   const rows : PodOrder[] = useMemo(() => {
//     if (loading || !data?.podListings) return [];
//     return data.podListings.map<PodOrder>(castPodOrder);
//   }, [data?.podListings, loading]);

//   /// Navigation
//   const navigate = useNavigate();
//   const handleClick = useCallback((params: GridRowParams) => {
//     navigate(`/market/order/${params.row.id.toString()}`);
//   }, [navigate]);

//   /// Data Grid setup
//   const columns: DataGridProps['columns'] = [
//     COLUMNS.placeInLine(harvestableIndex, { range: true }),
//     COLUMNS.pricePerPod,
//     COLUMNS.numPods,
//   ];
  
//   return (
//     <MarketBaseTable
//       columns={columns}
//       rows={rows}
//       loading={loading}
//       maxRows={8}
//       onRowClick={handleClick}
//       getRowId={(row : PodOrder) => row.id} // pod order ids are unique by default
//     />
//   );
// };

// export default AllListings;

export default null;

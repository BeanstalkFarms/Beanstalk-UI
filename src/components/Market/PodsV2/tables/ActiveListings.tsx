import React, { useMemo } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { DataGridProps } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import useMarketData from '~/hooks/beanstalk/useMarketData';
import COLUMNS from './columns/market-columns';
import BaseTable from './BaseTable';
import { PodListing } from '~/state/farmer/market';

const ActiveListings: React.FC<{
  data: ReturnType<typeof useMarketData>;
}> = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const columns: DataGridProps['columns'] = useMemo(() => {
    const c = [
      COLUMNS.listingId(1, 'left'),
      // index
      COLUMNS.plotIndex(data.harvestableIndex, 1, 'left'),
      // pricePerPod
      COLUMNS.pricePerPod(1, 'left'),
      // amount
      COLUMNS.numPodsActive(0.7, 'left'),
    ];

    if (!isMobile) {
      // maxHarvestableIndex
      c.push(COLUMNS.expiry(data.harvestableIndex, 1, 'right'));
    }

    return c;
  }, [data.harvestableIndex, isMobile]);

  return (
    <BaseTable
      columns={columns}
      rows={data.listings || []}
      loading={data.loading}
      getRowId={(row: PodListing) => `${row.account}-${row.id}`}
      onRowClick={({ row }) => {
        navigate(`/market/buy/${row.id.toString()}`);
      }}
    />
  );
};

export default ActiveListings;

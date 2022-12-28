import React, { useMemo } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { DataGridProps } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import useMarketData from '~/hooks/beanstalk/useMarketData';
import MARKET_COLUMNS from './columns/market-columns';
import BaseTable from './BaseTable';
import { PodListing } from '~/state/farmer/market';
import { MARKET_ACTIVITY_COLUMNS } from '~/components/Market/PodsV2/Tables/columns/market-activity-columns';

const ActiveListings: React.FC<{
  data: ReturnType<typeof useMarketData>;
}> = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const columns: DataGridProps['columns'] = useMemo(() => {
    const c = [
      MARKET_ACTIVITY_COLUMNS.date(1, 'left', 'CREATED AT'),
      //
      MARKET_COLUMNS.listingId(1, 'left'),
      // index
      MARKET_COLUMNS.plotIndex(data.harvestableIndex, 1, 'left'),
      // pricePerPod
      MARKET_COLUMNS.pricePerPod(1, 'left'),
      // amount
      MARKET_COLUMNS.numPodsActive(0.7, 'left'),
    ];

    if (!isMobile) {
      // maxHarvestableIndex
      c.push(MARKET_COLUMNS.expiry(data.harvestableIndex, 1, 'right'));
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

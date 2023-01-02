import React, { useMemo, useState } from 'react';
import BaseTable from './BaseTable';
import { MARKET_ACTIVITY_COLUMNS } from './columns/market-activity-columns';
import { FarmerMarketHistoryItem } from '~/hooks/farmer/market/useFarmerMarket2';
import MarketItemDetailsDialog from '../Actions/MarketItemDetailsDialog';

const columns = [
  MARKET_ACTIVITY_COLUMNS.createdAt(1, 'left', 'DATE'),
  MARKET_ACTIVITY_COLUMNS.labelType(0.6),
  
  // PODS
  // Orders => total number of Pods Ordered at Order creation
  // Listings => total number of Pods Listed at Listing creation
  MARKET_ACTIVITY_COLUMNS.amountPods(1, 'left'), //
  
  //
  MARKET_ACTIVITY_COLUMNS.placeInLine(1, 'left'),
  MARKET_ACTIVITY_COLUMNS.pricePerPod(0.8),
  
  // TOTAL (Beans)
  // Orders => the total number of Beans put in the order at order creation
  // Listings => the total number of Beans that will be received if the listing is fully filled at this price
  MARKET_ACTIVITY_COLUMNS.amountBeans(1.3),

  // FILL %
  // Orders => pods sold / total pods ordered
  // Listings => pods sold / total pods listed
  MARKET_ACTIVITY_COLUMNS.fillPct(0.6),

  MARKET_ACTIVITY_COLUMNS.expiry(0.5),

  MARKET_ACTIVITY_COLUMNS.status(0.6, 'right'),
];

/**
 * Displays a table of a Farmer's outstanding Listings and Orders.
 */
const FarmerOrders: React.FC<{
  data: FarmerMarketHistoryItem[] | undefined;
  initializing: boolean;
}> = ({ data, initializing }) => {
  const [open, setOpen] = useState(false);
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [activeItem, setActiveItem] = useState<FarmerMarketHistoryItem | undefined>(undefined);

  const rows = useMemo(() => {
    if (!data || !data?.length) return [];
    return data;
  }, [data]);

  return (
    <>
      <BaseTable
        isUserTable
        rows={rows}
        columns={columns}
        loading={initializing}
        title="Orders and Listings"
        getRowId={(row) => row.id}
        onRowClick={({ row }) => {
          const item = rows.find((r) => r.id === row.id);
          item && setActiveItem(item);
          setOpen(true);
        }}
      />
      <MarketItemDetailsDialog
        item={activeItem}
        open={open}
        open2={showModeDialog}
        setOpen2={setShowModeDialog}
        setOpen={setOpen}
      />
    </>
  );
};

export default FarmerOrders;

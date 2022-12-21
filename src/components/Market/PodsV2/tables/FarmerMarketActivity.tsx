import React, { useMemo, useState } from 'react';
import MarketTable from './marketTable';
import { POD_MARKET_COLUMNS } from './columns/market-activity-columns';
import { FarmerMarketItem } from '~/hooks/farmer/market/useFarmerMarket';
import MarketItemDetailsDialog from '../Actions/MarketItemDetailsDialog';

const C = POD_MARKET_COLUMNS;
const columns = [
  C.date(1.5),
  C.action(0.9),
  C.type(0.9),
  C.priceType(1),
  C.pricePerPod(1),
  C.numPodsActive(1, 'left'),
  C.placeInLine(1, 'left'),
  C.expiry(1),
  C.fillPct(0.5),
  C.total(1),
  C.status(1, 'right'),
];

const FarmerMarketActivity: React.FC<{
  data: FarmerMarketItem[] | undefined;
  initializing: boolean;
}> = ({ data, initializing }) => {
  // LOCAL STATE
  const [open, setOpen] = useState(false);
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [activeItem, setActiveItem] = useState<FarmerMarketItem | undefined>(
    undefined
  );

  const rows = useMemo(() => {
    if (!data || !data?.length) return [];
    return data;
  }, [data]);

  return (
    <>
      <MarketTable
        columns={columns}
        rows={rows}
        loading={initializing}
        getRowId={(row) => row.id}
        isUserTable
        title="Orders and Listings"
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

export default FarmerMarketActivity;

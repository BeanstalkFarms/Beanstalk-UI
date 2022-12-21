import React, { useMemo, useState } from 'react';
import MarketTable from './marketTable';
import { POD_MARKET_COLUMNS } from './columns/market-activity-columns';
import useHarvestableIndex from '~/hooks/beanstalk/useHarvestableIndex';
import useFarmerMarket, {
  FarmerMarketItem,
} from '~/hooks/farmer/market/useFarmerMarket';
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

const FarmerMarketActivity: React.FC<{}> = () => {
  // LOCAL STATE
  const [open, setOpen] = useState(false);
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [activeItem, setActiveItem] = useState<FarmerMarketItem | undefined>(
    undefined
  );

  // DATA
  const { data: farmerMarket } = useFarmerMarket();

  // HELPERS
  const harvestableIndex = useHarvestableIndex();
  const isLoading = farmerMarket.length === 0 || harvestableIndex.lte(0);

  const rows = useMemo(
    () =>
      farmerMarket.map((d, i) => ({
        ...d,
        idx: i,
      })),
    [farmerMarket]
  );

  return (
    <>
      <MarketTable
        columns={columns}
        rows={rows}
        loading={isLoading}
        getRowId={(row) => row.idx}
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

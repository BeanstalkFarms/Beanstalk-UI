import React from 'react';
import { Box, Card, Tab, Tabs } from '@mui/material';
import { DataGridProps } from '@mui/x-data-grid';
import useTabs from '~/hooks/display/useTabs';
import ActivityTable, { POD_MARKET_COLUMNS } from './activityTable';
import { useFakePodMarketActivity } from './fake-data';
import { FontSize } from '~/components/App/muiTheme';

const COLS = POD_MARKET_COLUMNS;

const columns: DataGridProps['columns'] = [
  COLS.date(2),
  COLS.action(1),
  COLS.type(1),
  COLS.priceType(1),
  COLS.price(1),
  COLS.amount(1),
  COLS.placeInLine(1),
  COLS.expiry(1),
  COLS.fillPct(1),
  COLS.total(1),
  COLS.status(1)
];

const YourOrders = ({ rows }: {rows: any[]}) => (
  <ActivityTable 
    columns={columns}
    rows={rows}
    loading={false}
    getRowId={(row) => row.id}
  />
);

const MarketActivity = ({ rows }: {rows: any[]}) => (
  <ActivityTable 
    columns={columns}
    rows={rows}
    loading={false}
    getRowId={(row) => row.id}
  />
);

const tabsSx = { '& .MuiTab-root': { fontSize: `${FontSize.sm}!important` } };

const PodsMarketInfo: React.FC<{}> = () => {
  const [tab, setTab] = useTabs();
  const rows = useFakePodMarketActivity();
  
  return (
    <Card>
      <Box sx={{ p: 1.2 }}>
        <Tabs value={tab} onChange={setTab}>
          <Tab label="Your Orders" sx={tabsSx} />
          <Tab label="Market Activity" sx={tabsSx} />
        </Tabs>
      </Box>
      {tab === 0 && <YourOrders rows={rows} />}
      {tab === 1 && <MarketActivity rows={rows} />}

    </Card>
  );
};

export default PodsMarketInfo;

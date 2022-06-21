import React, { useState } from 'react';
import { Card, CardProps, Stack, Tab, Tabs, Typography, useMediaQuery } from '@mui/material';
import { DataGridProps } from '@mui/x-data-grid';
import BigNumber from 'bignumber.js';
import { useTheme } from '@mui/material/styles';
import BuySellTable from './Tables/BuySellTable';
import { displayBN, displayFullBN } from '../../util';

const buyColumns: DataGridProps['columns'] = [
  {
    field: 'amount',
    headerName: 'Number of Pods',
    flex: 1,
    disableColumnMenu: true,
    align: 'left',
    headerAlign: 'left',
    valueFormatter: (params) => `${displayFullBN(params.value as BigNumber, 2)}`,
    renderCell: (params) => <Typography>{displayBN(params.value)}</Typography>,
  },
  {
    field: 'placeInLine',
    headerName: 'Place In Line',
    flex: 1,
    disableColumnMenu: true,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params) => <Typography>{params.value}</Typography>,
  },
];

const buyRows = [
  {
    id: 0,
    amount: new BigNumber(634533),
    placeInLine: '0 - 100,000'
  },
  {
    id: 1,
    amount: new BigNumber(34533),
    placeInLine: '0 - 100,000'
  },
  {
    id: 2,
    amount: new BigNumber(34563456),
    placeInLine: '0 - 100,000'
  },
  {
    id: 3,
    amount: new BigNumber(34563456),
    placeInLine: '0 - 100,000'
  },
  {
    id: 4,
    amount: new BigNumber(34563456),
    placeInLine: '0 - 100,000'
  },
  {
    id: 5,
    amount: new BigNumber(34563456),
    placeInLine: '0 - 100,000'
  }
];

const MyOrdersCard: React.FC<CardProps> = ({ sx }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tab, setTab] = useState(0);
    const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
      setTab(newValue);
    };

  return (
    <Card sx={{ p: 2, width: isMobile ? '100%' : '30%', ...sx }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={handleChangeTab} sx={{ alignItems: 'center' }}>
          <Tab label="My Orders" />
          <Tab label="My Listings" />
        </Tabs>
      </Stack>
      {tab === 0 && <BuySellTable columns={buyColumns} rows={buyRows} hideHeader />}
      {/*{tab === 1 && <BuySellTable columns={sellColumns} rows={sellRows} />}*/}
    </Card>
  );
};

export default MyOrdersCard;

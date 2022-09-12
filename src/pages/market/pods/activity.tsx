import React from 'react';
import {
  Card,
  Container,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { DataGridProps } from '@mui/x-data-grid';
import BigNumber from 'bignumber.js';
import podIcon from '~/img/beanstalk/pod-icon.svg';
import beanIcon from '~/img/tokens/bean-logo-circled.svg';
import ActivityTable from '~/components/Market/Pods/Tables/Activity';
import { displayBN, displayFullBN } from '~/util';
import PageHeaderSecondary from '~/components/Common/PageHeaderSecondary';
import Row from '~/components/Common/Row';

const columns: DataGridProps['columns'] = [
  {
    field: 'event',
    headerName: 'Event',
    flex: 1,
    disableColumnMenu: true,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params) => <Typography><Link href="pages/market/marketplace">{params.value}</Link></Typography>,
  },
  {
    field: 'pods',
    headerName: 'Pods',
    flex: 1,
    disableColumnMenu: true,
    align: 'left',
    headerAlign: 'left',
    valueFormatter: (params) => `${displayFullBN(params.value as BigNumber, 2)}`,
    renderCell: (params) => (
      <Row gap={0.3}>
        <Typography>{displayBN(params.value)}</Typography>
        <img src={podIcon} alt="Pod Icon" height="18px" />
      </Row>
    ) ,
  },
  {
    field: 'podline',
    headerName: 'Podline',
    flex: 1,
    disableColumnMenu: true,
    align: 'left',
    headerAlign: 'left',
    valueFormatter: (params) => `${displayFullBN(params.value as BigNumber, 2)}`,
    renderCell: (params) => (
      <Typography>{displayBN(params.value)}</Typography>
    ),
  },
  {
    field: 'price',
    headerName: 'Price',
    flex: 1,
    disableColumnMenu: true,
    align: 'right',
    headerAlign: 'right',
    valueFormatter: (params) => `${displayFullBN(params.value as BigNumber, 2)}`,
    renderCell: (params) => (
      <Row gap={0.3}>
        <Typography>{displayBN(params.value)}</Typography>
        <img src={beanIcon} alt="Bean Icon" height="18px" />
      </Row>
    ),
  },
  {
    field: 'beans',
    headerName: 'Beans',
    flex: 1,
    disableColumnMenu: true,
    align: 'right',
    headerAlign: 'right',
    valueFormatter: (params) => `${displayFullBN(params.value as BigNumber, 2)}`,
    renderCell: (params) => (
      <Row gap={0.3}>
        <Typography>{displayBN(params.value)}</Typography>
        <img src={beanIcon} alt="Bean Icon" height="18px" />
      </Row>
    ),
  },
];

const rows = new Array(20).fill(null).map((_, i) => (
  {
    id: i,
    event: 'Sell to Order',
    pods: new BigNumber(10000000).multipliedBy(Math.random()),
    podline: new BigNumber(100000).multipliedBy(Math.random()),
    price: new BigNumber(1).multipliedBy(Math.random()),
    beans: new BigNumber(10000).multipliedBy(Math.random()),
  }
));

const MarketActivityPage: React.FC = () => (
  <Container maxWidth="lg">
    <Stack spacing={2}>
      <PageHeaderSecondary
        title="Marketplace Activity"
        />
      <Card>
        <ActivityTable columns={columns} rows={rows} />
      </Card>
    </Stack>
  </Container>
);

export default MarketActivityPage;
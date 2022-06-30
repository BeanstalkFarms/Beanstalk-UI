import React from 'react';
import {
  Box,
  Card,
  Container, Link,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import PageHeader from 'components/Common/PageHeader';

import { useTheme } from '@mui/material/styles';
import { DataGridProps } from '@mui/x-data-grid';
import BigNumber from 'bignumber.js';
import podIcon from 'img/beanstalk/pod-icon.svg';
import beanIcon from 'img/tokens/bean-logo-circled.svg';
import MarketPlots from 'components/Market/MarketPlots';
import MyPlots from 'components/Market/MyPlots';
import ActivityTable from 'components/Market/Tables/ActivityTable';
import { displayBN, displayFullBN } from 'util/index';
import ComingSoonCard from 'components/Common/ComingSoonCard';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/index';

const columns: DataGridProps['columns'] = [
  {
    field: 'event',
    headerName: 'Event',
    flex: 1,
    disableColumnMenu: true,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params) => <Typography><Link href="">{params.value}</Link></Typography>,
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
      <Stack direction="row" gap={0.3} alignItems="center">
        <Typography>{displayBN(params.value)}</Typography>
        <img src={podIcon} alt="Pod Icon" height="18px" />
      </Stack>
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
      <Stack direction="row" gap={0.3} alignItems="center">
        <Typography>{displayBN(params.value)}</Typography>
        <img src={beanIcon} alt="Bean Icon" height="18px" />
      </Stack>
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
      <Stack direction="row" gap={0.3} alignItems="center">
        <Typography>{displayBN(params.value)}</Typography>
        <img src={beanIcon} alt="Bean Icon" height="18px" />
      </Stack>
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

const MarketplacePage: React.FC = () => {
  const theme = useTheme();
  const chainId = useChainId();
  
  let content;
  if (chainId === SupportedChainId.MAINNET) {
    content = (
      <ComingSoonCard title="Pod Market" />
    );
  } else {
    content = (
      <>
        <Card sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="center" height={300}>
            <Typography variant="h2">insert graph</Typography>
          </Box>
        </Card>
        <MarketPlots />
        <MyPlots />
        <ActivityTable columns={columns} rows={rows} />
      </>
    );
  }

  return (
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <PageHeader
          title={
            <>
              <strong>The Pod Market</strong>
            </>
          }
          description="Trade Pods, the Beanstalk-native debt asset."
        />
        {content}
      </Stack>
    </Container>
  );
};
export default MarketplacePage;

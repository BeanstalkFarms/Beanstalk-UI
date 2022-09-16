import React from 'react';
import {
  Container,
  Stack, Tab, Tabs,
  Typography,
} from '@mui/material';
import { DataGridProps } from '@mui/x-data-grid';
import BigNumber from 'bignumber.js';
import podIcon from '~/img/beanstalk/pod-icon.svg';
import beanIcon from '~/img/tokens/bean-logo-circled.svg';
import ActivityTable from '~/components/Market/Pods/Tables/ActivityTable';
import { displayBN, displayFullBN } from '~/util';
import PageHeaderSecondary from '~/components/Common/PageHeaderSecondary';
import Row from '~/components/Common/Row';
import COLUMNS from '~/components/Common/Table/cells';
import useTabs from '~/hooks/display/useTabs';
import useMarketplaceEventData from '~/hooks/beanstalk/useMarketplaceEventData';

const MarketActivityPage: React.FC = () => {
  const [tab, handleChangeTab] = useTabs();
  
  const columns: DataGridProps['columns'] = [
    COLUMNS.label(
      2.5,
      <Tabs value={tab} onChange={handleChangeTab}>
        <Tab label="All" />
        <Tab label="Create" />
        <Tab label="Fill" />
        <Tab label="Cancel" />
      </Tabs>,
    ),
    {
      field: 'numPods',
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
      ),
    },
    {
      field: 'placeInPodline',
      headerName: 'Podline',
      flex: 1,
      disableColumnMenu: true,
      align: 'left',
      headerAlign: 'left',
      // valueFormatter: (params) => `${displayFullBN(params.value as BigNumber, 2)}`,
      renderCell: (params) => (
        <Typography>{params.value}</Typography>
      ),
    },
    {
      field: 'pricePerPod',
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
      field: 'totalValue',
      headerName: 'Total Value',
      flex: 1,
      disableColumnMenu: true,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => `${displayFullBN(params.value as BigNumber, 2)}`,
      renderCell: (params) => (
        <Row gap={0.3}>
          <Typography>{displayBN(params.value)}</Typography>
        </Row>
      ),
    },
  ];

  const { data } = useMarketplaceEventData();

  if (data === undefined) {
    return null;
  }
  
  return (
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <PageHeaderSecondary
          title="Marketplace Activity"
        />
        <ActivityTable columns={columns} rows={data.filter((e) => e.numPods !== undefined)} />
      </Stack>
    </Container>
  );
};

export default MarketActivityPage;

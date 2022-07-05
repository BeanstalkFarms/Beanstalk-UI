import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import BigNumber from 'bignumber.js';
import { DataGridProps } from '@mui/x-data-grid';
import { displayBN, displayFullBN } from 'util/index';
import FieldActions from 'components/Field/Actions';
import TableCard from 'components/Common/TableCard';
import FieldConditions from '../components/Field/FieldConditions';

const columns: DataGridProps['columns'] = [
  {
    field: 'placeInLine',
    headerName: 'Place In Line',
    flex: 1,
    valueFormatter: (params) =>
      `${displayFullBN(params.value as BigNumber, 0)}`,
    renderCell: (params) => (
      (params.value.eq(0))
        ? (<Typography color="primary">Harvestable</Typography>)
        : (<Typography>{displayBN(params.value)}</Typography>)
    )
  },
  {
    field: 'amount',
    headerName: 'Number of Pods',
    flex: 1,
    disableColumnMenu: true,
    align: 'left',
    headerAlign: 'left',
    valueFormatter: (params) =>
      `${displayFullBN(params.value as BigNumber, 2)}`,
    renderCell: (params) => <Typography>{displayBN(params.value, true)}</Typography>,
  },
];

const FieldPage: React.FC = () => {
  //
  // const [modalOpen, handleOpen, handleClose] = useToggle();

  // Data
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>(
    (state) => state._farmer.field
  );
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );
  // const podLine = beanstalkField?.podIndex.minus(beanstalkField.harvestableIndex);

  const rows: any[] = useMemo(() => {
    const data: any[] = [];
    if (farmerField.harvestablePods?.gt(0)) {
      data.push({
        id: farmerField.harvestablePods,
        placeInLine: new BigNumber(0),
        amount: farmerField.harvestablePods,
      });
    }
    if (Object.keys(farmerField.plots).length > 0) {
      data.push(
        ...Object.keys(farmerField.plots).map((index) => ({
          id: index,
          placeInLine: new BigNumber(index).minus(
            beanstalkField.harvestableIndex
          ),
          amount: new BigNumber(farmerField.plots[index]),
        }))
      );
    }
    return data;
  }, [beanstalkField.harvestableIndex, farmerField.plots, farmerField.harvestablePods]);

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <PageHeader
          title={
            <>
              <strong>The Field</strong>
              <Box
                component="span"
                sx={{ display: { md: 'inline', xs: 'none' } }}
              >
                : The Decentralized Credit Facility
              </Box>
            </>
          }
          description="Earn yield by lending Beans to Beanstalk in exchange for Pods"
        />
        <FieldConditions
          beanstalkField={beanstalkField}
          // farmerField={farmerField}
          // podLine={podLine}
          // handleOpenDialog={handleOpen}
        />
        <FieldActions />
        <TableCard
          title="My Pods"
          state="ready"
          amount={farmerField.pods}
          rows={rows}
          columns={columns}
          sort={{ field: 'placeInLine', sort: 'asc' }}
          // token={PODS}
        />
      </Stack>
      {/* <MyPlotsDialog
        beanstalkField={beanstalkField}
        handleCloseDialog={handleClose}
        farmerField={farmerField}
        modalOpen={modalOpen}
        podLine={podLine}
        columns={columns}
        rows={rows}
      /> */}
    </Container>
  );
};
export default FieldPage;

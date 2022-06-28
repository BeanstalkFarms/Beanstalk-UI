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
import FieldConditions from '../components/Field/FieldConditions';
import MyPlotsDialog from '../components/Field/MyPlotsDialog';

const columns: DataGridProps['columns'] = [
  {
    field: 'placeInLine',
    headerName: 'Place In Line',
    flex: 1,
    valueFormatter: (params) =>
      `${displayFullBN(params.value as BigNumber, 0)}`,
    renderCell: (params) => <Typography>{displayBN(params.value)}</Typography>,
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
    renderCell: (params) => <Typography>{displayBN(params.value)}</Typography>,
  },
];

const FieldPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  // Theme
  const handleClose = useCallback(() => {
    setModalOpen(false);
  }, []);
  const handleOpen = useCallback(() => setModalOpen(true), []);

  // Data
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>(
    (state) => state._farmer.field
  );
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );
  const podLine = beanstalkField?.podIndex.minus(beanstalkField.harvestableIndex);

  // Rows
  const rows = useMemo(
    () =>
      Object.keys(farmerField.plots).map((index) => ({
        id: index,
        placeInLine: new BigNumber(index).minus(
          beanstalkField.harvestableIndex
        ),
        amount: new BigNumber(farmerField.plots[index]),
      })),
    [farmerField?.plots, beanstalkField.harvestableIndex]
  );

  return (
    <Container maxWidth="md">
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
          handleOpenDialog={handleOpen}
          farmerField={farmerField}
          podLine={podLine}
        />
      </Stack>
      <MyPlotsDialog
        beanstalkField={beanstalkField}
        handleCloseDialog={handleClose}
        farmerField={farmerField}
        modalOpen={modalOpen}
        podLine={podLine}
        columns={columns}
        rows={rows}
      />
    </Container>
  );
};
export default FieldPage;

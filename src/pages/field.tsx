import React, { useMemo } from 'react';
import { Box, Button, Card, Container, Stack } from '@mui/material';
import PageHeader from 'components/v2/Common/PageHeader';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import BigNumber from 'bignumber.js';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import { displayFullBN } from 'util/index';

const columns : DataGridProps['columns'] = [
  {
    field: 'placeInLine',
    headerName: 'Place In Line',
    width: 200,
    valueFormatter: (params) => `${displayFullBN(params.value as BigNumber, 0)}`
  },
  {
    field: 'amount',
    headerName: 'Amount',
    width: 200,
    disableColumnMenu: true,
    flex: 1,
    align: 'left',
    headerAlign: 'left',
    valueFormatter: (params) => `${displayFullBN(params.value as BigNumber, 2)}`
    // valueParser: (params) => Number(params.value),
    // valueFormatter: (params) => `${params.value}%`,
  },
];

const FieldPage : React.FC = () => {
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>((state) => state._farmer.field);
  const { harvestableIndex } = useSelector<AppState, AppState['_beanstalk']['field']>((state) => state._beanstalk.field);
  const rows = useMemo(() => Object.keys(farmerField.plots).map((index) => ({
        id: index,
        placeInLine: new BigNumber(index).minus(harvestableIndex),
        amount: new BigNumber(farmerField.plots[index]),
      })), [farmerField?.plots, harvestableIndex]);
  return (
    <Container maxWidth="md">
      <Stack gap={2}>
        <PageHeader
          title="The Field"
          purpose="The Decentralized Credit Facility"
          description="Earn yield through lending Beans to Beanstalk when there is Available Soil in exchange for Pods"
          control={(
            <Button
              target="_blank"
              rel="noreferrer"
              color="light"
              variant="contained"
            >
              Governance
            </Button>
          )}
        />
        <Container maxWidth="sm">
          <Card sx={{ padding: 2 }}>
            <Box sx={{ height: 400 }}>
              <DataGrid
                columns={columns}
                rows={rows}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
              />
            </Box>
          </Card>
        </Container>
      </Stack>
    </Container>
  );
};

export default FieldPage;

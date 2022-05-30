import React, { useMemo } from 'react';
import { Box, Button, Card, Container, Grid, Stack, Typography } from '@mui/material';
import PageHeader from 'components/v2/Common/PageHeader';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import BigNumber from 'bignumber.js';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import { displayFullBN } from 'util/index';
import { SNAPSHOT_LINK } from 'constants/index';
import { tableStyle } from 'util/tableStyle';

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
  },
];

const MAX_ROWS = 5;

const FieldPage : React.FC = () => {
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>((state) => state._farmer.field);
  const { harvestableIndex } = useSelector<AppState, AppState['_beanstalk']['field']>((state) => state._beanstalk.field);

  // Rows
  const rows = useMemo(() => Object.keys(farmerField.plots).map((index) => ({
    id: index,
    placeInLine: new BigNumber(index).minus(harvestableIndex),
    amount: new BigNumber(farmerField.plots[index]),
  })), [farmerField?.plots, harvestableIndex]);

  const tableHeight = useMemo(() => {
    if (!rows || rows.length === 0) return '200px';
    return Math.min(rows.length, MAX_ROWS) * 52 + 112;
  }, [rows]);

  return (
    <Container maxWidth="md">
      <Stack spacing={2}>
        <PageHeader
          title={<><strong>The Field</strong><Box component="span" sx={{ display: { md: 'inline', xs: 'none' } }}>: The Decentralized Credit Facility</Box></>}
          description="Earn yield through lending Beans to Beanstalk when there is Available Soil in exchange for Pods"
        />
        <Card sx={{ p: 2 }}>
          <Stack gap={2}>
            <Typography variant="h2">Field Conditions</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h4">Available Soil</Typography>
                <Typography variant="h1">10,000</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h4">Available Soil</Typography>
                <Typography variant="h1">5034%</Typography>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ backgroundColor: "#F6FAFE", p: 1.5, borderRadius: 1.5 }}>
                  <Typography variant="h4">Pod Line</Typography>
                  <Typography variant="h1">5034%</Typography>
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </Card>
        <Card>
          <Box
            sx={{
              height: tableHeight,
              ...tableStyle
            }}>
            <DataGrid
              columns={columns}
              rows={rows}
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
            />
          </Box>
        </Card>
      </Stack>
    </Container>
  );
};

export default FieldPage;

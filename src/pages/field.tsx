import React, { useCallback, useMemo, useState } from 'react';
import { Box, Card, Container, Dialog, Grid, Link, Stack, Typography } from '@mui/material';
import PageHeader from 'components/v2/Common/PageHeader';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import BigNumber from 'bignumber.js';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import { displayBN, displayFullBN } from 'util/index';
import { tableStyle } from 'util/tableStyle';
import podIcon from 'img/pod-logo.svg';
import ClearIcon from '@mui/icons-material/Clear';

const columns: DataGridProps['columns'] = [
  {
    field: 'placeInLine',
    headerName: 'Place In Line:',
    width: 200,
    valueFormatter: (params) => `${displayFullBN(params.value as BigNumber, 0)}`
  },
  {
    field: 'amount',
    headerName: 'Number of Pods:',
    width: 200,
    disableColumnMenu: true,
    flex: 1,
    align: 'left',
    headerAlign: 'left',
    valueFormatter: (params) => `${displayFullBN(params.value as BigNumber, 2)}`
  },
];

const MAX_ROWS = 5;

const FieldPage: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hideDrawer = useCallback(() => setDrawerOpen(false), []);
  const showDrawer = useCallback(() => setDrawerOpen(true), []);
  // Data
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>((state) => state._farmer.field);
  const { harvestableIndex } = useSelector<AppState, AppState['_beanstalk']['field']>((state) => state._beanstalk.field);
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>((state) => state._beanstalk.field);

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

  const podLine = beanstalkField?.pods.minus(beanstalkField.harvestableIndex);

  const podBalance = (
    <Stack direction="row" gap={0.3}>
      <Typography variant="h4">My Pod Balance:</Typography>
      <Stack direction="row" alignItems="center">
        <img alt="" src={podIcon} height="17px" />
        <Typography variant="h4">100</Typography>
        {/* <Typography variant="h4">{displayBN(farmerField.pods)}</Typography> */}
      </Stack>
    </Stack>
  );

  const podLineBox = (
    <Box sx={{ backgroundColor: '#F6FAFE', p: 1.5, borderRadius: 1.5 }}>
      <Typography variant="h4" color="text.secondary">Pod Line</Typography>
      <Typography variant="h1">{displayBN(podLine)}</Typography>
    </Box>
  );

  return (
    <Container maxWidth="md">
      <Stack spacing={2}>
        <PageHeader
          title={
            <>
              <strong>The Field</strong>
              <Box component="span" sx={{ display: { md: 'inline', xs: 'none' } }}>: The
                Decentralized Credit Facility
              </Box>
            </>
          }
          description="Earn yield through lending Beans to Beanstalk when there is Available Soil in exchange for Pods"
        />
        <Card sx={{ p: 2 }}>
          <Stack gap={2}>
            <Typography variant="h2">Field Conditions</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h4">Available Soil</Typography>
                <Typography variant="h1">{displayBN(beanstalkField.soil)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h4">Weather</Typography>
                <Typography variant="h1">{displayBN(beanstalkField.weather.yield)}%</Typography>
              </Grid>
              <Grid item xs={12}>
                <Box>
                  {podLineBox}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" justifyContent="space-between">
                  <>{podBalance}</>
                  <Link onClick={showDrawer} underline="none" sx={{ cursor: 'pointer' }}>
                    <Typography variant="h4">Available Soil</Typography>
                  </Link>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Card>
      </Stack>
      <Dialog onClose={() => setDrawerOpen(false)} open={drawerOpen} fullWidth>
        <Card sx={{ p: 2 }}>
          <Stack gap={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" color="text.secondary">My Plots:</Typography>
              <ClearIcon sx={{ cursor: 'pointer', color: '#bbbcd1' }} onClick={hideDrawer} />
            </Stack>
            <Box>
              {podLineBox}
            </Box>
            <Box sx={{ pt: 1.2, pb: 1.5 }}>
              {podBalance}
            </Box>
          </Stack>
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
      </Dialog>
    </Container>
  );
};
export default FieldPage;

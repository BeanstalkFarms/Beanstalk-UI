import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Card,
  Container,
  Dialog,
  Grid,
  Link,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import PageHeader from 'components/v2/Common/PageHeader';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import BigNumber from 'bignumber.js';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import { displayBN, displayFullBN } from 'util/index';
import { tableStyle } from 'util/tableStyle';
import podIcon from 'img/pod-logo.svg';
import useTheme from '@mui/styles/useTheme';
import {
  StyledDialogContent,
  StyledDialogTitle,
} from 'components/v2/Common/Dialog';

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

const MAX_ROWS = 5;

const FieldPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
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
  const beanToken = useSelector<AppState, AppState['_bean']['token']>(
    (state) => state._bean.token
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

  const tableHeight = useMemo(() => {
    if (!rows || rows.length === 0) return '200px';
    return Math.min(rows.length, MAX_ROWS) * 52 + 112;
  }, [rows]);

  // Theme
  const theme = useTheme();
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));

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
        <Card sx={{ p: 2 }}>
          <Stack gap={2}>
            <Typography variant="h2">Field Conditions</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Stack gap={0.5}>
                  <Typography variant="h4">Available Soil</Typography>
                  <Typography variant="h1">
                    {displayBN(beanstalkField.soil)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack gap={0.5}>
                  <Typography variant="h4">Weather</Typography>
                  <Typography variant="h1">
                    {displayBN(beanstalkField.weather.yield)}%
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack gap={0.5}>
                  <Typography variant="h4">Pod Rate</Typography>
                  <Typography variant="h1">
                    {displayBN(
                      beanstalkField?.podIndex.div(beanToken?.supply).times(100)
                    )}
                    %
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <Stack
                    gap={0.5}
                    sx={{
                      backgroundColor: '#F6FAFE',
                      px: 2,
                      py: 1.5,
                      borderRadius: 1.5,
                    }}
                  >
                    <Typography variant="h4">Pod Line</Typography>
                    <Typography variant="h1">{displayBN(podLine)}</Typography>
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" gap={0.5}>
                    <Typography variant="h4">My Pod Balance:</Typography>
                    <Stack direction="row" alignItems="center" gap={0.25}>
                      <img alt="" src={podIcon} height="17px" />
                      <Typography variant="h4">
                        {displayBN(farmerField.pods)}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Link
                    onClick={handleOpen}
                    underline="none"
                    sx={{ cursor: 'pointer' }}
                  >
                    <Typography variant="h4">View My Plots</Typography>
                  </Link>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Card>
      </Stack>
      <Dialog
        onClose={handleClose}
        open={modalOpen}
        fullWidth
        fullScreen={isMedium}
        disableScrollLock
      >
        <StyledDialogTitle onClose={handleClose}>My Plots</StyledDialogTitle>
        <StyledDialogContent sx={{ pb: 0.5 }}>
          <Stack gap={2}>
            {/* Pod Balance */}
            <Box>
              <Stack
                gap={0.5}
                sx={{
                  backgroundColor: '#F6FAFE',
                  px: 2,
                  py: 1.5,
                  borderRadius: 1.5,
                }}
              >
                <Typography variant="h4" color="text.secondary">
                  Pod Balance
                </Typography>
                <Stack direction="row" gap={0.5} alignItems="center">
                  <img alt="" src={podIcon} height="22px" />
                  <Typography variant="h1">
                    {displayBN(farmerField.pods)}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
            <Box
              sx={{
                height: tableHeight,
                ...tableStyle,
              }}
            >
              <DataGrid
                columns={columns}
                rows={rows}
                pageSize={8}
                disableSelectionOnClick
                density="compact"
              />
            </Box>
          </Stack>
        </StyledDialogContent>
      </Dialog>
    </Container>
  );
};
export default FieldPage;

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Card,
  Container,
  Dialog,
  Grid,
  Link,
  Stack,
  Typography,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import BigNumber from 'bignumber.js';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import { displayBN, displayFullBN } from 'util/index';
import { tableStyle } from 'util/tableStyle';
import podIcon from 'img/beanstalk/pod-icon.svg';
import useTheme from '@mui/styles/useTheme';
import {
  StyledDialogContent,
  StyledDialogTitle,
} from 'components/Common/Dialog';
import PodLineSection from '../components/Field/PodLineSection';

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
  const theme = useTheme();
  // Theme
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
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

  // const data = series[0];
  const ref = useRef<any>(null);
  const [graphWidth, setGraphWidth] = useState(ref.current ? ref.current.offsetWidth : 0);
  window.addEventListener('resize', () => setGraphWidth(ref.current ? ref.current.offsetWidth : 0));
  // sets width of graph on page load
  useEffect(() => {
    setGraphWidth(ref.current ? ref.current.offsetWidth : 0);
  }, []);

  console.log('GRAPH WIDTH', graphWidth);

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
                  <Tooltip
                    title="The number of Beans that can currently be Sown, or lent to Beanstalk."
                    placement="top">
                    <Typography variant="h4">Available Soil</Typography>
                  </Tooltip>
                  <Typography variant="h1">
                    {displayBN(beanstalkField.soil)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack gap={0.5}>
                  <Tooltip title="The interest rate for Sowing Beans." placement="top">
                    <Typography variant="h4">Weather</Typography>
                  </Tooltip>
                  <Typography variant="h1">
                    {displayBN(beanstalkField.weather.yield)}%
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack gap={0.5}>
                  <Tooltip
                    title="The ratio of Unharvested Pods to total Bean supply. The Pod Rate is often used as a proxy for Beanstalk’s leverage."
                    placement="top">
                    <Typography variant="h4">Pod Rate</Typography>
                  </Tooltip>
                  <Typography variant="h1">
                    {displayBN(
                      beanstalkField?.podIndex.div(beanToken?.supply).times(100)
                    )}
                    %
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <PodLineSection
                  numPodsTitle="Pod Line"
                  numPodsDisplay={podLine}
                  podLine={podLine}
                  harvestableIndex={beanstalkField.harvestableIndex}
                  plots={farmerField.plots}
                />
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" gap={0.5}>
                    <Typography variant="h4">My Pod Balance:</Typography>
                    <Stack direction="row" alignItems="center" gap={0.25}>
                      <img alt="" src={podIcon} height="17px" />
                      <Tooltip title="The number of Beans you are owed by Beanstalk." placement="right">
                        <Typography variant="h4">
                          {displayBN(farmerField.pods)}
                        </Typography>
                      </Tooltip>
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
            <PodLineSection
              numPodsTitle="Pod Balance"
              numPodsDisplay={farmerField.pods}
              podLine={podLine}
              harvestableIndex={beanstalkField.harvestableIndex}
              plots={farmerField.plots}
            />
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

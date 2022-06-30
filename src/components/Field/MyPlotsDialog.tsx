import React, { useMemo } from 'react';
import { Box, Dialog, Stack, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import BigNumber from 'bignumber.js';
import { DataGrid, GridColumns } from '@mui/x-data-grid';
import { AppState } from '../../state';
import PodLineSection from './PodLineSection';
import { StyledDialogContent, StyledDialogTitle } from '../Common/Dialog';
import { tableStyle } from '../Common/Table/styles';

export interface MyPlotsDialogProps {
  podLine: BigNumber;
  beanstalkField: AppState['_beanstalk']['field'];
  farmerField: AppState['_farmer']['field'];
  handleCloseDialog: any;
  columns: GridColumns<any>;
  rows: any;
  modalOpen: boolean;
}

const MAX_ROWS = 5;

const MyPlotsDialog: React.FC<MyPlotsDialogProps> = ({
  modalOpen,
  beanstalkField,
  farmerField,
  handleCloseDialog,
  podLine,
  columns,
  rows,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleClose = () => {
    handleCloseDialog();
  };

  const tableHeight = useMemo(() => {
    if (!rows || rows.length === 0) return '200px';
    return Math.min(rows.length, MAX_ROWS) * 52 + 112;
  }, [rows]);

  return (
    <Dialog
      onClose={handleClose}
      open={modalOpen}
      fullWidth
      fullScreen={isMobile}
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
              initialState={{
                sorting: {
                  sortModel: [{ field: 'placeInLine', sort: 'asc' }],
                }
              }}
            />
          </Box>
        </Stack>
      </StyledDialogContent>
    </Dialog>
  );
};

export default MyPlotsDialog;

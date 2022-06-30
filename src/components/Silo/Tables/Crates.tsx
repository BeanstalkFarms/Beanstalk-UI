import React, { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { Box, Card, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { DataGrid, GridColumns, GridSortItem, GridSortModel } from '@mui/x-data-grid';

import { displayBN, displayUSD } from 'util/index';
import { tableStyle } from 'util/tableStyle';
import { ZERO_BN } from 'constants/index';

const MAX_ROWS = 5;

const Crates : React.FC<{
  title: string;
  columns: GridColumns;
  rows: any[];
  loading?: boolean;
  amount?: BigNumber;
  value?: BigNumber;
  state: 'disconnected' | 'loading' | 'ready';
  sort?: GridSortItem;
}> = ({
  title,
  columns,
  rows,
  amount,
  value,
  state,
  sort = { field: 'season', sort: 'desc' }
}) => {
  const tableHeight = useMemo(() => {
    if (!rows || rows.length === 0) return '180px';
    return (60.5 + 6 + 39 - 5) + Math.min(rows.length, MAX_ROWS) * 36;
  }, [rows]);

  return (
    <Card>
      <Stack p={2} direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        {state === 'ready' ? (
          <Typography variant="h4">
            {displayBN(amount || ZERO_BN)}
            {value && (
              <Typography display="inline" color="text.secondary">
                {' '}(~{displayUSD(value)})
              </Typography>
            )}
          </Typography>
        ) : (
          state === 'loading' ? (
            <CircularProgress color="primary" variant="indeterminate" size={18} thickness={5} />
          ) : null
        )}
      </Stack>
      <Divider />
      <Box
        sx={{
          pt: 0.5,
          px: 1,
          height: tableHeight,
          width: '100%',
          ...tableStyle
        }}>
        <DataGrid
          columns={columns}
          rows={rows}
          pageSize={MAX_ROWS}
          disableSelectionOnClick
          disableColumnMenu
          density="compact"
          components={{
            NoRowsOverlay() {
              return (
                <Stack height="100%" alignItems="center" justifyContent="center">
                  {state === 'disconnected'
                    ? `Connect a wallet to view ${title}`
                    : state === 'loading' 
                      ? 'Loading...'
                      : `No ${title}`}
                </Stack>
              );
            },
          }}
          initialState={{
            sorting: {
              sortModel: [sort],
            }
          }}
        />
      </Box>
    </Card>
  );
};

export default Crates;

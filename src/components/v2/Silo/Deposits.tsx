import React, { useMemo } from 'react';
import { Token } from 'classes';
import BigNumber from 'bignumber.js';
import { Box, Card, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { FarmerTokenBalance } from 'state/v2/farmer/silo';
import type { Deposit } from 'state/v2/farmer/silo';
import { tableStyle } from '../../../util/tableStyle';

const columns = [
  {
    field: 'season',
    headerName: 'Season',
    // width: 117
    flex: 1,
    align: 'left',
    headerAlign: 'left',
  },
  {
    field: 'amount',
    headerName: 'Amount',
    // minW: 175,
    flex: 2,
    align: 'left',
    headerAlign: 'left',
  },
  {
    field: 'stalk',
    headerName: 'Stalk',
    // width: 117
    flex: 1,
    align: 'left',
    headerAlign: 'left',
  },
  {
    field: 'seeds',
    headerName: 'Seeds',
    // width: 117
    flex: 1,
    align: 'left',
    headerAlign: 'left',
  }
];

const Deposits : React.FC<{
  token: Token;
  siloToken: FarmerTokenBalance; // FIXME: naming
}> = ({
  token,
  siloToken,
}) => {
  const rows : (Deposit & { id: BigNumber })[] = useMemo(() => siloToken?.deposited.crates.map((deposit) => ({
    id: deposit.season,
    ...deposit
  })), [siloToken?.deposited.crates]);

  return (
    <Box
      sx={{
        ...tableStyle
      }}
    >
      <Card sx={{ p: 2 }}>
        <Stack gap={0.5}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{token.name} Deposits</Typography>
          </Box>
          <Box sx={{ height: 375, width: '100%' }}>
            <DataGrid
              columns={columns}
              rows={rows}
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
            />
          </Box>
        </Stack>
      </Card>
    </Box>
  );
};

export default Deposits;

import React, { useMemo } from 'react';
import { Token } from 'classes';
import BigNumber from 'bignumber.js';
import { Box, Card, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useSelector } from 'react-redux';

import { AppState } from 'state';
import { FarmerTokenBalance } from 'state/v2/farmer/silo';
import type { Deposit } from 'state/v2/farmer/silo';
import { SiloToken } from 'constants/siloTokens';

const columns = [
  {
    field: 'season',
    headerName: 'Season',
  },
  {
    field: 'amount',
    headerName: 'Amount',
    width: 300,
  },
  // {
  //   field: 'stalk',
  //   headerName: 'Stalk',
  //   width: 200,
  // },
  // {
  //   field: 'seeds',
  //   headerName: 'Seeds',
  //   width: 200,
  // }
];

const Deposits : React.FC<{
  token: Token;
  siloToken: FarmerTokenBalance; // FIXME: naming
}> = ({
  token,
  siloToken,
}) => {
  const rows : (Deposit & { id: BigNumber })[] = useMemo(() => siloToken?.deposits.map((deposit) => ({
    id: deposit.season,
    ...deposit
  })), [siloToken?.deposits]);

  return (
    <Card sx={{ p: 2 }}>
      <Stack gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>{token.name} Deposits</Typography>
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
  );
};

export default Deposits;

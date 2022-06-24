import React, { useMemo } from 'react';
import { Token } from 'classes';
import BigNumber from 'bignumber.js';
import { Box, Card, Stack, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColumns, GridRenderCellParams } from '@mui/x-data-grid';

import { FarmerSiloBalance } from 'state/farmer/silo';
import type { DepositCrate } from 'state/farmer/silo';
import { displayBN, displayFullBN } from 'util/index';
import useBeansToUSD from 'hooks/currency/useBeansToUSD';
import { tableStyle } from 'util/tableStyle';
import useSeason from 'hooks/useSeason';
import { STALK } from 'constants/tokens';

const MAX_ROWS = 10;
const basicCell = (params : GridRenderCellParams) => <Typography>{params.formattedValue}</Typography>;

const DepositsCard : React.FC<{
  token: Token;
  balance: FarmerSiloBalance | undefined;
}> = ({
  token,
  balance,
}) => {
  const getUSD = useBeansToUSD();
  const currentSeason = useSeason();

  //
  const rows : (DepositCrate & { id: BigNumber })[] = useMemo(() => 
    balance?.deposited.crates.map((deposit) => ({
      id: deposit.season,
      ...deposit
    })) || [],
    [balance?.deposited.crates]
  );
  const columns = useMemo(() => ([
    {
      field: 'season',
      flex: 1,
      headerName: 'Season',
      align: 'left',
      headerAlign: 'left',
      valueFormatter: (params) => displayBN(params.value),
      renderCell: basicCell,
    },
    {
      field: 'amount',
      flex: 2,
      headerName: 'Amount',
      align: 'left',
      headerAlign: 'left',
      valueFormatter: (params) => displayFullBN(params.value, token.displayDecimals, token.displayDecimals),
      renderCell: (params) => (
        <Tooltip
          title={(
            <>
              <Typography>BDV: {displayBN(params.row.bdv)}</Typography>
              <Typography>Value: ${displayBN(getUSD(params.row.bdv))}</Typography>
            </>
          )}
        >
          <Typography>{displayFullBN(params.value, token.displayDecimals, token.displayDecimals)}</Typography>
        </Tooltip>
      )
    },
    {
      field: 'stalk',
      flex: 1,
      headerName: 'Stalk',
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => displayBN(params.value),
      renderCell: (params) => {
        const seedsPerSeason = params.row.seeds.times(0.00001);
        const accrued = seedsPerSeason.times(currentSeason.minus(params.row.season));
        return (
          <Tooltip
            title={(
              <>
                <Typography>Base: {displayBN(params.row.stalk)} Stalk</Typography>
                <Typography>Accrued: {displayBN(accrued)} Stalk</Typography>
                <Typography>Earning {displayBN(seedsPerSeason)} Stalk per Season</Typography>
              </>
            )}
          >
            <Typography>
              {displayFullBN(params.value.plus(accrued), STALK.displayDecimals, STALK.displayDecimals)}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'seeds',
      flex: 1,
      headerName: 'Seeds',
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => displayBN(params.value),
      renderCell: basicCell,
    }
  ] as GridColumns), [token.displayDecimals, getUSD, currentSeason]);

  const tableHeight = useMemo(() => {
    if (!rows || rows.length === 0) return '200px';
    return Math.min(rows.length, MAX_ROWS) * 36 + 94;
  }, [rows]);

  return (
    <Card>
      <Stack gap={0.5}>
        <Box sx={{ px: 2, pt: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{token.name} Deposits</Typography>
        </Box>
        <Box
          sx={{
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
            initialState={{
              sorting: {
                sortModel: [{ field: 'season', sort: 'desc' }],
              }
            }}
          />
        </Box>
      </Stack>
    </Card>
  );
};

export default DepositsCard;

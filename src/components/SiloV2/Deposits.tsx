import { Card } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Token } from 'classes';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { UserTokenBalance } from 'state/v2/farmer/silo';
import { displayBN } from 'util/TokenUtilities';
import type { Deposit } from 'state/v2/farmer/silo';
import BigNumber from 'bignumber.js';

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
  {
    field: 'stalk',
    headerName: 'Stalk',
    width: 200,
  },
  {
    field: 'seeds',
    headerName: 'Seeds',
    width: 200,
  }
]

const Deposits : React.FC<{
  token: Token
}> = ({
  token,
  ...props
}) => {
  const { deposits }  = useSelector<AppState, UserTokenBalance>((state) => state._farmer.silo.tokens[token.address]);

  const rows : (Deposit & { id: BigNumber })[] = useMemo(() => {
    return deposits.map((deposit) => {
      return {
        id: deposit.season,
        ...deposit
      }
    })
  }, [deposits])

  console.log(rows)

  return (
    <Card sx={{ height: 400, width: '100%' }}>
      <DataGrid
        columns={columns}
        rows={rows}
        pageSize={5}
        rowsPerPageOptions={[5]}
        disableSelectionOnClick
      />
    </Card>
  )
}

export default Deposits;
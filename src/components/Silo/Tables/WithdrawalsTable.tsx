import React, { useMemo } from 'react';
import { Token } from 'classes';
import BigNumber from 'bignumber.js';
import { Tooltip, Typography } from '@mui/material';
import { GridColumns, GridRenderCellParams } from '@mui/x-data-grid';
import { FarmerSiloBalance, WithdrawalCrate } from 'state/farmer/silo';
import { displayFullBN, displayUSD } from 'util/index';
import useSeason from 'hooks/useSeason';
import { BEAN, STALK } from 'constants/tokens';
import { ZERO_BN } from 'constants/index';
import useSiloTokenToUSD from 'hooks/currency/useSiloTokenToUSD';
import useChainConstant from 'hooks/useChainConstant';
import Crates from './Crates';
import COLUMNS from 'components/Common/Table/cells';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { useAccount } from 'wagmi';

type RowData = WithdrawalCrate & { id: BigNumber };

const WithdrawalsTable : React.FC<{
  token: Token;
  balance: FarmerSiloBalance | undefined;
}> = ({
  token,
  balance,
}) => {
  const getUSD = useSiloTokenToUSD();
  const currentSeason = useSeason();
  const { data: account } = useAccount();

  const rows : RowData[] = useMemo(() => {
    const data : RowData[] = [];
    if (balance) {
      if (balance.claimable.amount.gt(0)) {
        data.push({
          id: currentSeason,
          amount: balance.claimable.amount,
          season: currentSeason,
        });
      }
      if (balance.withdrawn?.crates?.length > 0) {
        data.push(
          ...(balance.withdrawn.crates.map((crate) => ({
            id: crate.season,
            ...crate
          })))
        )
      }
    }
    return data;
  }, [
    balance,
    currentSeason,
  ]);

  const columns = useMemo(() => ([
    {
      field: 'season',
      flex: 1,
      headerName: 'Seasons to Arrival',
      align: 'left',
      headerAlign: 'left',
      valueParser: (value: BigNumber) => value.toNumber(),
      renderCell: (params) => {
        const seasonsToArrival = params.value.minus(currentSeason);
        return seasonsToArrival.lte(0) ? (
          <Typography color="primary">Claimable</Typography>
        ) : (
          <Typography>{seasonsToArrival.toFixed()}</Typography>
        )
      },
      sortable: false,
    },
    {
      field: 'amount',
      flex: 2,
      headerName: 'Withdrawn',
      align: 'right',
      headerAlign: 'right',
      // valueFormatter: (params) => displayFullBN(params.value, token.displayDecimals, token.displayDecimals),
      renderCell: (params) => (
        <Tooltip
          title={(
            <>
              Tooltip
              {/* <Typography>BDV: {displayBN(params.row.bdv)}</Typography>
              <Typography>Value: ${displayBN(getUSD(Bean, params.row.bdv))}</Typography> */}
            </>
          )}
        >
          <Typography>
            {displayFullBN(params.value, token.displayDecimals, token.displayDecimals)} 
            <Typography display="inline" color="text.secondary">
              {' '}(~{displayUSD(getUSD(token, params.row.amount))})
            </Typography>
          </Typography>
        </Tooltip>
      ),
      sortable: false,
    },
  ] as GridColumns), [
    token,
    getUSD,
    currentSeason
  ]);

  const amount = balance?.withdrawn.amount;
  const state = !account ? 'disconnected' : !currentSeason ? 'loading' : 'ready';

  return (
    <Crates
      title={`${token.name} Withdrawals`}
      rows={rows}
      columns={columns}
      amount={amount}
      value={getUSD(token, amount || ZERO_BN)}
      state={state}
      sort={{ field: 'season', sort: 'asc' }}
    />
  );
};

export default WithdrawalsTable;

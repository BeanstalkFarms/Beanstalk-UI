import React, { useMemo } from 'react';
import { Token } from 'classes';
import BigNumber from 'bignumber.js';
import { useAccount } from 'wagmi';
import { Typography } from '@mui/material';
import { GridColumns } from '@mui/x-data-grid';
import { FarmerSiloBalance, WithdrawalCrate } from '~/state/farmer/silo';
import { displayFullBN, displayUSD } from 'util/index';
import useSeason from 'hooks/useSeason';
import { ZERO_BN } from '~/constants/index';
import useSiloTokenToFiat from 'hooks/currency/useSiloTokenToFiat';
import TableCard from '../../Common/TableCard';

type RowData = WithdrawalCrate & { id: BigNumber };

const Withdrawals : React.FC<{
  token: Token;
  balance: FarmerSiloBalance | undefined;
}> = ({
  token,
  balance,
}) => {
  const getUSD = useSiloTokenToFiat();
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
        );
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
      flex: 2,
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
        );
      },
      sortable: false,
    },
    {
      field: 'amount',
      flex: 2,
      headerName: 'Withdrawn Amount',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography>
          {displayFullBN(params.value, token.displayDecimals, token.displayDecimals)} 
          <Typography display={{ xs: 'none', md: 'inline' }} color="text.secondary">
            {' '}(~{displayUSD(getUSD(token, params.row.amount))})
          </Typography>
        </Typography>
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
    <TableCard
      title={`${token.name} Withdrawals`}
      rows={rows}
      columns={columns}
      amount={amount}
      value={getUSD(token, amount || ZERO_BN)}
      state={state}
      sort={{ field: 'season', sort: 'asc' }}
      token={token}
    />
  );
};

export default Withdrawals;

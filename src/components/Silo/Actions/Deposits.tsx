import React, { useMemo } from 'react';
import { Token } from 'classes';
import BigNumber from 'bignumber.js';
import { useAccount } from 'wagmi';
import { Tooltip, Typography } from '@mui/material';
import { GridColumns } from '@mui/x-data-grid';
import { FarmerSiloBalance } from 'state/farmer/silo';
import type { DepositCrate } from 'state/farmer/silo';
import { displayBN, displayFullBN } from 'util/index';
import useSeason from 'hooks/useSeason';
import { BEAN, STALK } from 'constants/tokens';
import { ZERO_BN } from 'constants/index';
import useSiloTokenToFiat from 'hooks/currency/useSiloTokenToFiat';
import useChainConstant from 'hooks/useChainConstant';
import COLUMNS from 'components/Common/Table/cells';
import Fiat from 'components/Common/Fiat';
import TableCard from '../../Common/TableCard';

/**
 * Prep data to loading to a CratesCard.
 */
const Deposits : React.FC<{
  token: Token;
  balance: FarmerSiloBalance | undefined;
}> = ({
  token,
  balance,
}) => {
  const Bean = useChainConstant(BEAN);
  const getUSD = useSiloTokenToFiat();
  const currentSeason = useSeason();
  const { data: account } = useAccount();

  const rows : (DepositCrate & { id: BigNumber })[] = useMemo(() => 
    balance?.deposited.crates.map((deposit) => ({
      id: deposit.season,
      ...deposit
    })) || [],
    [balance?.deposited.crates]
  );

  const columns = useMemo(() => ([
    COLUMNS.season,
    {
      field: 'amount',
      flex: 1,
      headerName: 'Amount',
      align: 'left',
      headerAlign: 'left',
      valueFormatter: (params) => displayFullBN(params.value, token.displayDecimals, token.displayDecimals),
      renderCell: (params) => (
        <Tooltip
          placement="right"
          title={(
            <>
              <Typography>BDV at Deposit: {displayFullBN(params.row.bdv, token.displayDecimals)}</Typography>
              <Typography>Current Value: <Fiat amount={params.row.amount} token={Bean} /></Typography>
            </>
          )}
        >
          <span>
            <Typography display={{ xs: 'none', md: 'block' }}>{displayFullBN(params.value, token.displayDecimals, token.displayDecimals)}</Typography>
            <Typography display={{ xs: 'block', md: 'none' }}>{displayBN(params.value)}</Typography>
          </span>
        </Tooltip>
      ),
      sortable: false,
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
        const accruedStalk   = seedsPerSeason.times(currentSeason.minus(params.row.season));
        return (
          <Tooltip
            placement="right"
            title={(
              <span>
                <Typography>{displayBN(params.row.stalk)} Stalk at Deposit</Typography>
                <Typography>{displayBN(accruedStalk)} Stalk grown since Deposit</Typography>
                <Typography color="gray">Earning {displayBN(seedsPerSeason)} Stalk per Season</Typography>
              </span>
            )}
          >
            <span>
              <Typography display={{ xs: 'none', md: 'block' }}>{displayFullBN(params.value.plus(accruedStalk), STALK.displayDecimals, STALK.displayDecimals)}</Typography>
              <Typography display={{ xs: 'block', md: 'none' }}>{displayBN(params.value.plus(accruedStalk))}</Typography>
            </span>
          </Tooltip>
        );
      },
      sortable: false,
    },
    COLUMNS.seeds,
  ] as GridColumns), [token.displayDecimals, Bean, currentSeason]);

  const amount = balance?.deposited.amount;
  const state = !account ? 'disconnected' : 'ready';

  return (
    <TableCard
      title={`${token.name} Deposits`}
      rows={rows}
      columns={columns}
      amount={amount}
      value={getUSD(token, amount || ZERO_BN)}
      state={state}
      token={token}
    />
  );
};

export default Deposits;

import React, { useMemo } from 'react';
import { Token } from 'classes';
import BigNumber from 'bignumber.js';
import { useAccount } from 'wagmi';
import { Tooltip, Typography } from '@mui/material';
import { GridColumns } from '@mui/x-data-grid';
import { FarmerSiloBalance } from 'state/farmer/silo';
import type { DepositCrate } from 'state/farmer/silo';
import { displayBN, displayFullBN, displayUSD } from 'util/index';
import useSeason from 'hooks/useSeason';
import { BEAN, STALK } from 'constants/tokens';
import { ZERO_BN } from 'constants/index';
import useSiloTokenToUSD from 'hooks/currency/useSiloTokenToUSD';
import useChainConstant from 'hooks/useChainConstant';
import COLUMNS from 'components/Common/Table/cells';
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
  const getUSD = useSiloTokenToUSD();
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
              <Typography>Value: {displayUSD(getUSD(Bean, params.row.bdv))}</Typography>
            </>
          )}
        >
          <Typography>{displayFullBN(params.value, token.displayDecimals, token.displayDecimals)}</Typography>
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
            title={(
              <>
                <Typography>Base: {displayBN(params.row.stalk)} Stalk</Typography>
                <Typography>Accrued: {displayBN(accruedStalk)} Stalk</Typography>
                <Typography>Earning {displayBN(seedsPerSeason)} Stalk per Season</Typography>
              </>
            )}
          >
            <Typography>
              {displayFullBN(params.value.plus(accruedStalk), STALK.displayDecimals, STALK.displayDecimals)}
            </Typography>
          </Tooltip>
        );
      },
      sortable: false,
    },
    COLUMNS.seeds,
  ] as GridColumns), [
    token.displayDecimals,
    getUSD,
    Bean,
    currentSeason
  ]);

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

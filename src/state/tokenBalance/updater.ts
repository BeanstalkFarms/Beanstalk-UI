import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import {
  createLedgerBatch,
  getTokenBalances,
  account,
  metamaskFailure,
  getEtherBalance,
  initializeCallback,
} from 'util/index';

import { supportedERC20Tokens } from 'constants/index';
import { setTokenBalance } from './actions';

export default function Updater() {
  const dispatch = useDispatch();

  useEffect(() => {
    async function updateTokenBalances() {
      const batch = createLedgerBatch();
      const tokenBalancesPromise = getTokenBalances(batch);
      batch.execute();
      const [tokenBalances, ethBalance] = await Promise.all([
        tokenBalancesPromise,
        getEtherBalance(),
      ]);
      const balances = supportedERC20Tokens.reduce((acc, t, i) => {
        acc[t.symbol] = tokenBalances[i];
        return acc;
      }, {});
      balances.ETH = ethBalance;
      dispatch(setTokenBalance(balances));
      initializeCallback(updateTokenBalances);
    }

    async function start() {
      if (!account && metamaskFailure === -1) {
        setTimeout(() => start(), 100);
      } else if (account) {
        updateTokenBalances();
      }
    }

    start();
  }, [dispatch]);

  return null;
}

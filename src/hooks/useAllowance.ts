import BigNumber from 'bignumber.js';
import Token, { NativeToken } from 'classes/Token';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { AllowanceState } from 'state/v2/farmer/allowances/reducer';
import { useFetchAllowances } from 'state/v2/farmer/allowances/updater';
import { MAX_UINT256 } from 'util/LedgerUtilities';

export const useAllowances = (
  contract: string,
  tokens: Token[],
  config: { loadIfAbsent: boolean } = {
    loadIfAbsent: true
  }
) => {
  const allowances = useSelector<AppState, AppState['_farmer']['allowances']>((state) => state._farmer.allowances);
  const [fetchAllowances] = useFetchAllowances();
  const results = useMemo(() => tokens.map((curr) => {
    if (curr instanceof NativeToken) return new BigNumber(MAX_UINT256);
    return allowances[contract]
      ? (allowances[contract][curr.address] || null)
      : null;
  }), [tokens, allowances, contract]);

  // Side effect
  useEffect(() => {
    if (config.loadIfAbsent) {
      const absent = results.reduce((prev, curr, index) => {
        if (!curr) prev.push(tokens[index]);
        return prev;
      }, [] as Token[])
      fetchAllowances(absent, contract);
    }
  }, [
    results,
    contract,
    config.loadIfAbsent,
    fetchAllowances,
    tokens
  ]);

  return results;
};

const useAllowance = (contract: string, token: Token) => {
  const allowances = useSelector<AppState, AppState['_farmer']['allowances']>((state) => state._farmer.allowances);
  if (token instanceof NativeToken) return new BigNumber(MAX_UINT256);
  return allowances[contract]
    ? (allowances[contract][token.address] || null)
    : null;
};

export default useAllowance;

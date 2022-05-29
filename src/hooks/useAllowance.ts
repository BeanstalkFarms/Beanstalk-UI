import BigNumber from 'bignumber.js';
import Token, { NativeToken } from 'classes/Token';
import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
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

  // If a provided Token is a NativeToken, there is no allowance.
  // Otherwise, see if we've loaded an approval for this contract + token combo.
  const results : (null | BigNumber)[] = useMemo(() => tokens.map((curr) => {
    if (curr instanceof NativeToken) return new BigNumber(MAX_UINT256);
    return allowances[contract]
      ? (allowances[contract][curr.address] || null)
      : null;
  }), [tokens, allowances, contract]);

  // If requested, the component will automatically load any
  // allowances that aren't present in state.
  useEffect(() => {
    if (config.loadIfAbsent) {
      // Reduce `results` to a list of the corresponding `tokens`,
      // filtering only for absent results.
      const absent = results.reduce<Token[]>((prev, curr, index) => {
        if (!curr) prev.push(tokens[index]);
        return prev;
      }, [] as Token[]);
      fetchAllowances(absent, contract);
    }
  }, [
    results,
    contract,
    config.loadIfAbsent,
    fetchAllowances,
    tokens
  ]);

  // Allow a component to refetch initial allowances,
  // or to specify new ones to grab.
  const refetch = useCallback((_tokens?: Token[]) => fetchAllowances(_tokens || tokens, contract), [fetchAllowances, tokens, contract]);

  return [results, refetch] as const;
};

const useAllowance = (contract: string, token: Token) => {
  const allowances = useSelector<AppState, AppState['_farmer']['allowances']>((state) => state._farmer.allowances);
  if (token instanceof NativeToken) return new BigNumber(MAX_UINT256);
  return allowances[contract]
    ? (allowances[contract][token.address] || null)
    : null;
};

export default useAllowance;

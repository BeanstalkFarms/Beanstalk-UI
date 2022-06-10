import BigNumber from 'bignumber.js';
import Token, { NativeToken } from 'classes/Token';
import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { useFetchFarmerAllowances } from 'state/v2/farmer/allowances/updater';
import { MAX_UINT256 } from 'constants/index';
import { useAccount } from 'wagmi';

// ----------------------------------------

export default function useAllowances(
  contract: string | undefined,
  tokens: Token[],
  config: { loadIfAbsent: boolean } = {
    loadIfAbsent: true
  }
) {
  const allowances = useSelector<AppState, AppState['_farmer']['allowances']>((state) => state._farmer.allowances);
  const { data: account } = useAccount();
  const [fetchAllowances] = useFetchFarmerAllowances();

  // If a provided Token is a NativeToken, there is no allowance.
  // Otherwise, see if we've loaded an approval for this contract + token combo.
  const currentAllowances : (null | BigNumber)[] = useMemo(() => tokens.map((curr) => {
    if (curr instanceof NativeToken) return new BigNumber(MAX_UINT256);
    if (!contract) return null;
    return allowances[contract]
      ? (allowances[contract][curr.address] || null)
      : null;
  }), [tokens, allowances, contract]);

  // If requested, the component will automatically load any
  // allowances that aren't present in state.
  useEffect(() => {
    if (config.loadIfAbsent && account?.address && contract) {
      // Reduce `results` to a list of the corresponding `tokens`,
      // filtering only for absent results.
      const absent = currentAllowances.reduce<Token[]>((prev, curr, index) => {
        if (!curr) prev.push(tokens[index]);
        return prev;
      }, [] as Token[]);
      console.debug(`[hooks/useAllowance] found ${absent.length} absent tokens for ${contract}`);
      if (absent.length > 0) {
        fetchAllowances(
          account?.address,
          contract,
          absent
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    account?.address,
    contract,
    config.loadIfAbsent,
    fetchAllowances,
  ]);

  // Allow a component to refetch initial allowances,
  // or to specify new ones to grab.
  const refetch = useCallback((_tokens?: Token[]) => {
    if (account?.address && contract) {
      return fetchAllowances(
        account.address,
        contract,
        _tokens || tokens
      );
    }
    return Promise.resolve();
  }, [fetchAllowances, account?.address, tokens, contract]);

  return [currentAllowances, refetch] as const;
}

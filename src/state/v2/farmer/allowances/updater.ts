import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {  toTokenUnitsBN } from 'util/index';
import BigNumber from 'bignumber.js';
import { useAccount } from 'wagmi';
import Token from 'classes/Token';
import { clearAllowances, UpdateAllowancePayload, updateAllowances } from './actions';

// -- Helpers

// export const getAllowance = async (token: SupportedToken, address: string) => {
//   const call = token === ETH ? (
//     Promise.resolve({
//       token: ETH,
//       allowance: new BigNumber(parseInt(MAX_UINT256, 16))
//     })
//   ) : (
//     erc20TokenContract(token).allowance(address, BARNRAISE_CONTRACT)
//   );
//   return call.then((allowance) => ({
//     token,
//     allowance: toTokenUnitsBN(allowance.toString(), token.decimals),
//   }));
// };

export function useFetchAllowances() {
  const dispatch = useDispatch();
  const { data: account } = useAccount();

  // Handlers
  const fetch = useCallback((ts: Token | Token[], contract: string) => {
    if (account?.address) {
      return Promise.all((Array.isArray(ts) ? ts : [ts]).map((token) =>
        token.getAllowance(account.address as string, contract)
          .then((result) => ({
            token,
            contract,
            allowance: result ? toTokenUnitsBN(result, token.decimals) : new BigNumber(0),
          } as UpdateAllowancePayload))
      )).then((_allowances) => {
        console.debug(`[farmer/allowances/updater] fetched ${_allowances.length} allowances`, _allowances);
        dispatch(updateAllowances(_allowances));
      });
    } 
    return Promise.resolve(null);
  }, [dispatch, account]);
  
  const clear = useCallback(() => {
    dispatch(clearAllowances());
  }, [dispatch]);

  return [fetch, clear] as const;
}

// -- Updater

export default function AllowancesUpdater() {
  // const [fetchAllowances, clearAllowances] = useFetchAllowances();

  // useEffect(() => {
  //   if (walletAddress) {
  //     fetchAllowances();
  //   } else {
  //     clearAllowances();
  //   }
  // }, [walletAddress, fetchAllowances, clearAllowances]);

  return null;
}

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import BigNumber from 'bignumber.js';
import Token from 'classes/Token';
import { toTokenUnitsBN, trimAddress } from 'util/index';
import { getAccount } from 'util/account';
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

export function useFetchFarmerAllowances() {
  const dispatch = useDispatch();

  // Handlers
  const fetch = useCallback((_account: string, contract: string, ts: Token | Token[]) => {
    const account = getAccount(_account);
    if (contract && account) {
      console.debug(`[farmer/allowances/useFetchAllowances] FETCH account = ${trimAddress(account, false)} contract = ${trimAddress(contract, false)} token(s) = ${ts.toString()}`);
      return Promise.all((Array.isArray(ts) ? ts : [ts]).map((token) =>
        token.getAllowance(
          account,
          contract
        ).then((result) => ({
          token,
          contract,
          allowance: result ? toTokenUnitsBN(result, token.decimals) : new BigNumber(0),
        } as UpdateAllowancePayload))
      )).then((_allowances) => {
        console.debug(`[farmer/allowances/useFetchAllowances] RESULT: ${_allowances.length} allowances`, _allowances);
        dispatch(updateAllowances(_allowances));
      });
    }
    return Promise.resolve();
  }, [dispatch]);
  
  const clear = useCallback(() => {
    console.debug('[farmer/allowances/useFetchAllowances] CLEAR');
    dispatch(clearAllowances());
  }, [dispatch]);

  return [fetch, clear] as const;
}

// -- Updater

export default function FarmerAllowancesUpdater() {
  return null;
}

import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { ETH, supportedBarnRaiseTokens, SupportedToken } from 'constants/tokens';
import { useWalletAddress } from 'util/web3Onboard';
import { erc20TokenContract, MAX_UINT256, toTokenUnitsBN } from 'util/index';
import BigNumber from 'bignumber.js';
import { BARNRAISE_CONTRACT } from 'constants/index';
import { clearAllowances, updateAllowances } from './actions';

// -- Helpers

export const getAllowance = async (token: SupportedToken, address: string) => {
  const call = token === ETH ? (
    Promise.resolve({
      token: ETH,
      allowance: new BigNumber(parseInt(MAX_UINT256, 16))
    })
  ) : (
    erc20TokenContract(token).allowance(address, BARNRAISE_CONTRACT)
  );
  return call.then((allowance) => ({
    token,
    allowance: toTokenUnitsBN(allowance.toString(), token.decimals),
  }));
};

export const getAllowances = async (address: string) => Promise.all(supportedBarnRaiseTokens.map((token) => getAllowance(token, address)));

// -- Hooks

type FetchFn = () => Promise<any>;
type ClearFn = () => void;

export function useFetchAllowances() : [FetchFn, ClearFn] {
  const dispatch = useDispatch();
  const walletAddress = useWalletAddress();

  // Handlers
  const fetch = useCallback<FetchFn>(() => {
    if (walletAddress) {
      return getAllowances(walletAddress).then((_allowances) => {
        dispatch(updateAllowances(_allowances));
        return _allowances;
      });
    } 
      return Promise.resolve(null);
  }, [dispatch, walletAddress]);
  const clear = useCallback<ClearFn>(() => {
    dispatch(clearAllowances());
  }, [dispatch]);

  return [fetch, clear];
}

// -- Updater

export default function AllowancesUpdater() {
  const walletAddress = useWalletAddress();
  const [fetchAllowances, clearAllowances] = useFetchAllowances();

  useEffect(() => {
    if (walletAddress) {
      fetchAllowances();
    } else {
      clearAllowances();
    }
  }, [walletAddress, fetchAllowances, clearAllowances]);

  return null;
}

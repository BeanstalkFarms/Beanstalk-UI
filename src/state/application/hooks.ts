import { useCallback } from 'react';
import { ethers } from 'ethers';
import { useSelector, useDispatch } from 'react-redux';
import { API as NotifyAPI } from 'bnc-notify';

import { AppState, AppDispatch } from 'state';
import { setWeb3Settings } from './actions';

export function useBlockNumber(): number | undefined {
  return useSelector((state: AppState) => state.application.blockNumber);
}

export function useNotify(): NotifyAPI {
  return useSelector((state: AppState) => state.application.notify);
}

export function useAccount(): string {
  return useSelector((state: AppState) => state.application.account);
}

export function useEthereum(): any {
  return useSelector((state: AppState) => state.application.ethereum);
}

export function useSigner(): ethers.Signer {
  return useSelector((state: AppState) => state.application.signer);
}

export function useDisconnect() {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector<AppState, AppState['application']>(
    (_state) => _state.application
  );

  const disconnect = useCallback(() => {
    dispatch(
      setWeb3Settings({
        wallet: undefined,
        web3: undefined,
        account: '',
        balance: '',
      })
    );

    state.onboard?.walletReset();
    localStorage.removeItem('selectedWallet');
  }, [dispatch, state]);

  return disconnect;
}

export function useWeb3() {
  const state = useSelector<AppState, AppState['application']>(
    (_state) => _state.application
  );

  return state;
}

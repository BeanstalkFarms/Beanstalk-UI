import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { API as NotifyAPI } from 'bnc-notify';
import { get } from 'lodash';

import { AppState, AppDispatch } from 'state';
import {
  ApplicationModal,
  setActiveModal,
  setWeb3Settings,
  setApprovalType as _setApprovalType,
  setWrapEthModalOpen as _setWrapEthModalOpen,
  setWrapEth as _setWrapEth,
} from './actions';

export function useBlockNumber(): number | undefined {
  return useSelector((state: AppState) => state.application.blockNumber);
}

export function useNotify(): NotifyAPI {
  return useSelector((state: AppState) => state.application.notify);
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

export function usePrices() {
  const { prices } = useSelector<AppState, AppState['application']>(
    (state) => state.application
  );

  return prices;
}

export function usePriceChanges() {
  const { priceChanges } = useSelector<AppState, AppState['application']>(
    (state) => state.application
  );

  return priceChanges;
}

export async function getPrice(coinName: string) {
  const geckoUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinName}`;
  try {
    const result = await fetch(geckoUrl);
    const priceJson = await result.json();

    return Number(get(priceJson, '0.current_price'));
  } catch (err) {
    console.log(`Error fetching price for ${coinName}:`, err);

    return 0;
  }
}

export async function get24HourPriceChange(coinName: string) {
  const geckoUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinName}&include_24hr_change=true`;
  try {
    const result = await fetch(geckoUrl);
    const priceJson = await result.json();

    return Number(get(priceJson, '0.price_change_percentage_24h'));
  } catch (err) {
    console.log(`Error fetching 24 hour price change for ${coinName}:`, err);

    return 0;
  }
}

export function useModalOpen(modal: ApplicationModal): boolean {
  const activeModal = useSelector(
    (state: AppState) => state.application.activeModal
  );
  return activeModal === modal;
}

export function useToggleModal(modal: ApplicationModal) {
  const open = useModalOpen(modal);
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(
    (toState = !open) => dispatch(setActiveModal(toState ? modal : null)),
    [dispatch, modal, open]
  );
}

export function useOpenModal(modal: ApplicationModal) {
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(() => dispatch(setActiveModal(modal)), [dispatch, modal]);
}

export function useCloseModals() {
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(() => dispatch(setActiveModal(null)), [dispatch]);
}

export function useToggleTxLoadingModal() {
  return useToggleModal(ApplicationModal.TransactionLoading);
}

export function useToggleTxSuccessModal() {
  return useToggleModal(ApplicationModal.TransactionSuccess);
}

export function useToggleTxCancelledModal() {
  return useToggleModal(ApplicationModal.TransactionCancelled);
}

export function useToggleTxFailedModal() {
  return useToggleModal(ApplicationModal.TransactionFailed);
}

export const useToggleWrapEthModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const wrapEthModalOpen = useSelector<
    AppState,
    AppState['application']['wrapEthModalOpen']
  >((state) => state.application.wrapEthModalOpen);

  const setWrapEthModalOpen = (open: boolean) =>
    dispatch(_setWrapEthModalOpen(open));

  return { wrapEthModalOpen, setWrapEthModalOpen };
};

export const useWrapEth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const wrapEth = useSelector<AppState, AppState['application']['wrapEth']>(
    (state) => state.application.wrapEth
  );

  const setWrapEth = (wrap: boolean) => dispatch(_setWrapEth(wrap));

  return { wrapEth, setWrapEth };
};

export const useApprovalType = () => {
  const dispatch = useDispatch<AppDispatch>();
  const approvalType = useSelector<
    AppState,
    AppState['application']['approvalType']
  >((state) => state.application.approvalType);

  const setApprovalType = (approval: string | null) =>
    dispatch(_setApprovalType(approval));

  return { approvalType, setApprovalType };
};

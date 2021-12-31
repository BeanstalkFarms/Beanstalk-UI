import Onboard from 'bnc-onboard';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { ChainId } from '@uniswap/sdk';
import { Wallet } from 'bnc-onboard/dist/src/interfaces';
import { ethers } from 'ethers';
import { get } from 'lodash';
import { useDebounce, useIsWindowVisible } from 'hooks';
import { AppState } from 'state';

import { wallets, WETH, WBNB, DAI, WMATIC } from '../../constants';

import { updateBlockNumber, setWeb3Settings } from './actions';

export default function Updater(): null {
  const dispatch = useDispatch();
  const location = useLocation();
  const windowVisible = useIsWindowVisible();
  const {
    onboard: _onboard,
    chainId,
    web3,
    signer,
    contracts,
    blockNumber,
  } = useSelector<AppState, AppState['application']>(
    (state) => state.application
  );

  /* Local state */
  const [state, setState] = useState<{
    blockNumber: number | null;
    hasRequestedAccounts: boolean;
  }>({
    blockNumber: null,
    hasRequestedAccounts: false,
  });

  /* */
  const baseToken = DAI[chainId || ChainId.MAINNET];
  const comparisonToken = useMemo(() => {
    switch (chainId) {
      case 56:
        return WBNB;

      case 137:
        return WMATIC;

      default:
        return WETH[chainId ?? ChainId.MAINNET] as any;
    }
  }, [chainId]);

  /* */
  const blockNumberCallback = useCallback(
    (_blockNumber: number) => {
      setState((s) => ({ ...s, blockNumber: _blockNumber }));
    },
    [setState]
  );

  /* */
  useEffect(() => {
    if (!web3 || !chainId || !windowVisible) return undefined;

    setState((s) => ({ ...s, blockNumber: null }));

    if (!blockNumber) {
      web3
        .getBlockNumber()
        .then(blockNumberCallback)
        .catch((error: any) =>
          console.error(
            `Failed to get block number for chainId: ${chainId}`,
            error
          )
        );
    }

    web3.on('block', blockNumberCallback);

    return () => { web3.removeListener('block', blockNumberCallback); };
  }, [
    dispatch,
    chainId,
    web3,
    blockNumber,
    blockNumberCallback,
    windowVisible,
  ]);

  /* */
  const debouncedState = useDebounce(state, 100);

  /* */
  useEffect(() => {
    if (!debouncedState.blockNumber || !windowVisible) return;

    dispatch(updateBlockNumber(debouncedState.blockNumber));
  }, [windowVisible, dispatch, debouncedState.blockNumber]);

  /* */
  useEffect(() => {
    if (!web3 || state.hasRequestedAccounts) return;

    setState((s) => ({ ...s, hasRequestedAccounts: true }));

    const ethereum = (window as any).ethereum;

    //
    const handleGetAccountAndContracts = async (_web3: ethers.providers.Web3Provider) => {
      const _signer = _web3.getSigner();
      const network = await _web3.getNetwork();
      const _chainId = network.chainId;

      dispatch(setWeb3Settings({
        signer: _signer,
        chainId: _chainId
      }));
    };

    //
    ethereum?.request({ method: 'eth_requestAccounts' }).then(() => {
      handleGetAccountAndContracts(web3).catch((e) => console.error(e));

      dispatch(setWeb3Settings({
        ethereum
      }));
    });

    //
    ethereum?.on('accountsChanged', async () => {
      handleGetAccountAndContracts(web3).catch((e) => console.error(e));

      if (['marketplace', 'account'].includes(
        get(location.pathname.split('/'), 1)
      )) {
        document.location.reload();
      }
    });

    //
    ethereum?.on('chainChanged', () => {
      document.location.reload();
    });
  }, [web3, location, signer, contracts, state.hasRequestedAccounts, dispatch]);

  /* */
  useEffect(() => {
    if (_onboard) return;

    if (location.pathname === '/') return;

    const onboard = Onboard({
      subscriptions: {
        address: (_account: string) =>
          dispatch(setWeb3Settings({ account: _account })),
        network: (_chainId: ChainId | 56 | 137) => {
          dispatch(setWeb3Settings({ chainId: _chainId }));

          localStorage.setItem('chainId', String(_chainId));
        },
        balance: (balance: string) => dispatch(setWeb3Settings({ balance })),
        wallet: async (_wallet: Wallet) => {
          const walletAvailable = await onboard.walletCheck();

          if (walletAvailable) {
            const _web3 = new ethers.providers.Web3Provider(_wallet.provider);

            if (window.localStorage) {
              window.localStorage.setItem(
                'selectedWallet',
                _wallet.name as any
              );
            }

            dispatch(setWeb3Settings({ wallet: _wallet, web3: _web3 }));
          } else {
            dispatch(
              setWeb3Settings({
                wallet: null,
                web3: null,
                account: '',
                balance: '',
              })
            );
          }
        },
      },
      networkId: chainId || 1,
      dappId: process.env.REACT_APP_BLOCKNATIVE_KEY,
      hideBranding: true,
      walletSelect: { wallets: wallets() },
      walletCheck: [
        { checkName: 'derivationPath' },
        { checkName: 'connect' },
        { checkName: 'accounts' },
      ],
    });

    dispatch(setWeb3Settings({ onboard }));
  }, [
    dispatch,
    _onboard,
    location,
    chainId,
    signer,
    baseToken,
    comparisonToken,
  ]);

  /* */
  useEffect(() => {
    const previouslySelectedWallet = window.localStorage
      ? window.localStorage.getItem('selectedWallet')
      : undefined;

    if (
      previouslySelectedWallet &&
      _onboard &&
      !['WalletLink', 'Coinbase'].includes(previouslySelectedWallet)
    ) {
      _onboard.walletSelect(previouslySelectedWallet);
    }
  }, [_onboard, dispatch, web3]);

  return null;
}

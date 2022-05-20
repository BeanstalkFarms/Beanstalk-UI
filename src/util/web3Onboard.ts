// import { useEffect, useState, useCallback, useMemo } from 'react'
// import { ethers } from 'ethers';
// import type {
//   ConnectOptions,
//   DisconnectOptions,
//   WalletState,
//   ConnectedChain
// } from '@web3-onboard/core'
// import { Chain, EIP1193Provider } from '@web3-onboard/common'
// import Web3Onboard, { OnboardAPI } from '@web3-onboard/core';
// import injectedModule from '@web3-onboard/injected-wallets';
// import ledgerModule from '@web3-onboard/ledger';
// import walletConnectModule from '@web3-onboard/walletconnect';
// import walletLinkModule from '@web3-onboard/walletlink';
// import { CHAIN_INFO, SupportedChainId } from 'constants/chains';
// import { ALCHEMY_HTTPS_URLS } from 'constants/rpc/alchemy';

// const getChainInfo = (_chainId: SupportedChainId) => ({
//   token: CHAIN_INFO[_chainId].nativeCurrency.symbol,
//   label: CHAIN_INFO[_chainId].label,
//   rpcUrl: ALCHEMY_HTTPS_URLS[_chainId],
// });

// let web3Onboard : OnboardAPI | undefined;
// if (!web3Onboard) {
//   web3Onboard = Web3Onboard({
//     wallets: [
//       injectedModule({
//         custom: [
//           // tally
//         ]
//       }),
//       walletConnectModule({
//         qrcodeModalOptions: {
//           mobileLinks: ['rainbow', 'metamask', 'argent', 'trust', 'imtoken', 'pillar']
//         }
//       }),
//       walletLinkModule({ darkMode: true }),
//       ledgerModule(),
//     ],
//     chains: [
//       {
//         id: '0x1',
//         ...getChainInfo(SupportedChainId.MAINNET)
//       },
//       {
//         id: '0x3',
//         ...getChainInfo(SupportedChainId.ROPSTEN)
//       },
//       {
//         id: '0x4',
//         ...getChainInfo(SupportedChainId.RINKEBY)
//       },
//       {
//         id: '0x5',
//         ...getChainInfo(SupportedChainId.GOERLI)
//       },
//     ],
//     appMetadata: {
//       name: 'Beanstalk',
//       icon: 'https://app.bean.money/assets/beanstalk-logo-square.png',
//       description: 'Beanstalk is a decentralized credit based stablecoin protocol.',
//       recommendedInjectedWallets: [
//         { name: 'MetaMask', url: 'https://metamask.io' },
//         { name: 'Tally', url: 'https://tally.cash' },
//         { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
//       ]
//     }
//   });
// }

// // -- HOOKS
// // Forked from https://github.com/blocknative/web3-onboard/blob/v2-web3-onboard/packages/react/src/index.ts

// const getSigner = (_provider: EIP1193Provider) => (new ethers.providers.Web3Provider(_provider)).getSigner();

// export const useConnectWallet = (): [
//   { 
//     wallet: WalletState | null;
//     signer: ethers.Signer | null;
//     connecting: boolean;
//   },
//   (options: ConnectOptions) => Promise<void>,
//   (wallet: DisconnectOptions) => Promise<void>
// ] => {
//   if (!web3Onboard) throw new Error('Must initialize before using hooks.')

//   const [wallet, setConnectedWallet] = useState<WalletState | null>(
//     () => (web3Onboard as OnboardAPI).state.get().wallets[0] || null
//   )
//   const [signer, setSigner] = useState<ethers.Signer | null>(
//     () => (wallet && wallet.provider) ? getSigner(wallet.provider) : null
//   )
//   const [connecting, setConnecting] = useState(false)

//   useEffect(() => {
//     const subscription = (web3Onboard as OnboardAPI).state
//       .select('wallets')
//       .subscribe(wallets => {
//         setConnectedWallet(wallets[0] || null)
//         setSigner(wallets[0] ? getSigner(wallets[0].provider) : null)
//       })

//     return () => subscription.unsubscribe()
//   }, [wallet])

//   const connect = useCallback(async (options: ConnectOptions) => {
//     setConnecting(true)

//     const [connectedWallet] = await (web3Onboard as OnboardAPI).connectWallet(
//       options
//     )

//     setConnecting(false)
//     setConnectedWallet(connectedWallet || null)
//   }, [])

//   const disconnect = useCallback(async ({ label }) => {
//     setConnecting(true)

//     await (web3Onboard as OnboardAPI).disconnectWallet({ label })

//     window.localStorage.clear();
//     setConnectedWallet(null)
//     setConnecting(false)
//   }, [])

//   return [{ wallet, signer, connecting }, connect, disconnect]
// }

// type SetChainOptions = {
//   chainId: string
//   chainNamespace?: string
// }

// export const useSetChain = (
//   walletLabel?: string
// ): [
//   {
//     chains: Chain[]
//     connectedChain: ConnectedChain | null
//     settingChain: boolean
//   },
//   (options: SetChainOptions) => Promise<boolean>
// ] => {
//   if (!web3Onboard) throw new Error('Must initialize before using hooks.')

//   const { state, setChain } = web3Onboard as OnboardAPI
//   const [settingChain, setInProgress] = useState<boolean>(false)

//   const [connectedChain, setConnectedChain] = useState<ConnectedChain | null>(
//     () => {
//       const initialWallets = (web3Onboard as OnboardAPI).state.get().wallets
//       if (initialWallets.length === 0) return null
//       return (
//         (
//           initialWallets.find(({ label }) => label === walletLabel) ||
//           initialWallets[0]
//         ).chains[0] || null
//       )
//     }
//   )

//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   const chains = useMemo(() => state.get().chains, [])

//   useEffect(() => {
//     const subscription = state.select('wallets').subscribe(wallets => {
//       const wallet =
//         wallets.find(({ label }) => label === walletLabel) || wallets[0]

//       wallet && setConnectedChain(wallet.chains[0])
//     })

//     return () => subscription.unsubscribe()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   const set = useCallback(async (options: SetChainOptions): Promise<boolean> => {
//     setInProgress(true)

//     const success = await setChain({ ...options, wallet: walletLabel })

//     setInProgress(false)

//     return success;
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   return [{ chains, connectedChain, settingChain }, set]
// }

// export const useWallets = (): WalletState[] => {
//   if (!web3Onboard) throw new Error('Must initialize before using hooks.')

//   const [wallets, setConnectedWallets] = useState<WalletState[]>(
//     () => (web3Onboard as OnboardAPI).state.get().wallets
//   )

//   useEffect(() => {
//     const wallets$ = (web3Onboard as OnboardAPI).state.select('wallets')
//     const subscription = wallets$.subscribe(setConnectedWallets)

//     return () => subscription.unsubscribe()
//   }, [])

//   return wallets
// }

// // -- Custom hooks

// export const useWalletAddress = () => {
//   const [{ wallet }] = useConnectWallet();
//   return wallet && wallet.accounts[0] ? wallet.accounts[0].address : null;
// }

// export const useChainId = () => {
//   const [{ connectedChain }] = useSetChain();
//   return connectedChain ? parseInt(connectedChain.id, 16) : null;
// }

// export default web3Onboard;

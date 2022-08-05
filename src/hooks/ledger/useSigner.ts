import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useSigner as useWagmiSigner } from 'wagmi';
import useChainId from '~/hooks/useChain';
import { TESTNET_CHAINS, TESTNET_RPC_ADDRESSES } from '~/constants/index';

export let useSigner = useWagmiSigner;

if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_OVERRIDE_FARMER_ACCOUNT) {
  console.warn(`Using overridden Farmer account: ${process.env.REACT_APP_OVERRIDE_FARMER_ACCOUNT}`);

  // @ts-ignore
  useSigner = () => {
    const [signer, setSigner] = useState<ethers.Signer | undefined>(undefined);
    const chainId = useChainId();
    const wagmiSigner = useWagmiSigner();
    const account   = { address: process.env.REACT_APP_OVERRIDE_FARMER_ACCOUNT };
    const isTestnet = TESTNET_CHAINS.has(chainId);

    useEffect(() => {
      (async () => {
        if (account.address && isTestnet) {
          try {
            const provider = new ethers.providers.JsonRpcProvider(TESTNET_RPC_ADDRESSES[chainId]);
            await provider.send('hardhat_impersonateAccount', [account.address]);
            setSigner(provider.getSigner(account.address));
          } catch (e) {
            console.error(e);
          }
        }
      })();
    }, [
      account?.address,
      chainId,
      isTestnet
    ]);

    /// If we're on a development machine but not connected to a testnet,
    /// we can't impersonate addresses. Just use the normal signer.
    if (!isTestnet) return wagmiSigner;

    return {
      data: signer,
      //
      error: null,
      fetchStatus: null,
      internal: null,
      isError: false,
      isFetched: false,
      isFetching: false,
      isIdle: false,
      isLoading: false,
      isRefetching: false,
      isSuccess: false,
      refetch: () => {},
      status: null,
    };
  };
}

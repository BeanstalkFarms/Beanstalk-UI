import { Beanstalk } from 'constants/generated';
import { AddressMap, BEANSTALK_ADDRESSES } from 'constants/v2/addresses';
import { Contract } from 'ethers';
import { useMemo } from 'react';
import { useAccount, useProvider } from 'wagmi';

const BEANSTALK_ABI = require('constants/abi/Beanstalk/Beanstalk.json');

export default function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | AddressMap | undefined,
  abi: any,
  withSignerIfPossible = true,
) : T | null {
  const { data } = useAccount();
  const provider = useProvider();
  const account = withSignerIfPossible ? data : null;

  return useMemo(() => {
    // NOTE:
    // Here, we use the chainId from the `provider` itself to
    // determine which contract address to use. This prevents an
    // edge case where the `activeChain` provided by `useConnect()`
    // is changed before the provider is updated, causing an instance
    // of `useContract()` to be re-memoized. In downstream functions this
    // could trigger a refetch of data since effects depend on useContract.
    const chainId = provider?._network.chainId;
    if (!addressOrAddressMap || !abi || !chainId) return null;

    let address : string | undefined;
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap;
    else address = addressOrAddressMap[chainId];

    if (!address) {
      console.debug('[useContract] attempted to instantiate contract with no avail address', {
        addressOrAddressMap,
        chainId,
        account,
      });
    }

    console.debug('[useContract] initializing contract instance', {
      address,
      chainId,
    });

    return new Contract(
      address,
      abi,
      provider,
      // (withSignerIfPossible && account)
      //   ? account
      //   : undefined
    ) as T; // FIXME; not sure we should focibly cast this to T
  }, [
    provider,
    abi,
    addressOrAddressMap,
    account
  ]);
}

export function useBeanstalkContract() {
  return useContract<Beanstalk>(
    BEANSTALK_ADDRESSES,
    BEANSTALK_ABI,
    true,
  );
}

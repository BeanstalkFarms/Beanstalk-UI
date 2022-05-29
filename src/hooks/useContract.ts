import { SupportedChainId } from 'constants/chains';
import {
  Beanstalk,
  BeanstalkFertilizer,
  BeanstalkPrice,
  ERC20,
} from 'constants/generated';
import {
  AddressMap,
  BEANSTALK_ADDRESSES,
  BEANSTALK_FERTILIZER_ADDRESSES,
  BEANSTALK_PRICE_ADDRESSES,
} from 'constants/v2/addresses';
import { Contract } from 'ethers';
import { useMemo } from 'react';
import { useAccount, useNetwork, useProvider, useSigner } from 'wagmi';

const BEANSTALK_ABI = require('constants/abi/Beanstalk/Beanstalk.json');
const BEANSTALK_PRICE_ABI = require('constants/abi/Beanstalk/BeanstalkPrice.json');
const BEANSTALK_PRICE_V0_ABI = require('constants/abi/Beanstalk/BeanstalkPriceV0.json');
const BEANSTALK_FERTILIZER_ABI = require('constants/abi/Beanstalk/BeanstalkFertilizer.json');
const ERC20_ABI = require('constants/abi/ERC20.json');

export type AddressOrAddressMap = string | AddressMap | undefined;

export default function useContract<T extends Contract = Contract>(
  addressOrAddressMap: AddressOrAddressMap,
  abi: any,
  withSignerIfPossible = true
): T | null {
  const { data: _account } = useAccount();
  const { data: signer } = useSigner();
  const provider = useProvider();
  const account = withSignerIfPossible ? _account : null;

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

    let address: string | undefined;
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap;
    else address = addressOrAddressMap[chainId];

    if (!address) {
      console.debug(
        '[useContract] attempted to instantiate contract with no avail address',
        {
          addressOrAddressMap,
          chainId,
          account,
        }
      );
      return null;
    }

    console.debug('[useContract] initializing contract instance', {
      address,
      chainId,
    });

    return new Contract(
      address,
      abi,
      (withSignerIfPossible && signer)
        ? signer
        : provider
    ) as T; // FIXME; not sure we should focibly cast this to T
  }, [
    provider,
    signer,
    abi,
    withSignerIfPossible,
    addressOrAddressMap,
    account
  ]);
}

export function useBeanstalkContract() {
  return useContract<Beanstalk>(BEANSTALK_ADDRESSES, BEANSTALK_ABI, true);
}

export function useBeanstalkPriceContract() {
  const { activeChain } = useNetwork();
  return useContract<BeanstalkPrice>(
    BEANSTALK_PRICE_ADDRESSES,
    !activeChain || activeChain.id === SupportedChainId.MAINNET
      ? BEANSTALK_PRICE_V0_ABI
      : BEANSTALK_PRICE_ABI,
    true
  );
}

export function useBeanstalkFertilizerContract() {
  return useContract<BeanstalkFertilizer>(
    BEANSTALK_FERTILIZER_ADDRESSES,
    BEANSTALK_FERTILIZER_ABI,
    true
  );
}

export function useERC20Contract(addressOrAddressMap: AddressOrAddressMap) {
  return useContract<ERC20>(
    addressOrAddressMap,
    ERC20_ABI,
    true,
  );
}

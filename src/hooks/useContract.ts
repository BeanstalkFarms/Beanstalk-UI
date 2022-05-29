import { useWhatChanged } from '@simbathesailor/use-what-changed';
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
import { Contract, ContractInterface } from 'ethers';
import { useMemo } from 'react';
import { useAccount, useConnect, useContract, useNetwork, useProvider, useSigner } from 'wagmi';
import useChainId from './useChain';

const BEANSTALK_ABI = require('constants/abi/Beanstalk/Beanstalk.json');
const BEANSTALK_PRICE_ABI = require('constants/abi/Beanstalk/BeanstalkPrice.json');
const BEANSTALK_PRICE_V0_ABI = require('constants/abi/Beanstalk/BeanstalkPriceV0.json');
const BEANSTALK_FERTILIZER_ABI = require('constants/abi/Beanstalk/BeanstalkFertilizer.json');
const ERC20_ABI = require('constants/abi/ERC20.json');

export type AddressOrAddressMap = string | AddressMap;
export type AbiOrAbiMap = AddressMap<ContractInterface[]>;

export function useContractReadOnly<T extends Contract = Contract>(
  addressOrAddressMap: AddressOrAddressMap,
  abiOrAbiMap: AbiOrAbiMap,
): T | null {
  const chainId = useChainId();
  const provider = useProvider();
  const address = typeof addressOrAddressMap === 'string' ? addressOrAddressMap : addressOrAddressMap[chainId];
  const abi     = Array.isArray(abiOrAbiMap) ? abiOrAbiMap : abiOrAbiMap[chainId];
  const contract = useContract<T>({
    addressOrName: address,
    contractInterface: abi,
    signerOrProvider: provider,
  });

  return contract;

  // return useMemo(() => {
  //   // NOTE:
  //   // Here, we use the chainId from the `provider` itself to
  //   // determine which contract address to use. This prevents an
  //   // edge case where the `activeChain` provided by `useConnect()`
  //   // is changed before the provider is updated, causing an instance
  //   // of `useContract()` to be re-memoized. In downstream functions this
  //   // could trigger a refetch of data since effects depend on useContract.
  //   const _chainId = provider?._network.chainId;

  //   console.debug('[useContractReadOnly] attempting to init contract instance', {
  //     abi,
  //     addressOrAddressMap,
  //     _chainId,
  //     chainId
  //   });

  //   if (!addressOrAddressMap || !abi || !_chainId) return null;

  //   let address: string | undefined;
  //   if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap;
  //   else address = addressOrAddressMap[_chainId];

  //   if (!address) {
  //     console.debug(
  //       '[useContractReadOnly] attempted to instantiate contract with no avail address',
  //       {
  //         addressOrAddressMap,
  //         chainId: _chainId,
  //       }
  //     );
  //     return null;
  //   }

  //   console.debug('[useContractReadOnly] initializing contract instance', {
  //     address,
  //     chainId: _chainId,
  //   });

  //   return new Contract(
  //     address,
  //     abi,
  //     provider
  //   ) as T; // FIXME; not sure we should focibly cast this to T

  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [
  //   provider,
  //   addressOrAddressMap,
  //   abi,
  //   // chainId,
  // ]);
}

export default function useContract2<T extends Contract = Contract>(
  addressOrAddressMap: AddressOrAddressMap,
  abi: any,
  withSignerIfPossible = true
): T | null {
  // const { data, status } = useConnect();
  const { data: _account, status } = useAccount();
  const { data: signer } = useSigner();
  const provider = useProvider();
  // const chainId = useChainId()
  const account = withSignerIfPossible ? _account : null;

  console.debug(`[useContract] re-render `, status)

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

// --------------------------------------------------

export function useBeanstalkContract() {
  return useContractReadOnly<Beanstalk>(BEANSTALK_ADDRESSES, BEANSTALK_ABI);
}

const BEANSTALK_PRICE_ABIS = {
  [SupportedChainId.MAINNET]: BEANSTALK_PRICE_V0_ABI,
  [SupportedChainId.ROPSTEN]: BEANSTALK_PRICE_ABI
}

export function useBeanstalkPriceContract() {
  return useContractReadOnly<BeanstalkPrice>(
    BEANSTALK_PRICE_ADDRESSES,
    BEANSTALK_PRICE_ABIS,
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

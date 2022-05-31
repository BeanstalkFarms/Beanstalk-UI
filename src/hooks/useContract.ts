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
import { Contract, ContractInterface, ethers } from 'ethers';
import { useMemo } from 'react';
import {  useProvider, useSigner } from 'wagmi';
import { getChainConstant } from './useChainConstant';

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
): [T | null, SupportedChainId] {
  const provider  = useProvider();
  const address   = typeof addressOrAddressMap === 'string' ? addressOrAddressMap : getChainConstant(addressOrAddressMap, provider.network.chainId);
  const abi       = Array.isArray(abiOrAbiMap) ? abiOrAbiMap : getChainConstant(abiOrAbiMap, provider.network.chainId);
  return useMemo(
    () => {
      console.debug(`[useContractReadOnly] creating new instance of ${address}`);
      return [
        address
          ? new ethers.Contract(
            address,
            abi,
            provider
          ) as T
          : null,
        provider.network.chainId,
      ];
    },
    [address, abi, provider]
  );
  // if (!address) throw new Error('Attempted to instantiate contract without address.')
  // if (!abi)     throw new Error('Attempted to instantiate contract without ABI.')
  // console.debug(`[useContractReadOnly] contract = ${address}, chainId = ${provider.network.chainId}`, {
  //   abi,
  //   abiLength: abi.length,
  //   lbn: provider._lastBlockNumber,
  //   chainId: provider.network.chainId,
  // })
  // return useWagmiContract<T>({
  //   addressOrName: address,
  //   contractInterface: abi,
  //   signerOrProvider: provider,
  // });
}

export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: AddressOrAddressMap,
  abiOrAbiMap: AbiOrAbiMap,
  useSignerIfPossible: boolean = true
): [T | null, SupportedChainId] {
  const provider         = useProvider();
  const { data: signer } = useSigner();
  const chainId = provider.network.chainId;
  const address   = typeof addressOrAddressMap === 'string' ? addressOrAddressMap : getChainConstant(addressOrAddressMap, chainId);
  const abi       = Array.isArray(abiOrAbiMap) ? abiOrAbiMap : getChainConstant(abiOrAbiMap, chainId);
  const signerOrProvider = useSignerIfPossible && signer ? signer : provider;
  return useMemo(
    () => {
      console.debug(`[useContract] creating new instance of ${address}`);
      return [
        address 
          ? new ethers.Contract(
            address,
            abi,
            signerOrProvider
          ) as T
          : null,
        chainId,
      ];
    },
    [address, abi, signerOrProvider, chainId]
  );
  // if (!address) throw new Error('Attempted to instantiate contract without address.')
  // if (!abi)     throw new Error('Attempted to instantiate contract without ABI.')
  // return useWagmiContract<T>({
  //   addressOrName: address,
  //   contractInterface: abi,
  //   signerOrProvider: useSignerIfPossible && signer ? signer : provider,
  // });
}

// --------------------------------------------------

export function useBeanstalkContract() {
  return useContractReadOnly<Beanstalk>(
    BEANSTALK_ADDRESSES,
    BEANSTALK_ABI
  );
}

const BEANSTALK_PRICE_ABIS = {
  [SupportedChainId.MAINNET]: BEANSTALK_PRICE_V0_ABI,
  [SupportedChainId.ROPSTEN]: BEANSTALK_PRICE_ABI,
  [SupportedChainId.LOCALHOST]: BEANSTALK_PRICE_V0_ABI
};

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

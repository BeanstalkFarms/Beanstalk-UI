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
import { useContract as useWagmiContract, useProvider, useSigner } from 'wagmi';
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
  const chainId   = useChainId();
  const provider  = useProvider();
  const address   = typeof addressOrAddressMap === 'string' ? addressOrAddressMap : addressOrAddressMap[chainId];
  const abi       = Array.isArray(abiOrAbiMap) ? abiOrAbiMap : abiOrAbiMap[chainId];
  return useWagmiContract<T>({
    addressOrName: address,
    contractInterface: abi,
    signerOrProvider: provider,
  });
}

export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: AddressOrAddressMap,
  abiOrAbiMap: AbiOrAbiMap,
  useSignerIfPossible: boolean = true
): T | null {
  const chainId   = useChainId();
  const provider  = useProvider();
  const { data: signer } = useSigner();
  const address   = typeof addressOrAddressMap === 'string' ? addressOrAddressMap : addressOrAddressMap[chainId];
  const abi       = Array.isArray(abiOrAbiMap) ? abiOrAbiMap : abiOrAbiMap[chainId];
  return useWagmiContract<T>({
    addressOrName: address,
    contractInterface: abi,
    signerOrProvider: useSignerIfPossible && signer ? signer : provider,
  });
}

// --------------------------------------------------

export function useBeanstalkContract() {
  return useContractReadOnly<Beanstalk>(BEANSTALK_ADDRESSES, BEANSTALK_ABI);
}

const BEANSTALK_PRICE_ABIS = {
  [SupportedChainId.MAINNET]: BEANSTALK_PRICE_V0_ABI,
  [SupportedChainId.ROPSTEN]: BEANSTALK_PRICE_ABI
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

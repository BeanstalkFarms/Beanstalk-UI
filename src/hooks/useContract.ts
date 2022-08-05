import { SupportedChainId } from 'constants/chains';
import {
  Beanstalk,
  BeaNFTGenesis,
  BeaNFTWinter,
  BeanstalkFertilizer,
  BeanstalkPrice,
  ERC20,
} from 'generated/index';
import {
  BEANFT_GENESIS_ADDRESSES, BEANFT_WINTER_ADDRESSES,
  BEANSTALK_ADDRESSES,
  BEANSTALK_FERTILIZER_ADDRESSES,
  BEANSTALK_PRICE_ADDRESSES,
} from 'constants/addresses';
import { ChainConstant } from 'constants/index';
import { Contract, ContractInterface, ethers } from 'ethers';
import { useCallback, useMemo } from 'react';
import { useProvider, useContract as useWagmiContract } from 'wagmi';
import { useSigner } from 'hooks/ledger/useSigner';
import { getChainConstant } from 'util/Chain';
import useChainConstant from './useChainConstant';

// -------------------------------------------------

const BEANSTALK_ABI = require('constants/abi/Beanstalk/Beanstalk.json');
const BEANSTALK_REPLANTED_ABI = require('constants/abi/Beanstalk/BeanstalkReplanted.json');
const BEANSTALK_PRICE_ABI = require('constants/abi/Beanstalk/BeanstalkPrice.json');
const BEANSTALK_PRICE_V0_ABI = require('constants/abi/Beanstalk/BeanstalkPriceV0.json');
const BEANSTALK_PRICE_REPLANTED_ABI = require('constants/abi/Beanstalk/BeanstalkPriceReplanted.json');
const BEANSTALK_FERTILIZER_ABI = require('constants/abi/Beanstalk/BeanstalkFertilizer.json');
const ERC20_ABI = require('constants/abi/ERC20.json');
const BEANFT_GENESIS_ABI = require('constants/abi/BeaNFT/BeaNFTGenesis.json');
const BEANFT_WINTER_ABI = require('constants/abi/BeaNFT/BeaNFTWinter.json');

export type AddressOrAddressMap = string | ChainConstant<string>;
export type AbiOrAbiMap = ContractInterface | ChainConstant<ContractInterface>;

// -------------------------------------------------

export function useContractReadOnly<T extends Contract = Contract>(
  addressOrAddressMap: AddressOrAddressMap,
  abiOrAbiMap: AbiOrAbiMap,
): [T | null, SupportedChainId] {
  const provider  = useProvider();
  const address   = typeof addressOrAddressMap === 'string' ? addressOrAddressMap : getChainConstant(addressOrAddressMap, provider.network.chainId);
  const abi       = Array.isArray(abiOrAbiMap) ? abiOrAbiMap : getChainConstant(abiOrAbiMap as ChainConstant<ContractInterface>, provider.network.chainId);
  return useMemo(
    () => 
      // console.debug(`[useContractReadOnly] creating new instance of ${address}`);
       [
        address
          ? new ethers.Contract(
            address,
            abi,
            provider
          ) as T
          : null,
        provider.network.chainId,
      ],    
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

export function useGetContract<T extends Contract = Contract>(
  abiOrAbiMap: AbiOrAbiMap,
  useSignerIfPossible: boolean = true
): (addressOrAddressMap: AddressOrAddressMap) => [T | null, SupportedChainId] {
  const provider         = useProvider();
  const { data: signer } = useSigner();
  const chainId          = provider.network.chainId;
  const abi              = Array.isArray(abiOrAbiMap) ? abiOrAbiMap : getChainConstant(abiOrAbiMap as ChainConstant<ContractInterface>, chainId);
  const signerOrProvider = useSignerIfPossible && signer ? signer : provider;
  // useWhatChanged([abi,signerOrProvider,chainId], 'abi,signerOrProvider,chainId');
  
  // 
  return useCallback(
    (addressOrAddressMap: AddressOrAddressMap) => {
      const address   = typeof addressOrAddressMap === 'string' ? addressOrAddressMap : getChainConstant(addressOrAddressMap, chainId);
      // console.debug(`[useGetContract] creating new instance of ${address}, ${abi.length}, ${signerOrProvider}, ${chainId}`);
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
    [abi, signerOrProvider, chainId]
  );
}

export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: AddressOrAddressMap,
  abiOrAbiMap: AbiOrAbiMap,
  useSignerIfPossible: boolean = true
): [T | null, SupportedChainId] {
  const getContract = useGetContract(abiOrAbiMap, useSignerIfPossible);
  return getContract(addressOrAddressMap) as [T | null, SupportedChainId]; // FIXME: hard casting
}

// --------------------------------------------------

const BEANSTALK_PRICE_ABIS = {
  [SupportedChainId.MAINNET]: BEANSTALK_PRICE_REPLANTED_ABI,
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

export function useGetERC20Contract() {
  return useGetContract<ERC20>(
    ERC20_ABI,
    true
  );
}

export function useERC20Contract(addressOrAddressMap: AddressOrAddressMap) {
  const get = useGetERC20Contract();
  return get(addressOrAddressMap);
}

// --------------------------------------------------

export function useFertilizerContract(signer?: ethers.Signer | null) {
  const fertAddress = useChainConstant(BEANSTALK_FERTILIZER_ADDRESSES);
  const provider = useProvider();
  return useWagmiContract<BeanstalkFertilizer>({
    addressOrName: fertAddress,
    contractInterface: BEANSTALK_FERTILIZER_ABI,
    signerOrProvider: signer || provider,
  });
}

const BEANSTALK_ABIS = {
  [SupportedChainId.MAINNET]:   BEANSTALK_REPLANTED_ABI,
};

export function useBeanstalkContract(signer?: ethers.Signer | null) {
  const address   = useChainConstant(BEANSTALK_ADDRESSES);
  const abi       = useChainConstant(BEANSTALK_ABIS);
  const provider  = useProvider();
  return useWagmiContract<Beanstalk>({
    addressOrName: address,
    contractInterface: abi,
    signerOrProvider: signer || provider,
  });
}

const BEANFT_GENESIS_ABIS = {
  [SupportedChainId.MAINNET]:   BEANFT_GENESIS_ABI,
};

export function useGenesisNFTContract(signer?: ethers.Signer | null) {
  const address = useChainConstant(BEANFT_GENESIS_ADDRESSES);
  const abi     = useChainConstant(BEANFT_GENESIS_ABIS);
  const provider = useProvider();
  return useWagmiContract<BeaNFTGenesis>({
    addressOrName: address,
    contractInterface: abi,
    signerOrProvider: signer || provider,
  });
}

const BEANFT_WINTER_ABIS = {
  [SupportedChainId.MAINNET]:   BEANFT_WINTER_ABI,
};

export function useWinterNFTContract(signer?: ethers.Signer | null) {
  const address = useChainConstant(BEANFT_WINTER_ADDRESSES);
  const abi     = useChainConstant(BEANFT_WINTER_ABIS);
  const provider = useProvider();
  return useWagmiContract<BeaNFTWinter>({
    addressOrName: address,
    contractInterface: abi,
    signerOrProvider: signer || provider,
  });
}

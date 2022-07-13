import { Contract as MulticallContract, Provider as MulticallProvider } from 'ethers-multicall';
import { ethers } from 'ethers';
import { useProvider } from 'wagmi';
import { useMemo } from 'react';
import { Fragment } from 'ethers/lib/utils';

declare module "ethers-multicall" {
  class Provider {
    getEthBalance(address: string): Promise<ethers.BigNumber>;
  }
}

export const wrapMulticall = <T extends ethers.Contract>(contract: T) => {
  return new MulticallContract(
    contract.address,
    contract.interface.fragments as Fragment[]
  ) as unknown as T;
}

const useMulticall = () => {
  const provider = useProvider();
  const multicallProvider = useMemo(() => {
    return new MulticallProvider(provider, provider.network.chainId);
  }, [provider]);
  
  return [multicallProvider, wrapMulticall] as const;
}

export default useMulticall;
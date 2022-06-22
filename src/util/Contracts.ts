import { ethers } from 'ethers';
import { ERC20__factory } from 'constants/generated/factories/ERC20__factory';
import client from './Client';

// -- Contracts
export const erc20TokenContract = (address: string, signer?: ethers.Signer) =>
  ERC20__factory.connect(address, signer || client.provider);

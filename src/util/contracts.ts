import { ethers } from 'ethers';
// import {
//   BEANSTALK,
//   BEANFTCOLLECTION,
//   BEANFTGENESIS,
//   UNISWAP_V2_ROUTER,
// } from 'constants/index';

import { ERC20__factory } from 'constants/generated/factories/ERC20__factory';
import {
  BeanstalkPrice__factory,
} from 'constants/generated';
import { BEANSTALK_PRICE_ADDRESSES } from 'constants/addresses';
import { SupportedChainId } from 'constants/chains';
import client from './wagmi';

// -- Contracts
export const erc20TokenContract = (address: string, signer?: ethers.Signer) =>
  ERC20__factory.connect(address, signer || client.provider);

export const beanstalkPriceContract = () =>
  BeanstalkPrice__factory.connect(
    BEANSTALK_PRICE_ADDRESSES[SupportedChainId.ROPSTEN],
    client.provider
  );

// export const beanstalkContract = (signer?: ethers.Signer) =>
//   Beanstalk__factory.connect(BEANSTALK, signer || client.provider);

// export const beaNFTGenesisContract = (signer?: ethers.Signer) =>
//   BeaNFTGenesis__factory.connect(BEANFTGENESIS, signer || client.provider);

// export const beaNFTWinterContract = (signer?: ethers.Signer) =>
//   BeaNFTGenesis__factory.connect(BEANFTCOLLECTION, signer || client.provider);

// export const uniswapRouterContract = (signer?: ethers.Signer) =>
//   UniswapV2Router__factory.connect(
//     UNISWAP_V2_ROUTER,
//     signer || client.provider
//   );

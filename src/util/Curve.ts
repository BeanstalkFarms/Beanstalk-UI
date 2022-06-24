import curve from '@curvefi/api';
import { SupportedChainId } from 'constants/index';
import { ethers } from 'ethers';
import { TESTNET_RPC_ADDRESSES } from './Client';

export async function initCurve(chainId : SupportedChainId = 1) {
  // await curve.init('JsonRpc', {}, {});
  // switch(chainId) {
  //   case SupportedChainId.HARDHAT:
  //   case SupportedChainId.LOCALHOST:
  //     console.debug(`[initCurve] initializing with testnet ${TESTNET_RPC_ADDRESSES[chainId]} ${chainId}`)
  //     break;
  //   default:
  //     await curve.init(
  //       'Alchemy',
  //       { apiKey: 'f06l9TnsZyxvF0JaPzjoWQ_6baS5hEQs' },
  //       { chainId }
  //     );
  //     break;
  // }
  if (TESTNET_RPC_ADDRESSES[chainId]) {
    console.debug('[curve/init] using Web3');
    await curve.init(
      'JsonRpc',
      { url: TESTNET_RPC_ADDRESSES[chainId] },
      { chainId: 1 }
    );
  } else {
    console.debug('[curve/init] using Alchemy');
    await curve.init(
      'Alchemy',
      { apiKey: 'f06l9TnsZyxvF0JaPzjoWQ_6baS5hEQs' },
      { chainId }
    );
  }
  console.debug('[curve/init] initialized instance');
  await Promise.all([
    curve.fetchFactoryPools(),
    curve.fetchCryptoFactoryPools(),
  ]);
  console.debug('[curve/init] fetched pools');
  return curve;
}

export default curve;
